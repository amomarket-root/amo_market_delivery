<?php

namespace App\Http\Controllers\Delivery;


use Throwable;
use Exception;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use App\Services\DeliveryPersonService;
use Illuminate\Support\Facades\Validator;
use App\Events\DeliveryLiveLocationUpdateEvent;

class DeliveryPersonController extends Controller
{
    protected $deliveryPersonService;

    public function __construct(DeliveryPersonService $deliveryPersonService)
    {
        $this->deliveryPersonService = $deliveryPersonService;
    }

    public function checkDeliveryPersonDocument(Request $request) // Renamed to match service
    {
        try {
            // Call the service to check delivery person document
            $result = $this->deliveryPersonService->checkDeliveryPersonDocument();

            return response()->json([
                'status' => $result['success'],
                'message' => $result['message'],
                'data' => $result['data'] ?? null,
            ], $result['success'] ? 200 : 400);
        } catch (Throwable $th) {
            return response()->json([
                'status' => false,
                'message' => $th->getMessage(),
            ], 500);
        }
    }
    public function saveDeliveryPersonDetails(Request $request)
    {
        try {
            // Validate the request data
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255|unique:delivery_persons,name',
                'number' => 'required|string|max:15|unique:delivery_persons,number',
                'driving_license' => 'nullable|string|max:20|unique:delivery_persons,driving_license',
                'license_document' => 'nullable|file|mimes:jpeg,png,jpg|max:2048',
                'PAN_Number' => 'required|string|max:20|unique:delivery_persons,PAN_Number',
                'PAN_Photo' => 'nullable|file|mimes:jpeg,png,jpg|max:2048',
                'delivery_mode' => 'required|string|in:motorcycle,electric_vehicle,bicycle',
                'vehicle_number' => 'required|string|max:20',
                'location' => 'required|string|max:255',
                'latitude' => 'required|string|max:20',
                'longitude' => 'required|string|max:20',
                'online_status' => 'required|boolean',
                'status' => 'required|boolean',
            ]);

