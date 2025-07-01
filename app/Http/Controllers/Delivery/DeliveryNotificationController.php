<?php

namespace App\Http\Controllers\Delivery;

use Exception;
use Throwable;
use Illuminate\Http\Request;
use App\Models\DeliveryPerson;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use App\Models\DeliveryNotification;
use Illuminate\Support\Facades\Validator;

class DeliveryNotificationController extends Controller
{
    /**
     * Get notifications for a delivery person.
     */
    public function deliveryNotifications()
    {
        try {
            $deliveryPersonId = Auth::user()->id;
            $id = DeliveryPerson::where('user_id', $deliveryPersonId)->first()->id;

            // Check if delivery person exists
            if (!$id) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Delivery person not found.'
                ], 404);
            }

            $notifications = DeliveryNotification::with('order')
                ->where('delivery_person_id', $id)
                ->where('is_read', false)
                ->select('order_id', 'total_amount', 'created_at', 'order_id as order_order_id') // Selecting only relevant columns
                ->orderBy('created_at', 'desc')
                ->get();

            // Modify the response structure to include only the required data
            $modifiedNotifications = $notifications->map(function ($notification) {
                return [
                    'order_id' => $notification->order_id,
                    'total_amount' => $notification->total_amount,
                    'created_at' => $notification->created_at,
                    'order' => [
                        'id' => $notification->order->id,
                        'order_id' => $notification->order->order_id
                    ]
                ];
            });

            return response()->json([
                'status' => 'success',
                'notifications' => $modifiedNotifications
            ]);
        } catch (Exception $e) {
            // Log the exception message
            Log::error('Error fetching delivery notifications: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while fetching notifications.'
            ], 500);
        }
    }



    /**
     * Mark notifications as read.
     */
    public function markAsRead(Request $request)
    {
        try {
            // Validate the request data
            $validator = Validator::make($request->all(), [
                'order_id' => 'required|string',
            ]);

            // If validation fails, return error response
            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors(),
                ], 400);
            }

            DeliveryNotification::where('order_id', (string) $request->order_id)
                ->update(['is_read' => true]);
            return response()->json(['status' => 'success', 'message' => 'Notifications marked as read']);
        } catch (Throwable $th) {
            // Handle exceptions
            return response()->json([
                'status' => false,
                'message' => 'Failed to save delivery person details',
                'error' => $th->getMessage(),
            ], 500);
        }
    }
}
