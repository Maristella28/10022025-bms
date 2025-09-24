<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

class AssetRequestNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $asset;
    protected $requestDate;
    protected $status;

    public function __construct($asset, $requestDate, $status = 'pending')
    {
        $this->asset = $asset;
        $this->requestDate = $requestDate;
        $this->status = $status;
    }

    public function via($notifiable)
    {
        return ['database', 'mail'];
    }

    public function toMail($notifiable)
    {
        $statusMsg = $this->status === 'approved'
            ? 'approved'
            : ($this->status === 'denied' ? 'denied' : 'pending approval');

        return (new MailMessage)
            ->subject('Asset Request ' . ucfirst($statusMsg))
            ->greeting('Hello ' . ($notifiable->name ?? ''))
            ->line('Your request for the asset "' . $this->asset->name . '" has been ' . $statusMsg . '.')
            ->line('Request Date: ' . $this->requestDate)
            ->line('Status: ' . ucfirst($this->status))
            ->line('You will be notified once your request is approved or denied.')
            ->action('View Requests', url('/residents/statusassetrequests'));
    }

    public function toArray($notifiable)
    {
        $statusMsg = $this->status === 'approved'
            ? 'approved'
            : ($this->status === 'denied' ? 'denied' : 'pending approval');

        return [
            'message' => 'Your request for the asset "' . $this->asset->name . '" has been ' . $statusMsg . '.',
            'asset_id' => $this->asset->id,
            'asset_name' => $this->asset->name,
            'request_date' => $this->requestDate,
            'status' => $this->status,
        ];
    }
} 