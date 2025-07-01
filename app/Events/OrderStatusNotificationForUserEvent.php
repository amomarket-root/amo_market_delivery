<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\Order;

class OrderStatusNotificationForUserEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $order;
    public $message; // Add custom message

    /**
     * Create a new event instance.
     *
     * @param Order $order
     * @param string $message
     */
    public function __construct(Order $order, string $message)
    {
        $this->order = $order;
        $this->message = $message;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return \Illuminate\Broadcasting\Channel|array
     */
    public function broadcastOn()
    {
        return new Channel('notification_order_status_for_user.' . $this->order->user_id);
    }

    /**
     * The event's broadcast name.
     *
     * @return string
     */
    public function broadcastAs()
    {
        return 'order.status.notification';
    }

    /**
     * The data to broadcast.
     *
     * @return array
     */
    public function broadcastWith()
    {
        return [
            'id' => $this->order->id,
            'order_id' => $this->order->order_id,
            'message' => $this->message, // Use custom message
            'total_amount' => $this->order->total_amount,
            'status' => $this->order->order_status,
        ];
    }
}
