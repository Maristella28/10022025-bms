<?php

namespace App\Observers;

use App\Models\DocumentRequest;
use App\Models\User;
use App\Notifications\DocumentRequestStatusNotification;
use Illuminate\Support\Facades\Log;

class DocumentRequestObserver
{
    /**
     * Handle the DocumentRequest "created" event.
     */
    public function created(DocumentRequest $documentRequest): void
    {
        // Send notification when a new document request is created
        $this->sendNotificationToUser($documentRequest, [
            'from' => null,
            'to' => $documentRequest->status
        ]);
        
        Log::info('Document request created notification sent', [
            'document_request_id' => $documentRequest->id,
            'user_id' => $documentRequest->user_id,
            'status' => $documentRequest->status
        ]);
    }

    /**
     * Handle the DocumentRequest "updated" event.
     */
    public function updated(DocumentRequest $documentRequest): void
    {
        // Check if status has changed
        if ($documentRequest->isDirty('status')) {
            $originalStatus = $documentRequest->getOriginal('status');
            $newStatus = $documentRequest->status;
            
            // Send notification about status change
            $this->sendNotificationToUser($documentRequest, [
                'from' => $originalStatus,
                'to' => $newStatus
            ]);
            
            Log::info('Document request status change notification sent', [
                'document_request_id' => $documentRequest->id,
                'user_id' => $documentRequest->user_id,
                'from_status' => $originalStatus,
                'to_status' => $newStatus
            ]);
        }
        
        // Check if PDF was generated (pdf_path added)
        if ($documentRequest->isDirty('pdf_path') && $documentRequest->pdf_path) {
            $this->sendPdfReadyNotification($documentRequest);
            
            Log::info('Document PDF ready notification sent', [
                'document_request_id' => $documentRequest->id,
                'user_id' => $documentRequest->user_id,
                'pdf_path' => $documentRequest->pdf_path
            ]);
        }
    }

    /**
     * Send notification to the user who made the request
     */
    private function sendNotificationToUser(DocumentRequest $documentRequest, array $statusChange)
    {
        try {
            $user = User::find($documentRequest->user_id);
            
            if ($user) {
                $user->notify(new DocumentRequestStatusNotification($documentRequest, $statusChange));
            } else {
                Log::warning('User not found for document request notification', [
                    'document_request_id' => $documentRequest->id,
                    'user_id' => $documentRequest->user_id
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to send document request notification', [
                'document_request_id' => $documentRequest->id,
                'user_id' => $documentRequest->user_id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Send specific notification when PDF is ready for download
     */
    private function sendPdfReadyNotification(DocumentRequest $documentRequest)
    {
        try {
            $user = User::find($documentRequest->user_id);
            
            if ($user) {
                $user->notify(new DocumentRequestStatusNotification($documentRequest, [
                    'type' => 'pdf_ready',
                    'message' => 'Your document is now ready for download!'
                ]));
            }
        } catch (\Exception $e) {
            Log::error('Failed to send PDF ready notification', [
                'document_request_id' => $documentRequest->id,
                'user_id' => $documentRequest->user_id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Handle the DocumentRequest "deleted" event.
     */
    public function deleted(DocumentRequest $documentRequest): void
    {
        // Optionally send notification when request is deleted
        Log::info('Document request deleted', [
            'document_request_id' => $documentRequest->id,
            'user_id' => $documentRequest->user_id
        ]);
    }

    /**
     * Handle the DocumentRequest "restored" event.
     */
    public function restored(DocumentRequest $documentRequest): void
    {
        //
    }

    /**
     * Handle the DocumentRequest "force deleted" event.
     */
    public function forceDeleted(DocumentRequest $documentRequest): void
    {
        //
    }
}