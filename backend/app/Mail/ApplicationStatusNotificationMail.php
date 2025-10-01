<?php

namespace App\Mail;

use App\Models\User;
use App\Models\ApplicationSubmission;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ApplicationStatusNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $submission;
    public $status;
    public $adminNotes;

    /**
     * Create a new message instance.
     */
    public function __construct(User $user, ApplicationSubmission $submission, string $status, string $adminNotes = null)
    {
        $this->user = $user;
        $this->submission = $submission;
        $this->status = $status;
        $this->adminNotes = $adminNotes;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = match($this->status) {
            'approved' => 'Application Approved - Barangay e-Governance',
            'rejected' => 'Application Update - Barangay e-Governance',
            'under_review' => 'Application Under Review - Barangay e-Governance',
            default => 'Application Status Update - Barangay e-Governance'
        };

        return new Envelope(
            from: env('MAIL_FROM_ADDRESS', 'admin@barangay.local'),
            subject: $subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.application-status-notification',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
