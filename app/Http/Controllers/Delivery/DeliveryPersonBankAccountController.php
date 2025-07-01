<?php

namespace App\Http\Controllers\Delivery;

use App\Services\DeliveryPersonBankAccountService;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use App\Models\DeliveryPerson;
use Illuminate\Http\Request;
use Throwable;

class DeliveryPersonBankAccountController extends Controller
{
    protected $bankAccountService;

    public function __construct(DeliveryPersonBankAccountService $bankAccountService)
    {
        $this->bankAccountService = $bankAccountService;
    }

    /**
     * Get all bank accounts for the authenticated delivery person
     */
    public function index()
    {
        try {
            $deliveryPerson = $this->getAuthenticatedDeliveryPerson();
            $bankAccounts = $this->bankAccountService->getAllBankAccounts($deliveryPerson->id);

            return response()->json([
                'status' => true,
                'message' => 'Bank accounts retrieved successfully',
                'data' => $bankAccounts,
            ]);
        } catch (Throwable $th) {
            return response()->json([
                'status' => false,
                'message' => $th->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created bank account
     */
    public function store(Request $request)
    {
        try {
            $deliveryPerson = $this->getAuthenticatedDeliveryPerson();

            $validatedData = $request->validate([
                'account_holder_name' => 'required|string|max:255',
                'account_number' => 'required|string|max:50',
                'bank_name' => 'required|string|max:255',
                'branch_name' => 'required|string|max:255',
                'ifsc_code' => 'required|string|max:50',
                'account_type' => 'required|in:savings,current',
                'upi_id' => 'nullable|string|max:255',
            ]);

            $bankAccount = $this->bankAccountService->createBankAccount(
                $deliveryPerson->id,
                $validatedData
            );

            return response()->json([
                'status' => true,
                'message' => 'Bank account created successfully',
                'data' => $bankAccount,
            ], 201);
        } catch (Throwable $th) {
            return response()->json([
                'status' => false,
                'message' => $th->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified bank account
     */
    public function show(string $id)
    {
        try {
            $deliveryPerson = $this->getAuthenticatedDeliveryPerson();
            $bankAccount = $this->bankAccountService->getBankAccount($deliveryPerson->id, $id);

            return response()->json([
                'status' => true,
                'message' => 'Bank account retrieved successfully',
                'data' => $bankAccount,
            ]);
        } catch (Throwable $th) {
            return response()->json([
                'status' => false,
                'message' => $th->getMessage(),
            ], 500);
        }
    }

    /**
     * Update the specified bank account
     */
    public function update(Request $request, string $id)
    {
        try {
            $deliveryPerson = $this->getAuthenticatedDeliveryPerson();

            $validatedData = $request->validate([
                'account_holder_name' => 'sometimes|string|max:255',
                'account_number' => 'sometimes|string|max:50',
                'bank_name' => 'sometimes|string|max:255',
                'branch_name' => 'sometimes|string|max:255',
                'ifsc_code' => 'sometimes|string|max:50',
                'account_type' => 'sometimes|in:savings,current',
                'upi_id' => 'nullable|string|max:255',
                'is_verified' => 'sometimes|boolean',
            ]);

            $bankAccount = $this->bankAccountService->updateBankAccount(
                $deliveryPerson->id,
                $id,
                $validatedData
            );

            return response()->json([
                'status' => true,
                'message' => 'Bank account updated successfully',
                'data' => $bankAccount,
            ]);
        } catch (Throwable $th) {
            return response()->json([
                'status' => false,
                'message' => $th->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified bank account
     */
    public function destroy(string $id)
    {
        try {
            $deliveryPerson = $this->getAuthenticatedDeliveryPerson();
            $this->bankAccountService->deleteBankAccount($deliveryPerson->id, $id);

            return response()->json([
                'status' => true,
                'message' => 'Bank account deleted successfully',
            ], 204);
        } catch (Throwable $th) {
            return response()->json([
                'status' => false,
                'message' => $th->getMessage(),
            ], 500);
        }
    }

    /**
     * Get the authenticated delivery person
     */
    private function getAuthenticatedDeliveryPerson()
    {
        $user = Auth::user();
        return DeliveryPerson::where('user_id', $user->id)->firstOrFail();
    }
}