            // If validation fails, return error response
            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors(),
                ], 400);
            }

            // Store delivery person details using the service
            $deliveryPerson = $this->deliveryPersonService->saveDeliveryPersonDetails($request);

            // Ensure user exists before updating
            /** @var User $user */

            // Update user's flag
            $user = Auth::user();
            if ($user) {
                $user->has_entered_details = true;
                $user->save();
            }

            return response()->json([
                'status' => true,
                'message' => 'Delivery person details saved successfully',
                'data' => $deliveryPerson,
            ], 200);
        } catch (Throwable $th) {
            // Handle exceptions
            return response()->json([
                'status' => false,
                'message' => 'Failed to save delivery person details',
                'error' => $th->getMessage(),
            ], 500);
        }
    }
    /**
     * Toggle the deliveryPerson's online status.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function toggleOnlineStatus()
    {
        try {
            // Call the service to toggle online status
            $deliveryPerson = $this->deliveryPersonService->toggleOnlineStatus();

            if ($deliveryPerson) {
                $status = $deliveryPerson->online_status === 1 ? 'online' : 'offline';
                return response()->json([
                    'message' => "Delivery Person is now {$status}",
                    'deliveryPerson' => $deliveryPerson,
                ], 200);
            }

            return response()->json(['message' => 'Delivery Person not found'], 404);
        } catch (Throwable $th) {
            // Handle any exceptions
            return response()->json([
                'status' => false,
                'message' => $th->getMessage(),
            ], 500);
        }
    }

    /**
     * Get the deliveryPerson's online status.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getOnlineStatus()
    {
        try {
            // Call the service to get online status
            $deliveryPerson = $this->deliveryPersonService->getDeliveryPersonOnlineStatus();

            if ($deliveryPerson) {
                $status = $deliveryPerson->online_status === 1 ? 'online' : 'offline';
                return response()->json([
                    'message' => "Delivery Person is currently {$status}",
                    'status' => $deliveryPerson->online_status,
                ], 200);
            }

            return response()->json(['message' => 'Delivery Person not found'], 404);
        } catch (Throwable $th) {
            // Handle any exceptions
            return response()->json([
                'status' => false,
                'message' => $th->getMessage(),
            ], 500);
        }
    }
    public function getDeliveryDetails(Request $request)
    {
        try {
            $filters = [
                'time_filter' => $request->input('time_filter', 'all'),
                'per_page' => $request->input('per_page', 10),
                'page' => $request->input('page', 1),
            ];

            $deliveryDetails = $this->deliveryPersonService->getDeliveryDetails($filters);

            if ($deliveryDetails) {
                return response()->json([
                    'status' => true,
                    'message' => 'Delivery details retrieved successfully',
                    'data' => $deliveryDetails,
                ], 200);
            }

            return response()->json([
                'status' => false,
                'message' => 'Delivery details not found',
            ], 404);
        } catch (Throwable $th) {
            return response()->json([
                'status' => false,
                'message' => $th->getMessage(),
            ], 500);
        }
    }
    public function getOrderMetrics()
    {
        $metrics = $this->deliveryPersonService->getOrderMetrics();
        return response()->json($metrics);
    }
    public function getLocation()
    {
        try {
            // Call the service to get online status
            $deliveryPersonLocation = $this->deliveryPersonService->getLocation();

            if (!$deliveryPersonLocation) {
                return response()->json([
                    'status' => false,
                    'message' => 'Delivery Person Location not set.',
                ], 404);
            }

            return response()->json([
                'status' => true,
                'message' => 'Delivery Person Location Found Successfully.',
                'data' => $deliveryPersonLocation,
            ], 200);
        } catch (Throwable $th) {
            // Handle any exceptions
            return response()->json([
                'status' => false,
                'message' => $th->getMessage(),
            ], 500);
        }
    }
    public function UpdateLocation(Request $request)
    {
        try {
            // Validate the ID parameter
            $validator = Validator::make($request->all(), [
                'id' => 'required|string|exists:delivery_persons,id',
                'location' => 'required|string',
                'latitude' => 'required|string',
                'longitude' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors(),
                ], 400);
            }

            // Update the delivery Person location
            $deliveryPersonLocation = $this->deliveryPersonService->UpdateLocation($request->all());

            if (!$deliveryPersonLocation) {
                return response()->json([
                    'status' => false,
                    'message' => 'Delivery Person not found or unauthorized.',
                ], 404);
            }

            return response()->json([
                'status' => true,
                'message' => 'Delivery Person Location Updated Successfully.',
                'data' => $deliveryPersonLocation,
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'An error occurred while updating delivery Person location.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function getAll()
    {
        $deliveryPersons = $this->deliveryPersonService->getAll();

        if ($deliveryPersons->isEmpty()) {
            return response()->json([
                'status' => false,
                'message' => 'No Delivery Persons Found.',
            ], 404);
        }

        return response()->json([
            'status' => true,
            'message' => 'Delivery Persons Retrieved Successfully.',
            'data' => $deliveryPersons,
        ], 200);
    }

    public function getPaginate(Request $request)
    {
        try {
            $deliveryPersons = $this->deliveryPersonService->getPaginate($request->all());

            if ($deliveryPersons->isEmpty()) {
                return response()->json([
                    'status' => false,
                    'message' => 'No Delivery Persons Found.',
                ], 404);
            }

            return response()->json([
                'status' => true,
                'message' => 'Delivery Persons Retrieved Successfully.',
                'data' => $deliveryPersons,
            ], 200);
        } catch (Throwable $th) {
            return response()->json([
                'status' => false,
                'message' => $th->getMessage(),
            ], 500);
        }
    }

    public function create(Request $request)
    {
        try {
            // Validate request data
            $validator = $this->deliveryPersonService->validateCreateDeliveryPersonData($request->all());

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors(),
                ], 400);
            }

            // Pass the entire request object instead of request->all()
            $deliveryPerson = $this->deliveryPersonService->createDeliveryPerson($request);

            return response()->json([
                'status' => true,
                'message' => 'Delivery Person Added Successfully.',
                'data' => $deliveryPerson,
            ], 200);
        } catch (Throwable $th) {
            return response()->json([
                'status' => false,
                'message' => $th->getMessage(),
            ], 500);
        }
    }


    public function get(Request $request)
    {
        try {
            $validator = $this->deliveryPersonService->validateDeliveryPersonId($request->all());

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors(),
                ], 400);
            }

            $deliveryPerson = $this->deliveryPersonService->getDeliveryPersonById($request->id);

            return response()->json([
                'status' => true,
                'message' => 'Delivery Person Retrieved Successfully.',
                'data' => $deliveryPerson,
            ], 200);
        } catch (Throwable $th) {
            return response()->json([
                'status' => false,
                'message' => $th->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request)
    {
        try {
            // Validate request data
            $validator = $this->deliveryPersonService->validateUpdateDeliveryPersonData($request->all());

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors(),
                ], 400);
            }

            // Pass the entire request object instead of request->all()
            $deliveryPerson = $this->deliveryPersonService->updateDeliveryPerson($request);

            return response()->json([
                'status' => true,
                'message' => 'Delivery Person Updated Successfully.',
                'data' => $deliveryPerson,
            ], 200);
        } catch (Throwable $th) {
            return response()->json([
                'status' => false,
                'message' => $th->getMessage(),
            ], 500);
        }
    }

    public function delete(Request $request)
    {
        try {
            $validator = $this->deliveryPersonService->validateDeliveryPersonId($request->all());

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors(),
                ], 400);
            }

            $deliveryPerson = $this->deliveryPersonService->deleteDeliveryPerson($request->id);

            return response()->json([
                'status' => true,
                'message' => 'Delivery Person Deleted Successfully.',
                'data' => $deliveryPerson,
            ], 200);
        } catch (Throwable $th) {
            return response()->json([
                'status' => false,
                'message' => $th->getMessage(),
            ], 500);
        }
    }
    public function updateLiveLocation(Request $request)
    {
        $orderId = $request->input('order_id');
        $latitude = $request->input('latitude');
        $longitude = $request->input('longitude');

        // Broadcast the location update
        try {
            event(new DeliveryLiveLocationUpdateEvent($orderId, $latitude, $longitude));
        } catch (Exception $e) {
            Log::error("Failed to broadcast WebSocket event", ['error' => $e->getMessage()]);
        }

        return response()->json(['message' => 'Live Location updated successfully']);
    }
}
