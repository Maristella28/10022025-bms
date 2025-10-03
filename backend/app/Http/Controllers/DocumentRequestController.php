<?php

namespace App\Http\Controllers;

use App\Models\DocumentRequest;
use App\Models\Resident;
use App\Services\PdfService;
use App\Exports\DocumentRecordsExport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;

class DocumentRequestController extends Controller
{
    // Admin: Fetch all document requests with resident data
    public function index()
    {
        $requests = DocumentRequest::with(['user', 'resident'])->orderBy('created_at', 'desc')->get();
        return response()->json($requests);
    }

    // Resident: Create a new document request
    public function store(Request $request)
    {
        try {
            $user = Auth::user();
            
            \Log::info('Document request attempt', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'request_data' => $request->all()
            ]);
            
            // Check if user has a resident profile
            $resident = Resident::where('user_id', $user->id)->first();
            
            if (!$resident) {
                \Log::warning('Document request failed - no resident profile', [
                    'user_id' => $user->id,
                    'user_email' => $user->email
                ]);
                return response()->json([
                    'message' => 'Resident profile not found. Please complete your profile first.',
                    'error_code' => 'NO_RESIDENT_PROFILE',
                    'redirect_url' => '/profile'
                ], 422);
            }
            
            // Also check if resident has required profile data
            if (!$resident->first_name || !$resident->last_name) {
                \Log::warning('Document request failed - incomplete resident profile', [
                    'user_id' => $user->id,
                    'resident_id' => $resident->id,
                    'missing_fields' => [
                        'first_name' => !$resident->first_name,
                        'last_name' => !$resident->last_name
                    ]
                ]);
                return response()->json([
                    'message' => 'Your resident profile is incomplete. Please complete your profile with required information.',
                    'error_code' => 'INCOMPLETE_PROFILE',
                    'redirect_url' => '/profile'
                ], 422);
            }

            try {
                $validated = $request->validate([
                    'document_type' => 'required|string',
                    'fields' => 'nullable|string', // Accept JSON string from FormData
                    'attachment' => 'nullable|string',
                    'photo' => 'nullable|file|image|mimes:jpeg,png,jpg|max:5120', // 5MB max
                ]);
                
                // Parse fields JSON string if present
                if (isset($validated['fields']) && is_string($validated['fields'])) {
                    $validated['fields'] = json_decode($validated['fields'], true);
                    if (json_last_error() !== JSON_ERROR_NONE) {
                        throw new \InvalidArgumentException('Invalid JSON in fields parameter');
                    }
                }
                
                \Log::info('Document request validation passed', [
                    'user_id' => $user->id,
                    'validated_data' => $validated,
                    'request_keys' => array_keys($request->all())
                ]);
                
            } catch (\Illuminate\Validation\ValidationException $e) {
                \Log::error('Document request validation failed', [
                    'user_id' => $user->id,
                    'errors' => $e->errors(),
                    'request_data' => $request->all(),
                    'request_headers' => $request->headers->all(),
                    'content_type' => $request->header('Content-Type')
                ]);
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $e->errors(),
                    'debug_info' => [
                        'received_fields' => array_keys($request->all()),
                        'content_type' => $request->header('Content-Type')
                    ]
                ], 422);
            }
        
        // Extract certification type and data for Brgy Certification documents
        $certificationData = [];
        $certificationType = null;
        
        if ($validated['document_type'] === 'Brgy Certification' && isset($validated['fields']['purpose'])) {
            $certificationType = $validated['fields']['purpose'];
            
            // Extract certification-specific data
            if ($certificationType === 'Solo Parent Certification') {
                $certificationData = [
                    'child_name' => $validated['fields']['childName'] ?? null,
                    'child_birth_date' => $validated['fields']['childBirthDate'] ?? null,
                ];
            } elseif ($certificationType === 'Delayed Registration of Birth Certificate') {
                $certificationData = [
                    'registration_office' => $validated['fields']['registrationOffice'] ?? null,
                    'registration_date' => $validated['fields']['registrationDate'] ?? null,
                ];
            }
        }
        
        // Handle photo - auto-fill from resident profile for Barangay Clearance or allow manual upload
        $photoPath = null;
        $photoMetadata = null;
        
        if ($validated['document_type'] === 'Brgy Clearance') {
            // Auto-fill photo from resident profile
            if ($resident->avatar) {
                $photoPath = $resident->avatar;
                $photoMetadata = [
                    'source' => 'profile',
                    'auto_filled' => true,
                    'original_name' => 'profile_photo.jpg',
                    'uploaded_at' => now()->toISOString(),
                ];
            }
            
            // Allow manual photo upload to override profile photo
            if ($request->hasFile('photo')) {
                $photo = $request->file('photo');
                $photoPath = $photo->store('document_photos', 'public');
                
                // Store photo metadata
                $photoMetadata = [
                    'source' => 'manual_upload',
                    'auto_filled' => false,
                    'original_name' => $photo->getClientOriginalName(),
                    'size' => $photo->getSize(),
                    'mime_type' => $photo->getMimeType(),
                    'uploaded_at' => now()->toISOString(),
                ];
            }
        } else {
            // For other document types, only allow manual upload
            if ($request->hasFile('photo')) {
                $photo = $request->file('photo');
                $photoPath = $photo->store('document_photos', 'public');
                
                // Store photo metadata
                $photoMetadata = [
                    'source' => 'manual_upload',
                    'auto_filled' => false,
                    'original_name' => $photo->getClientOriginalName(),
                    'size' => $photo->getSize(),
                    'mime_type' => $photo->getMimeType(),
                    'uploaded_at' => now()->toISOString(),
                ];
            }
        }
        
        $docRequest = DocumentRequest::create([
            'user_id' => $user->id,
            'document_type' => $validated['document_type'],
            'certification_type' => $certificationType,
            'fields' => $validated['fields'] ?? [],
            'certification_data' => !empty($certificationData) ? $certificationData : null,
            'status' => 'pending',
            'priority' => 'normal',
            'attachment' => $validated['attachment'] ?? null,
            'photo_path' => $photoPath,
            'photo_type' => $validated['document_type'] === 'Brgy Clearance' ? 'id_photo' : null,
            'photo_metadata' => $photoMetadata,
        ]);
        
            return response()->json([
                'message' => 'Document request created successfully.',
                'document_request' => $docRequest->load(['user', 'resident'])
            ], 201);
            
        } catch (\Exception $e) {
            \Log::error('Document request creation failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Failed to create document request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Admin: Update status or details of a document request
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|string',
            'fields' => 'nullable|array',
            'attachment' => 'nullable|string',
            'processing_notes' => 'nullable|string',
            'priority' => 'nullable|in:low,normal,high,urgent',
            'estimated_completion' => 'nullable|date',
            'payment_amount' => 'nullable|numeric|min:0',
            'payment_notes' => 'nullable|string',
        ]);
        
        $docRequest = DocumentRequest::findOrFail($id);
        $oldStatus = $docRequest->status;
        $docRequest->status = $validated['status'];
        
        if (isset($validated['fields'])) {
            $docRequest->fields = $validated['fields'];
        }
        
        if (isset($validated['attachment'])) {
            $docRequest->attachment = $validated['attachment'];
        }
        
        if (isset($validated['processing_notes'])) {
            $docRequest->processing_notes = $validated['processing_notes'];
        }
        
        if (isset($validated['priority'])) {
            $docRequest->priority = $validated['priority'];
        }
        
        if (isset($validated['estimated_completion'])) {
            $docRequest->estimated_completion = $validated['estimated_completion'];
        }
        
        // Handle payment approval when status changes to approved
        if (strtolower($validated['status']) === 'approved' && strtolower($oldStatus) !== 'approved') {
            if (isset($validated['payment_amount']) && $validated['payment_amount'] > 0) {
                $docRequest->payment_amount = $validated['payment_amount'];
                $docRequest->payment_status = 'unpaid';
                $docRequest->payment_completed = 0;
            }
            
            if (isset($validated['payment_notes'])) {
                $docRequest->payment_notes = $validated['payment_notes'];
            }
        }
        
        // Set completed_at timestamp when status changes to completed/approved
        if (in_array(strtolower($validated['status']), ['completed', 'approved']) && !$docRequest->completed_at) {
            $docRequest->completed_at = now();
        }
        
        $docRequest->save();
        
        // Send notification to resident if approved with payment
        if (strtolower($validated['status']) === 'approved' && strtolower($oldStatus) !== 'approved' && $docRequest->payment_amount > 0) {
            $this->sendPaymentApprovalNotification($docRequest);
        }
        
        return response()->json($docRequest->load(['user', 'resident']));
    }

    // Get document requests for authenticated user (resident)
    public function myRequests()
    {
        $user = Auth::user();
        $requests = DocumentRequest::where('user_id', $user->id)
            ->with(['user', 'resident'])
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json($requests);
    }

    // Generate PDF certificate
    public function generatePdf(Request $request, $id)
    {
        try {
            /** @var \App\Models\DocumentRequest $documentRequest */
            $documentRequest = DocumentRequest::with(['user', 'resident'])->findOrFail($id);
            
            if (!$documentRequest->resident) {
                return response()->json([
                    'message' => 'Resident profile not found for this document request.'
                ], 404);
            }
            
            // Check if document is approved
            if (strtolower($documentRequest->status) !== 'approved') {
                return response()->json([
                    'message' => 'Only approved document requests can generate PDF certificates.'
                ], 400);
            }
            
            $pdfService = new PdfService();
            $pdfPath = $pdfService->generateCertificate($documentRequest, $documentRequest->resident);
            
            // Update document request with PDF path
            $documentRequest->update([
                'pdf_path' => $pdfPath
            ]);
            
            return response()->json([
                'message' => 'PDF certificate generated successfully.',
                'pdf_path' => $pdfPath,
                'download_url' => url("storage/{$pdfPath}")
            ]);
            
        } catch (\Exception $e) {
            \Log::error('PDF Generation Error', [
                'document_request_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Failed to generate PDF certificate.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Download PDF certificate
    public function downloadPdf($id)
    {
        try {
            \Log::info('Starting PDF download request', [
                'id' => $id,
                'storage_path' => storage_path('app/public'),
                'public_path' => public_path('storage')
            ]);

            $documentRequest = DocumentRequest::with('resident')->findOrFail($id);

            \Log::info('Found document request', [
                'document_request' => $documentRequest->toArray(),
                'storage_exists' => Storage::disk('public')->exists(''),
                'storage_files' => Storage::disk('public')->files()
            ]);

            if (!$documentRequest->pdf_path) {
                \Log::warning('No PDF path in document request', [
                    'id' => $id,
                    'document_request' => $documentRequest->toArray()
                ]);
                return response()->json([
                    'message' => 'PDF certificate not found. Please generate it first.',
                    'error_code' => 'PDF_PATH_MISSING'
                ], 404);
            }

            \Log::info('Checking PDF file', [
                'pdf_path' => $documentRequest->pdf_path,
                'full_path' => storage_path('app/public/' . $documentRequest->pdf_path),
                'exists' => Storage::disk('public')->exists($documentRequest->pdf_path)
            ]);

            if (!Storage::disk('public')->exists($documentRequest->pdf_path)) {
                \Log::warning('PDF file not found in storage', [
                    'pdf_path' => $documentRequest->pdf_path,
                    'storage_path' => storage_path('app/public'),
                    'storage_files' => Storage::disk('public')->files()
                ]);
                return response()->json([
                    'message' => 'PDF file not found on server. Please generate it first or contact admin.',
                    'error_code' => 'PDF_FILE_MISSING'
                ], 404);
            }

            $filePath = storage_path('app/public/' . $documentRequest->pdf_path);
            $fileName = sprintf(
                '%s-%s-%s.pdf',
                str_replace(' ', '_', $documentRequest->document_type),
                $documentRequest->resident ? str_replace(' ', '_', $documentRequest->resident->last_name) : 'Unknown',
                date('Y-m-d')
            );

            \Log::info('Preparing PDF download', [
                'file_path' => $filePath,
                'file_name' => $fileName,
                'file_exists' => file_exists($filePath),
                'file_size' => file_exists($filePath) ? filesize($filePath) : 0
            ]);

            return response()->download($filePath, $fileName, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="' . $fileName . '"'
            ]);

        } catch (\Exception $e) {
            \Log::error('PDF Download Error', [
                'document_request_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'storage_path' => storage_path('app/public'),
                'storage_exists' => Storage::disk('public')->exists(''),
                'storage_files' => Storage::disk('public')->files()
            ]);

            return response()->json([
                'message' => 'Failed to download PDF certificate.',
                'error' => $e->getMessage(),
                'error_code' => 'PDF_DOWNLOAD_FAILED'
            ], 500);
        }
    }

    // Test PDF generation (for debugging)
    public function testPdf()
    {
        try {
            // Check if DomPDF is available
            if (!class_exists('\Barryvdh\DomPDF\Facade\Pdf')) {
                return response()->json([
                    'error' => 'DomPDF package is not installed or not properly configured.',
                    'status' => 'DomPDF not found'
                ], 500);
            }

            // Check if templates exist
            $templates = [
                'brgy-clearance',
                'brgy-business-permit',
                'brgy-indigency',
                'brgy-residency',
                'brgy-certification',
                'brgy-certification-solo-parent',
                'brgy-certification-delayed-registration',
                'brgy-certification-first-time-jobseeker'
            ];
            $missingTemplates = [];
            
            foreach ($templates as $template) {
                if (!view()->exists("certificates.{$template}")) {
                    $missingTemplates[] = $template;
                }
            }

            if (!empty($missingTemplates)) {
                return response()->json([
                    'error' => 'Missing certificate templates',
                    'missing_templates' => $missingTemplates,
                    'status' => 'Templates missing'
                ], 500);
            }

            // Check storage
            $storageStatus = [
                'public_disk_exists' => Storage::disk('public')->exists(''),
                'certificates_dir_exists' => Storage::disk('public')->exists('certificates'),
                'storage_link_exists' => file_exists(public_path('storage'))
            ];

            return response()->json([
                'message' => 'PDF system is properly configured',
                'status' => 'OK',
                'storage_status' => $storageStatus,
                'dompdf_available' => true,
                'templates_available' => true
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Test failed',
                'message' => $e->getMessage(),
                'status' => 'Error'
            ], 500);
        }
    }

    // View uploaded photo
    public function viewPhoto($id)
    {
        try {
            $documentRequest = DocumentRequest::findOrFail($id);
            
            if (!$documentRequest->photo_path) {
                return response()->json([
                    'message' => 'No photo found for this document request.'
                ], 404);
            }
            
            if (!Storage::disk('public')->exists($documentRequest->photo_path)) {
                return response()->json([
                    'message' => 'Photo file not found on server.'
                ], 404);
            }
            
            $photoUrl = url('storage/' . $documentRequest->photo_path);
            
            return response()->json([
                'photo_url' => $photoUrl,
                'photo_metadata' => $documentRequest->photo_metadata,
                'photo_type' => $documentRequest->photo_type
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Photo View Error', [
                'document_request_id' => $id,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'message' => 'Failed to retrieve photo.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Download photo
    public function downloadPhoto($id)
    {
        try {
            $documentRequest = DocumentRequest::findOrFail($id);
            
            if (!$documentRequest->photo_path) {
                return response()->json([
                    'message' => 'No photo found for this document request.'
                ], 404);
            }
            
            if (!Storage::disk('public')->exists($documentRequest->photo_path)) {
                return response()->json([
                    'message' => 'Photo file not found on server.'
                ], 404);
            }
            
            $photoPath = storage_path('app/public/' . $documentRequest->photo_path);
            $originalName = $documentRequest->photo_metadata['original_name'] ?? 'photo.jpg';
            
            return response()->download($photoPath, $originalName);
            
        } catch (\Exception $e) {
            \Log::error('Photo Download Error', [
                'document_request_id' => $id,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'message' => 'Failed to download photo.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Delete photo (admin only)
    public function deletePhoto($id)
    {
        try {
            $documentRequest = DocumentRequest::findOrFail($id);
            
            if (!$documentRequest->photo_path) {
                return response()->json([
                    'message' => 'No photo found for this document request.'
                ], 404);
            }
            
            // Delete file from storage
            if (Storage::disk('public')->exists($documentRequest->photo_path)) {
                Storage::disk('public')->delete($documentRequest->photo_path);
            }
            
            // Clear photo fields in database
            $documentRequest->update([
                'photo_path' => null,
                'photo_type' => null,
                'photo_metadata' => null
            ]);
            
            return response()->json([
                'message' => 'Photo deleted successfully.'
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Photo Delete Error', [
                'document_request_id' => $id,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'message' => 'Failed to delete photo.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Resident: Confirm payment for approved document request
    public function confirmPayment(Request $request, $id)
    {
        try {
            $user = Auth::user();
            $docRequest = DocumentRequest::where('id', $id)
                ->where('user_id', $user->id)
                ->with(['user', 'resident'])
                ->firstOrFail();

            // Check if document is approved and has payment amount
            if (strtolower($docRequest->status) !== 'approved') {
                return response()->json([
                    'message' => 'Only approved document requests can be paid.',
                    'error_code' => 'NOT_APPROVED'
                ], 400);
            }

            if (!$docRequest->payment_amount || $docRequest->payment_amount <= 0) {
                return response()->json([
                    'message' => 'No payment amount set for this document request.',
                    'error_code' => 'NO_PAYMENT_AMOUNT'
                ], 400);
            }

            if ($docRequest->payment_status === 'paid') {
                return response()->json([
                    'message' => 'Payment has already been confirmed for this document request.',
                    'error_code' => 'ALREADY_PAID'
                ], 400);
            }

            // Update payment status
            $docRequest->update([
                'payment_status' => 'paid',
                'payment_date' => now(),
                'payment_completed' => 1
            ]);

            // Send notification to admin about payment confirmation
            $this->sendPaymentConfirmationNotification($docRequest);

            return response()->json([
                'message' => 'Payment confirmed successfully. Your document will be processed.',
                'document_request' => $docRequest->load(['user', 'resident'])
            ]);

        } catch (\Exception $e) {
            \Log::error('Payment Confirmation Error', [
                'document_request_id' => $id,
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Failed to confirm payment.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Admin: Confirm payment for a document request
    public function adminConfirmPayment(Request $request, $id)
    {
        try {
            $docRequest = DocumentRequest::findOrFail($id);

            // Check if document is approved and has payment amount
            if (strtolower($docRequest->status) !== 'approved') {
                return response()->json([
                    'message' => 'Only approved document requests can be paid.',
                    'error_code' => 'NOT_APPROVED'
                ], 400);
            }

            if (!$docRequest->payment_amount || $docRequest->payment_amount <= 0) {
                return response()->json([
                    'message' => 'No payment amount set for this document request.',
                    'error_code' => 'NO_PAYMENT_AMOUNT'
                ], 400);
            }

            if ($docRequest->payment_status === 'paid') {
                return response()->json([
                    'message' => 'Payment has already been confirmed for this document request.',
                    'error_code' => 'ALREADY_PAID'
                ], 400);
            }

            // Update payment status
            $docRequest->update([
                'payment_status' => 'paid',
                'payment_date' => now(),
                'payment_completed' => 1
            ]);

            // Send notification to admin about payment confirmation
            $this->sendPaymentConfirmationNotification($docRequest);

            return response()->json([
                'message' => 'Payment confirmed successfully. Document has been moved to records.',
                'document_request' => $docRequest->load(['user', 'resident'])
            ]);

        } catch (\Exception $e) {
            \Log::error('Admin Payment Confirmation Error', [
                'document_request_id' => $id,
                'admin_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Failed to confirm payment.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Admin: Get paid document records (for Document Records section)
    public function getPaidRecords(Request $request)
    {
        try {
            $query = DocumentRequest::where('payment_status', 'paid')
                ->where('status', 'approved')
                ->with(['user', 'resident', 'paymentApprovedBy', 'paymentConfirmedBy']);

            // Filter by document type if provided
            if ($request->has('document_type') && $request->document_type !== 'all') {
                $query->where('document_type', $request->document_type);
            }

            // Filter by date range if provided
            if ($request->has('date_from')) {
                $query->whereDate('payment_confirmed_at', '>=', $request->date_from);
            }
            if ($request->has('date_to')) {
                $query->whereDate('payment_confirmed_at', '<=', $request->date_to);
            }

            $records = $query->orderBy('payment_confirmed_at', 'desc')->get();

            return response()->json($records);

        } catch (\Exception $e) {
            \Log::error('Get Paid Records Error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Failed to fetch paid records.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Get document type statistics
    public function getDocumentTypeStats()
    {
        try {
            $stats = DocumentRequest::selectRaw('document_type, COUNT(*) as total_count')
                ->where('payment_status', 'paid')
                ->where('status', 'approved')
                ->groupBy('document_type')
                ->get();

            return response()->json($stats);

        } catch (\Exception $e) {
            \Log::error('Get Document Type Stats Error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Failed to fetch document type statistics.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Send payment approval notification to resident
    private function sendPaymentApprovalNotification($documentRequest)
    {
        try {
            // This would integrate with your notification system
            // For now, we'll just log it
            \Log::info('Payment Approval Notification', [
                'document_request_id' => $documentRequest->id,
                'user_id' => $documentRequest->user_id,
                'document_type' => $documentRequest->document_type,
                'payment_amount' => $documentRequest->payment_amount,
                'resident_name' => $documentRequest->user->name ?? 'Unknown'
            ]);

            // TODO: Implement actual notification sending
            // This could be email, SMS, or in-app notification

        } catch (\Exception $e) {
            \Log::error('Send Payment Approval Notification Error', [
                'document_request_id' => $documentRequest->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    // Send payment confirmation notification to admin
    private function sendPaymentConfirmationNotification($documentRequest)
    {
        try {
            // This would integrate with your notification system
            // For now, we'll just log it
            \Log::info('Payment Confirmation Notification', [
                'document_request_id' => $documentRequest->id,
                'user_id' => $documentRequest->user_id,
                'document_type' => $documentRequest->document_type,
                'payment_amount' => $documentRequest->payment_amount,
                'resident_name' => $documentRequest->user->name ?? 'Unknown'
            ]);

            // TODO: Implement actual notification sending
            // This could be email, SMS, or in-app notification

        } catch (\Exception $e) {
            \Log::error('Send Payment Confirmation Notification Error', [
                'document_request_id' => $documentRequest->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    // Export paid document records to Excel
    public function exportExcel()
    {
        try {
            \Log::info('Starting Excel export for paid document records');
            
            // Get only paid and approved document requests with related data
            $records = DocumentRequest::with(['user', 'resident'])
                ->where('payment_status', 'paid')
                ->where('status', 'approved')
                ->orderBy('created_at', 'desc')
                ->get();
            
            \Log::info('Retrieved paid records for export', [
                'count' => $records->count()
            ]);
            
            if ($records->isEmpty()) {
                return response()->json([
                    'message' => 'No paid document records found to export.'
                ], 404);
            }
            
            // Generate filename with current date
            $filename = 'Paid_Document_Records_' . now()->format('Y-m-d_H-i-s') . '.xlsx';
            
            \Log::info('Generating Excel file for paid records', [
                'filename' => $filename,
                'record_count' => $records->count()
            ]);
            
            // Return Excel download
            return Excel::download(new DocumentRecordsExport($records), $filename);
            
        } catch (\Exception $e) {
            \Log::error('Excel Export Error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Failed to export paid document records to Excel.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Test Excel export (returns JSON for debugging)
    public function testExcelExport()
    {
        try {
            \Log::info('Testing Excel export functionality for paid records');
            
            // Get paid and approved document requests with related data
            $records = DocumentRequest::with(['user', 'resident'])
                ->where('payment_status', 'paid')
                ->where('status', 'approved')
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get();
            
            \Log::info('Retrieved test paid records', [
                'count' => $records->count()
            ]);
            
            return response()->json([
                'message' => 'Excel export test successful for paid records',
                'record_count' => $records->count(),
                'sample_record' => $records->first(),
                'excel_available' => class_exists('Maatwebsite\Excel\Facades\Excel'),
                'export_class_available' => class_exists('App\Exports\DocumentRecordsExport'),
                'filter_applied' => 'payment_status=paid AND status=approved'
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Excel Export Test Error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Excel export test failed',
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }
}