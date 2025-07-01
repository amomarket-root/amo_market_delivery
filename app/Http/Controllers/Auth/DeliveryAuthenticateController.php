<?php

namespace App\Http\Controllers\Auth;

use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\Controller;
use App\Mail\DeliveryResetPasswordMail;
use App\Mail\PasswordResetSuccessMail;
use App\Mail\RegistrationMail;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use App\Services\FileHandlerService;
use App\Models\PasswordResetToken;
use Illuminate\Validation\Rule;
use App\Models\Role;
use App\Models\DeliveryPerson;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\Avatar;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class DeliveryAuthenticateController extends Controller
{
    protected $fileHandlerService;

    public function __construct(FileHandlerService $fileHandlerService)
    {
        $this->fileHandlerService = $fileHandlerService;
    }
    /**
     * Create User
     * @param Request $request
     * @return User
     */
    public function register(Request $request)
    {
        try {
            $validateUser = Validator::make($request->all(), [
                'name' => 'required',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|string|min:6|confirmed',
            ]);

            if ($validateUser->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation error',
                    'errors' => $validateUser->errors()
                ], 422); // Changed to 422 Unprocessable Entity
            }

            $roleId = Role::where('name', 'Delivery')->first()->id;

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role_id' => $roleId,
                'status' => 1
            ]);

            $maskedPassword = substr($request->password, 0, 2) . str_repeat('*', strlen($request->password) - 4) . substr($request->password, -2);

           // Send registration email
           Mail::to($user->email)->queue(new RegistrationMail($user->email, $maskedPassword));

            return response()->json([
                'status' => true,
                'message' => 'Registration success',
                'info' => 'Please navigate to the login page, and after logging in, you can start using our service.'
            ], 201); // Use 201 Created for successful registration
        } catch (\Throwable $th) {
            return response()->json([
                'status' => false,
                'message' => 'An error occurred during registration. Please try again later.'
            ], 500);
        }
    }

    /**
     * Login The User
     * @param Request $request
     * @return User
     */
    public function login(Request $request)
    {
        try {
            $validateUser = Validator::make(
                $request->all(),
                [
                    'email' => 'required|email',
                    'password' => 'required'
                ]
            );

            if ($validateUser->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation error',
                    'errors' => $validateUser->errors()
                ], 401);
            }

            if (!Auth::attempt($request->only(['email', 'password']))) {
                return response()->json([
                    'status' => false,
                    'message' => 'Email & Password do not match our records.',
                    'info' => 'Please check your credentials and try again. If you have forgotten your password, use the "Forgot Password" option to reset it.'
                ], 401);
            }

            $user = Auth::user();

            if (is_null($user->role_id) || $user->role_id === '' || $user->status === '0' || is_null($user->status) || $user->status === '') {
                return response()->json([
                    'status' => false,
                    'message' => 'Account is inactive!',
                    'info' => "Please contact your Amo Market Administrator to activate your account."
                ], 403);
            }

            // Retrieve the delivery person details
            $deliveryPerson = DeliveryPerson::where('user_id', $user->id)->first();
            $deliveryPersonId = $deliveryPerson ? $deliveryPerson->id : null; // Get delivery_person_id if exists

            if ($user->has_entered_details && $deliveryPerson) {
                if (is_null($deliveryPerson->status) || $deliveryPerson->status === '' || $deliveryPerson->status === 0) {
                    return response()->json([
                        'status' => false,
                        'message' => 'Account Not Approved!',
                        'info' => "Your account details have been saved but are not yet approved. Once our agent verifies the details and documents, it will be automatically approved."
                    ], 403);
                }
            }

            // Update the user's login time
            $user->update(['login_time' => Carbon::now()]);

            return response()->json([
                'status' => true,
                'message' => 'User Logged In Successfully',
                'user_name' => $user->name,
                'delivery_person_id' => $deliveryPersonId, // Include delivery_person_id
                'delivery_token' => $user->createToken("API TOKEN")->plainTextToken
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => false,
                'message' => $th->getMessage()
            ], 500);
        }
    }


    /**
     * Forgot Password For Admin
     * @param Request $request
     *
     */
    public function forgotPassword(Request $request)
    {
        try {
            $validateUser = Validator::make(
                $request->all(),
                [
                    'email' => 'required|email'
                ]
            );

            if ($validateUser->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'validation error',
                    'errors' => $validateUser->errors()
                ], 401);
            }


            $user = User::where('email', $request->email)->first();

            if (!$user) {
                return response()->json([
                    'status' => false,
                    'message' => 'User not found',
                    'info' => "Please ensure you have registered with us. If you believe this is a mistake, contact support for Amo Market administrator."
                ], 404);
            }

            // Generate unique token
            $token = Str::random(60);

            // Store token in password_reset_tokens table
            PasswordResetToken::updateOrCreate(
                ['email' => $user->email],
                ['token' => $token]
            );

            // Send reset link to user's email
            Mail::to($user->email)->queue(new DeliveryResetPasswordMail($token));

            return response()->json([
                'status' => true,
                'message' => 'Reset link sent to your email'
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => false,
                'message' => $th->getMessage()
            ], 500);
        }
    }
    /**
     * Reset user's password.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function resetPassword(Request $request)
    {
        try {
            $validateUser = Validator::make(
                $request->all(),
                [
                    'token' => 'required|string',
                    'password' => 'required|string|min:6|confirmed',
                ]
            );

            if ($validateUser->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'validation error',
                    'errors' => $validateUser->errors()
                ], 401);
            }

            $passwordReset = PasswordResetToken::where('token', $request->token)->first();
            if (!$passwordReset) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid or expired token. Try again.',
                    'info' => 'The password reset link may have expired or is incorrect. Please request a new password reset link to proceed.'
                ], 400);
            }

            $user = User::where('email', $passwordReset->email)->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found.',
                    'info' => 'Please ensure you have registered with us. If you believe this is a mistake, contact support for assistance.'
                ], 404);
            }

            $user->update([
                'password' => bcrypt($request->password),
            ]);

            $passwordReset->delete();

            // **Send Password Reset Success Email**
            Mail::to($user->email)->queue(new PasswordResetSuccessMail($user));

            return response()->json([
                'success' => true,
                'message' => 'Password has been reset successfully.',
                'info' => 'Go to the login page. After authentication, you can use our features.',
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => false,
                'message' => $th->getMessage()
            ], 500);
        }
    }

    /**
     * Logout user's password.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        try {
            // Get the currently authenticated user
            $user = Auth::check() ? Auth::user() : null;

            if (!$user) {
                return response()->json([
                    'status' => false,
                    'message' => 'No user logged in'
                ], 401);
            }

            $user->update(['logout_time' => Carbon::now()]);
            $user->currentAccessToken()->delete();

            return response()->json([
                'status' => true,
                'message' => 'Logout successfully.'
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => false,
                'message' => $th->getMessage()
            ], 500);
        }
    }

    /**
     * Change User password.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function changePassword(Request $request)
    {
        try {
            // Validate the request
            $validator = Validator::make($request->all(), [
                'old_password' => 'required|string|min:6',
                'password' => 'required|string|min:6|confirmed',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors(),
                ], 400);
            }

            // Retrieve the authenticated user
            $user = Auth::user();

            // Check if the old password matches
            if (!Hash::check($request->old_password, $user->password)) {
                return response()->json([
                    'status' => false,
                    'message' => 'Old Password Is Incorrect. Try Again..',
                ], 400);
            }

            // Update the password
            $user->update([
                'password' => Hash::make($request->password),
            ]);

            return response()->json([
                'status' => true,
                'message' => 'Password updated successfully.',
                'user' => $user,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'An error occurred: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * User Profile.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function viewProfile()
    {
        try {
            // Get the currently authenticated user
            $user = Auth::user()->load('role', 'avatar'); // No need for the check, it will return null if not authenticated

            if (!$user) {
                return response()->json([
                    'status' => false,
                    'message' => 'No user logged in'
                ], 401);
            }

            // Return the user details as response
            return response()->json([
                'status' => true,
                'user' => $user
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => false,
                'message' => $th->getMessage()
            ], 500);
        }
    }

    /**
     * User Profile.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateProfile(Request $request)
    {
        try {
            // Get the authenticated user
            $user = Auth::user();

            // Validate user input
            $validator = Validator::make($request->all(), [
                'name' => 'required',
                'role_id' => 'required',
                'email' => [
                    'required',
                    'email',
                    Rule::unique('users', 'email')->ignore($user->id), // Exclude the current user's email
                ],
            ]);

            // Conditional validation for avatar field
            $validator->sometimes('main_avatar', 'image|mimes:jpeg,png,jpg,gif|max:2048', function ($input) {
                return is_file($input->main_avatar);
            })->sometimes('main_avatar', 'integer', function ($input) {
                return is_numeric($input->main_avatar) && !is_file($input->main_avatar);
            });

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors(),
                ], 400);
            }

            // Optionally, check if the user is allowed to update the provided 'user_id' (if different from their own)
            if ($request->user_id && $user->id != $request->user_id) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized action.',
                ], 403);
            }

            // Find the user by ID (if user_id is provided)
            $userToUpdate = User::with('avatar')->findOrFail($request->user_id ?: $user->id);

            $avatarId = null;

            if ($request->has('main_avatar')) {
                // Check if main_avatar is a file upload
                if ($request->file('main_avatar')) {
                    $email = $userToUpdate->email;
                    $dir_path = "/user/avatar/" . $email;
                    $avatarUrl = $this->fileHandlerService->saveFileToStorage($request->file('main_avatar'), $dir_path); // Implement saveFileToStorage here

                    // Save the uploaded avatar data
                    $avatar = Avatar::create([
                        'path' => $avatarUrl,
                    ]);
                    $avatarId = $avatar->id;
                }
                // Check if main_avatar is a numeric ID
                elseif (is_numeric($request->main_avatar)) {
                    $avatarId = $request->main_avatar;
                } else {
                    // Explicitly set avatarId to null if the value is not valid
                    $avatarId = null;
                }
            }

            $updateData = [
                'name' => $request->name,
                'email' => $request->email,
                'role_id' => $request->role_id,
            ];

            if (!is_null($avatarId)) {
                $updateData['avatar_id'] = $avatarId;
            } else {
                Log::info('No valid Avatar ID, skipping avatar_id update.');
            }

            // Update user data without setting `avatar_id` as null
            $userToUpdate->update($updateData);

            return response()->json([
                'status' => true,
                'message' => 'Profile Updated Successfully.',
                'data' => $userToUpdate,
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => false,
                'message' => $th->getMessage(),
            ], 500);
        }
    }
}
