<?php

namespace App\Services;

use App\Models\Beneficiary;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

class ReceiptService
{
    /**
     * Generate a receipt PDF for a beneficiary
     */
    public function generateReceipt(Beneficiary $beneficiary)
    {
        $receiptData = [
            'beneficiary' => $beneficiary,
            'program' => $beneficiary->program,
            'receipt_number' => $this->generateReceiptNumber($beneficiary),
            'generated_at' => now(),
            'amount' => $beneficiary->amount,
            'status' => $beneficiary->status,
        ];

        // Generate PDF
        $pdf = Pdf::loadView('receipts.beneficiary-receipt', $receiptData);
        $pdf->setPaper('A4', 'portrait');
        
        // Generate filename
        $filename = 'receipt_' . $beneficiary->id . '_' . now()->format('Y-m-d_H-i-s') . '.pdf';
        
        // Save to public storage
        $path = 'receipts/' . $filename;
        $saved = Storage::disk('public')->put($path, $pdf->output());
        
        \Log::info('Receipt generation', [
            'beneficiary_id' => $beneficiary->id,
            'filename' => $filename,
            'path' => $path,
            'saved' => $saved,
            'full_path' => storage_path('app/public/' . $path),
            'url' => asset('storage/' . $path)
        ]);
        
        return [
            'path' => $path,
            'filename' => $filename,
            'url' => asset('storage/' . $path),
            'receipt_number' => $receiptData['receipt_number']
        ];
    }

    /**
     * Generate a unique receipt number
     */
    private function generateReceiptNumber(Beneficiary $beneficiary)
    {
        $date = now()->format('Ymd');
        $beneficiaryId = str_pad($beneficiary->id, 4, '0', STR_PAD_LEFT);
        $random = str_pad(rand(1, 999), 3, '0', STR_PAD_LEFT);
        
        return "RCP-{$date}-{$beneficiaryId}-{$random}";
    }

    /**
     * Get receipt download URL
     */
    public function getReceiptUrl(Beneficiary $beneficiary)
    {
        if (!$beneficiary->receipt_path) {
            return null;
        }
        
        return asset('storage/' . $beneficiary->receipt_path);
    }
}
