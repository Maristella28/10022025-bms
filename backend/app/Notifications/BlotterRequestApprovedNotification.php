<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

class BlotterRequestApprovedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $blotterRequest;

    public function __construct($blotterRequest)
    {
        $this->blotterRequest = $blotterRequest;
    }

    public function via($notifiable)
    {
        return ['database', 'mail'];
    }

    public function toMail($notifiable)
    {
        $approvedDateTime = $this->blotterRequest->approved_date
            ? \Carbon\Carbon::parse($this->blotterRequest->approved_date)
            : null;
        $dateStr = $approvedDateTime ? $approvedDateTime->format('F j, Y') : 'N/A';
        $timeStr = $approvedDateTime ? $approvedDateTime->format('g:i A') : 'N/A';
        return (new MailMessage)
            ->subject('Blotter Request Approved')
            ->greeting('Hello ' . ($notifiable->name ?? ''))
            ->line('Your blotter request (ID: ' . $this->blotterRequest->id . ') has been approved.')
            ->line('Approved Date: ' . $dateStr)
            ->line('Approved Time: ' . $timeStr)
            ->line('Ticket Number: ' . ($this->blotterRequest->ticket_number ?? 'N/A'))
            ->line('Please keep your ticket number for reference.')
            ->action('View Blotter Requests', url('/residents/blotter-requests'));
    }

    public function toArray($notifiable)
    {
        $approvedDateTime = $this->blotterRequest->approved_date
            ? \Carbon\Carbon::parse($this->blotterRequest->approved_date)
            : null;
        $dateStr = $approvedDateTime ? $approvedDateTime->format('F j, Y') : null;
        $timeStr = $approvedDateTime ? $approvedDateTime->format('g:i A') : null;
        return [
            'message' => 'Your blotter request (ID: ' . $this->blotterRequest->id . ') has been approved.',
            'blotter_request_id' => $this->blotterRequest->id,
            'status' => 'approved',
            'approved_date' => $dateStr,
            'approved_time' => $timeStr,
            'ticket_number' => $this->blotterRequest->ticket_number,
        ];
    }
} 