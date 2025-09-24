<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\DocumentRequest;

class DocumentRequestStatusNotification extends Notification
{
    use Queueable;

    protected $documentRequest;
    protected $statusChange;

    /**
     * Create a new notification instance.
     */
    public function __construct(DocumentRequest $documentRequest, $statusChange = null)
    {
        $this->documentRequest = $documentRequest;
        $this->statusChange = $statusChange;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->line('Your document request status has been updated.')
                    ->action('View Request', url('/residents/documents/status'))
                    ->line('Thank you for using our barangay services!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $status = $this->documentRequest->status;
        $documentType = $this->documentRequest->document_type;
        $certificationType = $this->documentRequest->certification_type;
        
        // Create appropriate message based on status
        $message = $this->getStatusMessage($status, $documentType, $certificationType);
        
        return [
            'type' => 'document_request_status',
            'document_request_id' => $this->documentRequest->id,
            'document_type' => $documentType,
            'certification_type' => $certificationType,
            'status' => $status,
            'previous_status' => $this->statusChange['from'] ?? null,
            'message' => $message,
            'title' => 'Document Request Update',
            'icon' => $this->getStatusIcon($status),
            'color' => $this->getStatusColor($status),
            'action_url' => '/residents/documents/status',
            'created_at' => now()->toISOString(),
        ];
    }

    private function getStatusMessage($status, $documentType, $certificationType = null)
    {
        $docName = $certificationType ? "{$certificationType}" : $documentType;
        
        switch (strtolower($status)) {
            case 'pending':
                return "Your {$docName} request has been received and is pending review.";
            case 'processing':
                return "Your {$docName} request is now being processed by our office.";
            case 'approved':
                return "Great news! Your {$docName} request has been approved and is ready for pickup.";
            case 'rejected':
                return "Your {$docName} request has been declined. Please contact our office for more information.";
            case 'completed':
                return "Your {$docName} has been completed and is available for download.";
            default:
                return "Your {$docName} request status has been updated to: {$status}.";
        }
    }

    private function getStatusIcon($status)
    {
        switch (strtolower($status)) {
            case 'pending':
                return 'clock';
            case 'processing':
                return 'cog';
            case 'approved':
                return 'check-circle';
            case 'rejected':
                return 'x-circle';
            case 'completed':
                return 'document-check';
            default:
                return 'bell';
        }
    }

    private function getStatusColor($status)
    {
        switch (strtolower($status)) {
            case 'pending':
                return 'yellow';
            case 'processing':
                return 'blue';
            case 'approved':
                return 'green';
            case 'rejected':
                return 'red';
            case 'completed':
                return 'emerald';
            default:
                return 'gray';
        }
    }
}