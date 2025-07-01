<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DeliveryLiveLocationUpdateEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $orderId;
    public $latitude;
    public $longitude;

    public function __construct($orderId, $latitude, $longitude)
    {
        $this->orderId = $orderId;
        $this->latitude = $latitude;
        $this->longitude = $longitude;
    }

    public function broadcastOn()
    {
        return new Channel('delivery.location.' . $this->orderId);
    }

    public function broadcastAs()
    {
        return 'delivery.live.location';
    }

    public function broadcastWith()
    {
        return [
            'order_id' => $this->orderId,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
        ];
    }
}

