<?php

namespace App\Services;


use Exception;
use App\Models\Order;
use App\Models\DeliveryPerson;
use Illuminate\Support\Facades\Log;
use App\Models\DeliveryPersonOrder;
use App\Events\OrderStatusNotificationForUserEvent;

class DeliveryOrderDetailsService
{

    public function getOrderDetailsById($orderId)
    {
        try {
            // Fetch the order by order ID and shop ID
            $order = Order::with([
                'userCart',
                'shops', // Include shop details
            ])
                ->where('id', $orderId)
                ->where('order_status', 'accepted')
                ->first();
            return $order;
        } catch (Exception $e) {
            // Log the error for debugging (optional)
            Log::error('Fetching order details failed', ['error' => $e->getMessage()]);

            // Re-throw the exception to let the controller handle it
            throw $e;
        }
    }

    public function acceptDeliveryOrder(array $data)
    {
        try {
            if ($data['order_status'] !== 'preparing') {
                throw new Exception("Invalid status. Only 'preparing' is allowed.");
            }

            $order = Order::with('userCart')->find($data['order_id']);
            if (!$order) {
                throw new Exception("Order not found");
            }

            $deliveryPerson = DeliveryPerson::where('user_id', $data['user_id'])->first();
            if (!$deliveryPerson) {
                throw new Exception("Delivery person not found");
            }

            // Assign delivery person
            $order->order_status = $data['order_status'];
            $order->delivery_person_id = $deliveryPerson->id;
            $order->save();

            // Notify customer via WebSocket
            try {
                $message = 'Your order is now being prepared.';
                broadcast(new OrderStatusNotificationForUserEvent($order, $message));
            } catch (Exception $e) {
                Log::error("Failed to broadcast WebSocket event", ['error' => $e->getMessage()]);
            }

            // Create delivery person order
            $deliveryPersonOrder = new DeliveryPersonOrder([
                'delivery_person_id' => $deliveryPerson->id,
                'order_id' => $order->id,
                'generate_order_id' => $order->order_id,
                'payment_method' => 'online',
                'delivery_amount' => $order->userCart->delivery_charge ?? 0,
                'payment_status' => 'pending',
            ]);

            $deliveryPersonOrder->save();

            return $deliveryPersonOrder;
        } catch (Exception $e) {
            Log::error('Service: Order acceptance failed', ['error' => $e->getMessage()]);
            throw $e; // Let the controller catch and handle
        }
    }

    public function getOrderDetailsWithShopDirection($orderId)
    {
        try {
            // Fetch the order by order ID and status
            $order = Order::with([
                'userCart',
                'shops' // Include shop details through relationship
            ])
                ->where('id', $orderId)
                ->where('order_status', 'preparing')
                ->first();

            if (!$order) {
                return response()->json(['message' => 'Order not found or not in preparing status'], 404);
            }

            // Return order details along with associated shops (already loaded via relationship)
            return [
                'order' => $order,
                'shops' => $order->shops // Use the already loaded relationship
            ];
        } catch (Exception $e) {
            Log::error('Fetching order details failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Something went wrong while fetching order details'], 500);
        }
    }

    public function reachShopLocation(array $data)
    {
        try {
            if (($data['order_status'] == 'on_the_way')) {
                $order = Order::with('userCart')->find($data['order_id']);

                if (!$order) {
                    throw new Exception("Order not found");
                }

                $order->order_status = $data['order_status'];
                $order->save();

                try {
                    $message = 'The delivery person has accepted your order. Your order is on the way.';
                    broadcast(new OrderStatusNotificationForUserEvent($order, $message));
                } catch (Exception $e) {
                    Log::error("Failed to broadcast WebSocket event", ['error' => $e->getMessage()]);
                }

                return $order; // Add this line
            }
        } catch (Exception $e) {
            Log::error('Order acceptance failed', ['error' => $e->getMessage()]);
            throw $e;
        }
    }
    public function getOrderDetailsWithUserDirection($orderId)
    {
        try {
            // Fetch the order by order ID and status
            $orderDetails = Order::with('userCart', 'address')
                ->where('id', $orderId)
                ->where('order_status', 'on_the_way')
                ->first();

            if (!$orderDetails) {
                return response()->json(['message' => 'Order not found or not in on_the_way status'], 404);
            }

            // Convert shop_ids to an array
            return $orderDetails;
        } catch (Exception $e) {
            Log::error('Fetching order details failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Something went wrong while fetching order details'], 500);
        }
    }
    public function reachUserLocation(array $data)
    {
        try {
            if (($data['order_status'] == 'reached')) {
                $order = Order::with('userCart')->find($data['order_id']);

                if (!$order) {
                    throw new Exception("Order not found");
                }

                $order->order_status = $data['order_status'];
                $order->save();

                try {
                    $message = 'The delivery person has reached your location.';
                    broadcast(new OrderStatusNotificationForUserEvent($order, $message));
                } catch (Exception $e) {
                    Log::error("Failed to broadcast WebSocket event", ['error' => $e->getMessage()]);
                }

                return $order;
            }
        } catch (Exception $e) {
            Log::error('Order acceptance failed', ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    public function getOrderWithUserDetails($orderId)
    {
        try {
            // Fetch the order by order ID and status
            $orderDetails = Order::with('userCart', 'address')
                ->where('id', $orderId)
                ->where('order_status', 'reached')
                ->first();

            if (!$orderDetails) {
                return response()->json(['message' => 'Order not found or not in on_the_way status'], 404);
            }

            // Convert shop_ids to an array
            return $orderDetails;
        } catch (Exception $e) {
            Log::error('Fetching order details failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Something went wrong while fetching order details'], 500);
        }
    }
    public function orderDelivered(array $data)
    {
        try {
            if (($data['order_status'] == 'delivered')) {
                // Fetch the order along with the related userCart data
                $order = Order::with('userCart')->find($data['order_id']);

                if (!$order) {
                    throw new Exception("Order not found");
                }

                // Update order status
                $order->order_status = $data['order_status'];
                $order->save();

                try {
                    $message = 'Your order has been delivered.';
                    broadcast(new OrderStatusNotificationForUserEvent($order, $message));
                } catch (Exception $e) {
                    Log::error("Failed to broadcast WebSocket event", ['error' => $e->getMessage()]);
                }

                return $order;
            }
        } catch (Exception $e) {
            Log::error('Order delivery status update failed', ['error' => $e->getMessage()]);
            throw $e;
        }
    }
}
