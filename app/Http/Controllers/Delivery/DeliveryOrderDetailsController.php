<?php

namespace App\Http\Controllers\Delivery;


use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;
use App\Services\DeliveryOrderDetailsService;

class DeliveryOrderDetailsController extends Controller
{
    protected $deliveryOrderDetailsService;

    public function __construct(DeliveryOrderDetailsService $deliveryOrderDetailsService)
    {
        $this->deliveryOrderDetailsService = $deliveryOrderDetailsService;
    }
    public function getOrderDetailsById(Request $request, $orderId)
    {
        try {
            // Automatically get the authenticated user's ID
            $userId = Auth::id();

            if (!$userId) {
                return response()->json([
                    'message' => 'Unauthorized: Please log in to proceed.',
                ], 401);
            }

            // Fetch order details by order ID
            $order = $this->deliveryOrderDetailsService->getOrderDetailsById( $orderId);

            if (!$order) {
                return response()->json([
                    'message' => 'Order not found.',
                ], 404);
            }

            return response()->json([
                'message' => 'Order details fetched successfully',
                'order' => $order,
            ], 200);
        } catch (Exception $e) {
            // Handle any exceptions
            return response()->json([
                'message' => 'Something went wrong while fetching order details',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function acceptDeliveryOrder(Request $request)
    {
        try {
            // Get the authenticated user's ID
            $userId = Auth::id();

            if (!$userId) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized: Please log in to proceed.',
                ], 401);
            }

            // Validate request
            $validateCart = Validator::make($request->all(), [
                'order_id' => 'required|string|exists:orders,id',
                'order_status' => 'required|in:preparing', // Restrict to 'accepted' only
            ]);

            if ($validateCart->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation error',
                    'errors' => $validateCart->errors(),
                ], 401);
            }

            // Add user_id to the request data
            $requestData = $request->all();
            $requestData['user_id'] = $userId;

            // Accept the Delivery Partner order
            $shopOrder = $this->deliveryOrderDetailsService->acceptDeliveryOrder($requestData);

            return response()->json([
                'status' => true,
                'message' => 'Order accepted from delivery Partner successfully',
                'data' => [
                    'shop_order' => $shopOrder,
                    'order_status' => 'accepted',
                ],
            ], 200);
        } catch (Exception $e) {
            Log::error('Error accepting delivery order: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Something went wrong while accepting the order',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getOrderDetailsWithShopDirection(Request $request, $orderId)
    {
        try {
            // Automatically get the authenticated user's ID
            $userId = Auth::id();

            if (!$userId) {
                return response()->json([
                    'message' => 'Unauthorized: Please log in to proceed.',
                ], 401);
            }

            // Fetch order details by order ID
            $orderData = $this->deliveryOrderDetailsService->getOrderDetailsWithShopDirection($orderId);

            if (!$orderData) {
                return response()->json([
                    'message' => 'Order not found.',
                ], 404);
            }

            return response()->json([
                'message' => 'Order details with Shop location fetched successfully',
                'orderData' => $orderData,
            ], 200);
        } catch (Exception $e) {
            // Handle any exceptions
            return response()->json([
                'message' => 'Something went wrong while fetching order details',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function reachShopLocation(Request $request)
    {
        try {
            // Get the authenticated user's ID
            $userId = Auth::id();

            if (!$userId) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized: Please log in to proceed.',
                ], 401);
            }

            // Validate request
            $validateCart = Validator::make($request->all(), [
                'order_id' => 'required|string|exists:orders,id',
                'order_status' => 'required|in:on_the_way', // Restrict to 'accepted' only
            ]);

            if ($validateCart->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation error',
                    'errors' => $validateCart->errors(),
                ], 401);
            }

            // Accept the Delivery Partner order
            $shopOrder = $this->deliveryOrderDetailsService->reachShopLocation($request->all());

            return response()->json([
                'status' => true,
                'message' => 'Delivery partner reached the shop location successfully',
                'data' => [
                    'shop_order' => $shopOrder,
                    'order_status' => 'on_the_way',
                ],
            ], 200);
        } catch (Exception $e) {
            Log::error('Error accepting delivery order: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Something went wrong while accepting the order',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function getOrderDetailsWithUserDirection($orderId)
    {
        try {
            // Automatically get the authenticated user's ID
            $userId = Auth::id();

            if (!$userId) {
                return response()->json([
                    'message' => 'Unauthorized: Please log in to proceed.',
                ], 401);
            }

            // Fetch order details by order ID
            $orderData = $this->deliveryOrderDetailsService->getOrderDetailsWithUserDirection($orderId);

            if (!$orderData) {
                return response()->json([
                    'message' => 'Order not found.',
                ], 404);
            }

            return response()->json([
                'message' => 'Order details with Shop location fetched successfully',
                'orderData' => $orderData,
            ], 200);
        } catch (Exception $e) {
            // Handle any exceptions
            return response()->json([
                'message' => 'Something went wrong while fetching order details',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function reachUserLocation(Request $request)
    {
        try {
            // Get the authenticated user's ID
            $userId = Auth::id();

            if (!$userId) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized: Please log in to proceed.',
                ], 401);
            }

            // Validate request
            $validateCart = Validator::make($request->all(), [
                'order_id' => 'required|string|exists:orders,id',
                'order_status' => 'required|in:reached', // Restrict to 'reached' only
            ]);

            if ($validateCart->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation error',
                    'errors' => $validateCart->errors(),
                ], 401);
            }


            // Accept the Delivery Partner order
            $shopOrder = $this->deliveryOrderDetailsService->reachUserLocation($request->all());

            return response()->json([
                'status' => true,
                'message' => 'Delivery partner reached the user location successfully',
                'data' => [
                    'shop_order' => $shopOrder,
                    'order_status' => 'reached',
                ],
            ], 200);
        } catch (Exception $e) {
            Log::error('Error accepting delivery order: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Something went wrong while accepting the order',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function getOrderWithUserDetails(Request $request, $orderId)
    {
        try {
            // Automatically get the authenticated user's ID
            $userId = Auth::id();

            if (!$userId) {
                return response()->json([
                    'message' => 'Unauthorized: Please log in to proceed.',
                ], 401);
            }

            // Fetch order details by order ID
            $orderData = $this->deliveryOrderDetailsService->getOrderWithUserDetails($orderId);

            if (!$orderData) {
                return response()->json([
                    'message' => 'Order not found.',
                ], 404);
            }

            return response()->json([
                'message' => 'Order details with User details fetched successfully',
                'orderData' => $orderData,
            ], 200);
        } catch (Exception $e) {
            // Handle any exceptions
            return response()->json([
                'message' => 'Something went wrong while fetching order details',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function orderDelivered(Request $request)
    {
        try {
            // Get the authenticated user's ID
            $userId = Auth::id();

            if (!$userId) {
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized: Please log in to proceed.',
                ], 401);
            }

            // Validate request
            $validateCart = Validator::make($request->all(), [
                'order_id' => 'required|string|exists:orders,id',
                'order_status' => 'required|in:delivered', // Restrict to 'reached' only
            ]);

            if ($validateCart->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation error',
                    'errors' => $validateCart->errors(),
                ], 401);
            }


            // Accept the Delivery Partner order
            $shopOrder = $this->deliveryOrderDetailsService->orderDelivered($request->all());

            return response()->json([
                'status' => true,
                'message' => 'Order Delivered successfully',
                'data' => [
                    'shop_order' => $shopOrder,
                    'order_status' => 'delivered',
                ],
            ], 200);
        } catch (Exception $e) {
            Log::error('Error accepting delivery order: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Something went wrong while accepting the order',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
