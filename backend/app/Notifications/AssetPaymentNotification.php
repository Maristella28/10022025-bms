<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

class AssetPaymentNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $assetRequest;
    protected $receiptNumber;
    protected $amount;

    public function __construct($assetRequest, $receiptNumber, $amount)
    {
        $this->assetRequest = $assetRequest;
        $this->receiptNumber = $receiptNumber;
        $this->amount = $amount;
    }

    public function via($notifiable)
    {
        return ['database', 'mail'];
    }

    public function toMail($notifiable)
    {
        $assetName = $this->assetRequest->items->first()?->asset->name ?? 'Unknown Asset';
        $requestDate = $this->assetRequest->items->first()?->request_date ?? 'N/A';

        return (new MailMessage)
            ->subject('Asset Payment Receipt - ' . $this->receiptNumber)
            ->greeting('Hello ' . ($notifiable->name ?? ''))
            ->line('Your asset rental payment has been processed successfully.')
            ->line('Receipt Number: ' . $this->receiptNumber)
            ->line('Asset: ' . $assetName)
            ->line('Request Date: ' . $requestDate)
            ->line('Amount Paid: ₱' . number_format($this->amount, 2))
            ->line('Payment Date: ' . now()->format('F j, Y'))
            ->action('View Receipt', url('/residents/statusassetrequests'))
            ->line('Thank you for using our asset rental service!');
    }

    public function toArray($notifiable)
    {
        $assetName = $this->assetRequest->items->first()?->asset->name ?? 'Unknown Asset';
        
        return [
            'message' => 'Payment received for asset "' . $assetName . '". Receipt #' . $this->receiptNumber,
            'type' => 'asset_payment',
            'asset_request_id' => $this->assetRequest->id,
            'receipt_number' => $this->receiptNumber,
            'amount' => $this->amount,
            'asset_name' => $assetName,
        ];
    }
} 