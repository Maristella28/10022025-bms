<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;
use App\Models\User;

class ResidencyVerificationReuploaded extends Notification
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
            ->subject('Residency Verification Re-uploaded')
            ->greeting('Hello Admin,')
            ->line("{$this->resident->name} has re-uploaded their residency verification document.")
            ->action('View Resident', url('/admin/residents/' . $this->resident->id))
            ->line('Please review the new document in the admin dashboard.');
    }
}
