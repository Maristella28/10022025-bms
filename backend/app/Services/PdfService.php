<?php

namespace App\Services;

use App\Models\DocumentRequest;
use App\Models\Resident;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class PdfService
{
    public function generateCertificate(DocumentRequest $documentRequest, Resident $resident)
    {
        try {
            // Check if DomPDF is available
            if (!class_exists('\Barryvdh\DomPDF\Facade\Pdf')) {
                throw new \Exception('DomPDF package is not installed or not properly configured.');
            }

            $template = $this->getTemplateName($documentRequest->document_type, $documentRequest->certification_type);
            
            // Check if template exists
            if (!view()->exists("certificates.{$template}")) {
                throw new \Exception("Certificate template 'certificates.{$template}' not found.");
            }
            
            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView("certificates.{$template}", [
                'documentRequest' => $documentRequest,
                'resident' => $resident,
                'certificationData' => $documentRequest->certification_data ?? [],
                'data' => array_merge(
                    $documentRequest->fields ?? [],
                    $documentRequest->certification_data ?? [],
                    [
                        'fullName' => $resident->first_name . ' ' . ($resident->middle_name ? $resident->middle_name . ' ' : '') . $resident->last_name . ($resident->name_suffix ? ' ' . $resident->name_suffix : ''),
                        'address' => $resident->current_address ?? $resident->full_address,
                        'age' => $resident->age,
                        'dateOfBirth' => $resident->birth_date,
                        'civilStatus' => $resident->civil_status,
                    ]
                )
            ]);
            
            $pdf->setPaper('A4', 'portrait');
            
            // Generate filename
            $filename = $this->generateFilename($documentRequest, $resident);
            
            // Ensure certificates directory exists
            $certificatesPath = 'certificates';
            if (!Storage::disk('public')->exists($certificatesPath)) {
                Storage::disk('public')->makeDirectory($certificatesPath);
            }
            
            // Save to storage
            $path = "{$certificatesPath}/{$filename}";
            Storage::disk('public')->put($path, $pdf->output());
            
            Log::info("PDF certificate generated successfully", [
                'document_request_id' => $documentRequest->id,
                'resident_id' => $resident->id,
                'pdf_path' => $path
            ]);
            
            return $path;
            
        } catch (\Exception $e) {
            Log::error("Failed to generate PDF certificate", [
                'document_request_id' => $documentRequest->id,
                'resident_id' => $resident->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            throw $e;
        }
    }
    
    private function getTemplateName($documentType, $certificationType = null)
    {
        // Handle Brgy Certification with specific templates
        if ($documentType === 'Brgy Certification' && $certificationType) {
            $certificationTemplates = [
                'Solo Parent Certification' => 'brgy-certification-solo-parent',
                'Delayed Registration of Birth Certificate' => 'brgy-certification-delayed-registration',
                'First Time Job Seeker' => 'brgy-certification-first-time-jobseeker',
                // Add more specific certification templates as needed
            ];
            
            // Return specific template if available, otherwise use general certification template
            if (isset($certificationTemplates[$certificationType])) {
                return $certificationTemplates[$certificationType];
            }
            
            return 'brgy-certification';
        }
        
        // Handle other document types
        $templates = [
            'Brgy Clearance' => 'brgy-clearance',
            'Brgy Business Permit' => 'brgy-business-permit',
            'Brgy Indigency' => 'brgy-indigency',
            'Brgy Residency' => 'brgy-residency',
            'Brgy Certification' => 'brgy-certification',
        ];
        
        return $templates[$documentType] ?? 'brgy-clearance';
    }
    
    private function generateFilename(DocumentRequest $documentRequest, Resident $resident)
    {
        $documentType = str_replace(' ', '-', strtolower($documentRequest->document_type));
        $residentName = str_replace(' ', '-', strtolower($resident->first_name . '-' . $resident->last_name));
        $date = now()->format('Y-m-d');
        $id = $documentRequest->id;
        
        return "{$documentType}-{$residentName}-{$date}-{$id}.pdf";
    }
    
    public function downloadCertificate($path)
    {
        Log::info('Attempting to download certificate', [
            'path' => $path,
            'storage_root' => storage_path('app/public'),
            'public_path' => public_path('storage'),
            'storage_exists' => Storage::disk('public')->exists(''),
            'storage_files' => Storage::disk('public')->files('certificates')
        ]);
        
        if (!Storage::disk('public')->exists($path)) {
            Log::error('Certificate file not found in storage', [
                'path' => $path,
                'full_path' => storage_path('app/public/' . $path),
                'available_files' => Storage::disk('public')->files('certificates')
            ]);
            throw new \Exception('Certificate file not found: ' . $path);
        }
        
        $fullPath = storage_path('app/public/' . $path);
        $filename = basename($path);
        
        if (!file_exists($fullPath)) {
            Log::error('Certificate file not found at path', [
                'path' => $path,
                'full_path' => $fullPath,
                'storage_path' => storage_path(),
                'public_path' => public_path(),
            ]);
            throw new \Exception('Certificate file not accessible: ' . $fullPath);
        }
        
        Log::info('Certificate file found', [
            'path' => $path,
            'full_path' => $fullPath,
            'filename' => $filename,
            'file_size' => filesize($fullPath),
            'is_readable' => is_readable($fullPath)
        ]);
        
        return response()->file($fullPath, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"'
        ]);
    }
} 