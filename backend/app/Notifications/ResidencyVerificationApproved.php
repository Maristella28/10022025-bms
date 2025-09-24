<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;
use App\Models\User;

class ResidencyVerificationApproved extends Notification
{
    use Queueable;

    public $resident;

    public function __construct(User $resident)
    {
        $this->resident = $resident;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Residency Verification Approved')
            ->greeting('Congratulations!')
            ->line('Your residency verification has been approved by the barangay administrators.')
            ->action('View Your Profile', url('/profile'))
            ->line('You may now access all resident services.');
    }
}
