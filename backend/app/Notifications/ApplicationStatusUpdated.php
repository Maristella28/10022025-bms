<?php

namespace App\Notifications;

use App\Models\ApplicationSubmission;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ApplicationStatusUpdated extends Notification implements ShouldQueue
{
    use Queueable;

    public $submission;
    public $status;
    public $adminNotes;

    /**
     * Create a new notification instance.
     */
    public function __construct(ApplicationSubmission $submission, string $status, string $adminNotes = null)
    {
        $this->submission = $submission;
        $this->status = $status;
        $this->adminNotes = $adminNotes;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $subject = match($this->status) {
            'approved' => 'Application Approved - Barangay e-Governance',
            'rejected' => 'Application Update - Barangay e-Governance',
            'under_review' => 'Application Under Review - Barangay e-Governance',
            default => 'Application Status Update - Barangay e-Governance'
        };

        $message = (new MailMessage)
            ->subject($subject)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('Your application status has been updated.')
            ->line('Application: ' . ($this->submission->form->title ?? 'Program Application'))
            ->line('Status: ' . ucfirst(str_replace('_', ' ', $this->status)));

        if ($this->adminNotes) {
            $message->line('Admin Notes: ' . $this->adminNotes);
        }

        $message->action('View My Benefits', url('/residents/my-benefits'))
            ->line('Thank you for using our services!');

        return $message;
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'submission_id' => $this->submission->id,
            'form_title' => $this->submission->form->title ?? 'Program Application',
            'status' => $this->status,
            'admin_notes' => $this->adminNotes,
            'message' => 'Your application status has been updated to ' . ucfirst(str_replace('_', ' ', $this->status)),
            'action_url' => '/residents/my-benefits'
        ];
    }
}
