<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

class BlotterRequestDeclinedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $blotterRequest;
    protected $adminMessage;

    public function __construct($blotterRequest, $adminMessage = null)
    {
        $this->blotterRequest = $blotterRequest;
        $this->adminMessage = $adminMessage;
    }

    public function via($notifiable)
    {
        return ['database', 'mail'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Blotter Request Declined')
            ->greeting('Hello ' . ($notifiable->name ?? ''))
            ->line('We regret to inform you that your blotter request (ID: ' . $this->blotterRequest->id . ') has been declined.')
            ->when($this->adminMessage, function ($mail) {
                return $mail->line('Admin Message: ' . $this->adminMessage);
            })
            ->line('Status: Declined')
            ->line('You may contact the barangay office for more information.')
            ->action('View Blotter Requests', url('/residents/blotter-requests'));
    }

    public function toArray($notifiable)
    {
        return [
            'message' => 'Your blotter request (ID: ' . $this->blotterRequest->id . ') has been declined.',
            'blotter_request_id' => $this->blotterRequest->id,
            'status' => 'declined',
            'admin_message' => $this->adminMessage,
        ];
    }
} 