<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ProfileUpdatedNotification extends Notification
{
    use Queueable;

    protected $profile;
    protected $resident;

    /**
     * Create a new notification instance.
     *
     * @param $profile
     * @param $resident
     * @return void
     */
    public function __construct($profile, $resident)
    {
        $this->profile = $profile;
        $this->resident = $resident;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        $profile = $this->profile;
        $resident = $this->resident;
        return (new MailMessage)
            ->subject('Your Barangay Profile Was Updated')
            ->greeting('Hello ' . ($profile->first_name ?? $notifiable->name) . '!')
            ->line('Your barangay resident profile has been updated successfully.')
            ->line('Resident ID: ' . ($resident->residents_id ?? 'N/A'))
            ->line('Name: ' . ($profile->first_name ?? '') . ' ' . ($profile->middle_name ?? '') . ' ' . ($profile->last_name ?? '') . ' ' . ($profile->name_suffix ?? ''))
            ->line('Email: ' . ($profile->email ?? $notifiable->email))
            ->line('Contact Number: ' . ($profile->contact_number ?? ''))
            ->line('Full Address: ' . ($profile->full_address ?? ''))
            ->line('If you did not make this change, please contact the barangay office immediately.')
            ->action('View Your Profile', url('/profile'));
    }

    /**
     * Get the array representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function toArray($notifiable)
    {
        $profile = $this->profile;
        $resident = $this->resident;
        return [
            'message' => 'Your profile has been updated successfully.',
            'resident_id' => $resident->residents_id ?? null,
            'name' => trim(($profile->first_name ?? '') . ' ' . ($profile->middle_name ?? '') . ' ' . ($profile->last_name ?? '') . ' ' . ($profile->name_suffix ?? '')),
            'email' => $profile->email ?? $notifiable->email,
            'contact_number' => $profile->contact_number ?? '',
            'full_address' => $profile->full_address ?? '',
        ];
    }
}
