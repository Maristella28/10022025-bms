<?php

namespace App\Exports;

use App\Models\DocumentRequest;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class DocumentRecordsExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithColumnWidths, WithEvents
{
    protected $records;

    public function __construct($records)
    {
        $this->records = $records;
    }

    public function collection()
    {
        return $this->records;
    }

    public function headings(): array
    {
        return [
            'ID',
            'Resident ID',
            'Full Name',
            'Nationality',
            'Age',
            'Civil Status',
            'Gender',
            'Contact Number',
            'Email',
            'Address',
            'Document Type',
            'Certification Type',
            'Status',
            'Priority',
            'Request Date',
            'Approved Date',
            'Completed Date',
            'Payment Amount',
            'Payment Status',
            'Payment Notes',
            'Purpose',
            'Remarks',
            'Processing Notes',
            'Estimated Completion',
            'PDF Generated',
            'Created At',
            'Updated At'
        ];
    }

    public function map($record): array
    {
        return [
            $record->id,
            $record->resident?->resident_id ?? ($record->user ? 'RES-' . str_pad($record->user->id, 3, '0', STR_PAD_LEFT) : 'N/A'),
            $record->user?->name ?? ($record->resident ? trim($record->resident->first_name . ' ' . ($record->resident->middle_name ?? '') . ' ' . $record->resident->last_name . ' ' . ($record->resident->name_suffix ?? '')) : 'N/A'),
            $record->resident?->nationality ?? 'N/A',
            $record->resident?->age ?? 'N/A',
            $record->resident?->civil_status ?? 'N/A',
            $record->resident?->sex ?? 'N/A',
            $record->resident?->contact_number ?? 'N/A',
            $record->resident?->email ?? 'N/A',
            $record->resident?->current_address ?? 'N/A',
            $record->document_type,
            $record->certification_type ?? 'N/A',
            ucfirst($record->status),
            ucfirst($record->priority ?? 'normal'),
            $record->created_at ? $record->created_at->format('Y-m-d H:i:s') : 'N/A',
            $record->status === 'approved' && $record->updated_at ? $record->updated_at->format('Y-m-d H:i:s') : 'N/A',
            $record->completed_at ? $record->completed_at->format('Y-m-d H:i:s') : 'N/A',
            $record->payment_amount ? '₱' . number_format($record->payment_amount, 2) : 'N/A',
            $record->payment_amount ? ucfirst($record->payment_status ?? 'unpaid') : 'N/A',
            $record->payment_notes ?? 'N/A',
            $record->fields['purpose'] ?? 'N/A',
            $record->fields['remarks'] ?? 'N/A',
            $record->processing_notes ?? 'N/A',
            $record->estimated_completion ? \Carbon\Carbon::parse($record->estimated_completion)->format('Y-m-d') : 'N/A',
            $record->pdf_path ? 'Yes' : 'No',
            $record->created_at ? $record->created_at->format('Y-m-d H:i:s') : 'N/A',
            $record->updated_at ? $record->updated_at->format('Y-m-d H:i:s') : 'N/A'
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            // Style the first row as bold
            1 => ['font' => ['bold' => true, 'size' => 12]],
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 8,   // ID
            'B' => 12,  // Resident ID
            'C' => 25,  // Full Name
            'D' => 15,  // Nationality
            'E' => 8,   // Age
            'F' => 12,  // Civil Status
            'G' => 10,  // Gender
            'H' => 15,  // Contact Number
            'I' => 25,  // Email
            'J' => 30,  // Address
            'K' => 20,  // Document Type
            'L' => 20,  // Certification Type
            'M' => 12,  // Status
            'N' => 10,  // Priority
            'O' => 18,  // Request Date
            'P' => 18,  // Approved Date
            'Q' => 18,  // Completed Date
            'R' => 15,  // Payment Amount
            'S' => 15,  // Payment Status
            'T' => 20,  // Payment Notes
            'U' => 20,  // Purpose
            'V' => 20,  // Remarks
            'W' => 25,  // Processing Notes
            'X' => 18,  // Estimated Completion
            'Y' => 12,  // PDF Generated
            'Z' => 18,  // Created At
            'AA' => 18, // Updated At
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                // Auto-fit columns
                $event->sheet->getDelegate()->getStyle('A:AA')->getAlignment()->setWrapText(true);
                
                // Add borders to all cells
                $event->sheet->getDelegate()->getStyle('A1:AA' . ($this->records->count() + 1))
                    ->getBorders()
                    ->getAllBorders()
                    ->setBorderStyle(\PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN);
            },
        ];
    }
}
