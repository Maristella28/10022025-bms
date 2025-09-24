<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

class AdminAssetRequestNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $user;
    protected $assetRequest;

    public function __construct($user, $assetRequest)
    {
        $this->user = $user;
        $this->assetRequest = $assetRequest;
    }

    public function via($notifiable)
    {
        return ['database', 'mail'];
    }

    public function toMail($notifiable)
    {
        $lines = [];
        foreach ($this->assetRequest->items as $item) {
            $lines[] = $item->asset->name . ' (Qty: ' . $item->quantity . ', Date: ' . $item->request_date . ')';
        }
        return (new MailMessage)
            ->subject('New Asset Request Submitted')
            ->greeting('Hello Admin')
            ->line('A new asset request has been submitted by ' . $this->user->name . ' (' . $this->user->email . ').')
            ->line('Requested Items:')
            ->line(implode("\n", $lines))
            ->action('View Requests', url('/admin/asset-requests'));
    }

    public function toArray($notifiable)
    {
        $items = [];
        foreach ($this->assetRequest->items as $item) {
            $items[] = [
                'asset_name' => $item->asset->name,
                'quantity' => $item->quantity,
                'request_date' => $item->request_date,
            ];
        }
        return [
            'message' => 'New asset request from ' . $this->user->name,
            'user_id' => $this->user->id,
            'user_email' => $this->user->email,
            'items' => $items,
        ];
    }
} 