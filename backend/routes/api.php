<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ResidentProfileController;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\ResidentController;
use App\Http\Controllers\AssetController;
use App\Http\Controllers\AssetRequestController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\BlotterRequestController;
use App\Http\Controllers\BlotterRecordsController;
use App\Http\Controllers\OrganizationalChartController;
use App\Http\Controllers\EmergencyHotlineController;
use App\Http\Controllers\DisasterEmergencyRecordController;
use App\Http\Controllers\FinancialRecordController;
use App\Http\Controllers\DocumentRequestController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\ProfileStatusController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\ResidencyStatusController;
use App\Http\Controllers\BeneficiaryController;

/*
|--------------------------------------------------------------------------
| Public API Routes (No Authentication Required)
|--------------------------------------------------------------------------
*/

// Test route to verify API is working
Route::get('/test-connection', function() {
    return response()->json([
        'message' => 'API connection is working',
        'timestamp' => now(),
        'server_status' => 'OK'
    ]);
});

// Email verification routes
Route::post('/resend-verification-code', [AuthController::class, 'resendVerificationCode']);
Route::post('/verify-registration', [AuthController::class, 'verifyRegistration']);

// User routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::get('/user/permissions', [\App\Http\Controllers\UserController::class, 'getPermissions']);
});

// Admin Routes Group
Route::prefix('admin')->middleware(['auth:sanctum', 'admin'])->group(function () {
    // Staff Management Routes
    Route::get('/staff', [StaffController::class, 'index']);
    Route::post('/staff', [StaffController::class, 'store']);
    Route::get('/staff/{id}', [StaffController::class, 'show']);
    Route::put('/staff/{id}', [StaffController::class, 'update']);
    Route::put('/staff/{id}/permissions', [StaffController::class, 'updateModulePermissions']);
    Route::delete('/staff/{id}', [StaffController::class, 'destroy']);

    // Residents Search Route
    Route::get('/residents/search', [ResidentController::class, 'search']);
});

// Restore a soft deleted resident by ID
Route::post('/residents/{id}/restore', [App\Http\Controllers\ResidentRestoreController::class, 'restore'])->middleware(['auth:sanctum', 'admin']);

// Profile fallback route for debugging (outside auth middleware)
Route::get('/profile-debug', function(Request $request) {
    $authHeader = $request->header('Authorization');
    $token = null;
    if ($authHeader && str_starts_with($authHeader, 'Bearer ')) {
        $token = substr($authHeader, 7);
    }
    
    return response()->json([
        'message' => 'Profile debug endpoint',
        'has_auth_header' => !empty($authHeader),
        'token_present' => !empty($token),
        'token_length' => $token ? strlen($token) : 0,
        'headers' => $request->headers->all(),
        'timestamp' => now()
    ]);
});

// 🔐 Authentication
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']); // Returns Bearer token

// Name and email uniqueness validation
Route::post('/validate-name-uniqueness', [AuthController::class, 'validateNameUniqueness']);
Route::post('/validate-email-uniqueness', [AuthController::class, 'validateEmailUniqueness']);

// 🔐 New Verification Code Routes
Route::post('/verify-registration', [AuthController::class, 'verifyRegistration']);
Route::post('/resend-verification-code', [AuthController::class, 'resendVerificationCode']);

// Test route for debugging
Route::post('/test-register', function(Request $request) {
    \Log::info('Test registration attempt:', $request->all());
    return response()->json([
        'message' => 'Test registration received',
        'data' => $request->all()
    ]);
});

// Debug registration validation
Route::post('/debug-register', function(Request $request) {
    \Log::info('Debug registration attempt:', $request->all());
    
    try {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|unique:users',
            'password' => 'required|string|min:8',
            'role'     => 'nullable|string|in:admin,staff,treasurer,residents',
        ]);
        
        return response()->json([
            'message' => 'Validation passed',
            'validated' => $validated
        ]);
    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json([
            'message' => 'Validation failed',
            'errors' => $e->errors(),
            'request_data' => $request->all()
        ], 422);
    }
});

// 📧 Email Verification Routes (Legacy - keeping for compatibility)
Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])->name('verification.verify');
Route::post('/email/resend', [AuthController::class, 'resendVerification'])->name('verification.resend');

// 📢 Public Announcements (only "posted" shown to guests)
Route::get('/announcements', [AnnouncementController::class, 'index']);

// 🆔 Fetch individual user (used in modal selection)
Route::get('/user/{id}', function ($id) {
    $user = \App\Models\User::find($id);
    if (!$user) {
        return response()->json(['message' => 'User not found'], 404);
    }
    return response()->json(['user' => $user]);
});

// 📋 Organizational Chart (Public)
Route::get('/organizational-chart/officials', [OrganizationalChartController::class, 'getOfficials']);
Route::get('/organizational-chart/staff', [OrganizationalChartController::class, 'getStaff']);

// 📞 Emergency Hotlines (public)
Route::get('/emergency-hotlines', [EmergencyHotlineController::class, 'index']);
Route::get('/emergency-hotlines/{id}', [EmergencyHotlineController::class, 'show']);

/*
|--------------------------------------------------------------------------
| Protected API Routes (Authenticated via Sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'throttle:200,1'])->group(function () {

    // 🔒 Authenticated user endpoints
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', fn(Request $request) => response()->json($request->user()));
    // Increased throttle for profile and notifications endpoints to prevent 429 errors
    Route::middleware('throttle:120,1')->group(function () {
        Route::get('/profile', [ResidentProfileController::class, 'show']);
        Route::get('/notifications', function (Request $request) {
            // Return notifications for the authenticated user
            $user = $request->user();
            $notifications = $user->notifications ?? collect();
            return response()->json([
                'notifications' => $notifications
            ]);
        });
    });

    // ✅ Mark user as having logged in
    Route::patch('/user/update-login-status', function (Request $request) {
        $user = $request->user();
        $user->has_logged_in = true;
        $user->save();

        return response()->json(['message' => 'Login status updated']);
    });

    /*
    |--------------------------------------------------------------------------
    | Admin-Only Routes
    |--------------------------------------------------------------------------
    */
    Route::middleware('admin')->prefix('admin')->group(function () {
        // Admin Profile routes - moved to /admin/profile to avoid conflict with resident profile
        Route::get('/profile', [\App\Http\Controllers\AdminProfileController::class, 'show']);
        Route::put('/profile', [\App\Http\Controllers\AdminProfileController::class, 'update']);

        // 🧑‍💼 User management
        Route::post('/register', [AuthController::class, 'register']);
        Route::delete('/user/{id}', [AuthController::class, 'deleteUser']);

        // 📊 Dashboard summary
        Route::get('/dashboard', [AdminController::class, 'index']);

        // 👥 Residents list
        Route::get('/residents', [ResidentProfileController::class, 'index']);
        Route::get('/residents-list', [ResidentController::class, 'index']);
        Route::get('/residents-deleted', [ResidentController::class, 'trashed']); // Get soft deleted residents
        
        // 📊 Reporting Module - MUST come before {id} routes to avoid conflicts
        Route::get('/residents/report', [ResidentController::class, 'report']);
        Route::post('/residents/batch-check-review', [ResidentController::class, 'batchCheckReviewStatus']);
        
        Route::get('/residents/{id}', [ResidentProfileController::class, 'showById']);
        Route::put('/residents/{id}', [ResidentController::class, 'update']); // Admin update
        Route::post('/residents/{id}/delete', [ResidentController::class, 'destroy']); // Admin soft delete
        
        // 🏠 Residency Verification
        Route::post('/residents/{id}/approve-verification', [ResidentProfileController::class, 'approveVerification']);
        Route::post('/residents/{id}/deny-verification', [ResidentProfileController::class, 'denyVerification']);

        // 📢 Announcements full CRUD
        Route::get('/announcements', [AnnouncementController::class, 'index']); // Admin can see all announcements
        Route::apiResource('/announcements', AnnouncementController::class)->except(['index']);
        Route::patch('/announcements/{announcement}/toggle', [AnnouncementController::class, 'toggleStatus']);

        // 🔍 Users without existing profiles
        Route::get('/users-without-profiles', [AdminController::class, 'usersWithoutProfiles']);

        // ✅ Check if user already has a profile
        Route::get('/users/{id}/has-profile', function ($id) {
            $user = \App\Models\User::with('profile')->find($id);
            if (!$user) {
                return response()->json(['message' => 'User not found.'], 404);
            }
            return response()->json(['exists' => $user->profile !== null]);
        });

        // 🧑‍🤝‍🧑 Get all users with 'residents' role
        Route::get('/residents-users', [AdminController::class, 'residents']);

        // 📋 Projects CRUD (Admin only)
        Route::apiResource('/projects', App\Http\Controllers\ProjectController::class);
        
        // 🧑‍💼 Barangay Officials & Staff Management (Admin only)
        Route::post('/officials', [OrganizationalChartController::class, 'store']);
        Route::put('/officials/{id}', [OrganizationalChartController::class, 'update']);
        Route::delete('/officials/{id}', [OrganizationalChartController::class, 'destroy']);

        // 📝 Feedback management (Admin only)
        Route::apiResource('/feedbacks', App\Http\Controllers\FeedbackController::class);

        // 📞 Emergency Hotlines (admin CRUD)
        Route::post('/emergency-hotlines', [EmergencyHotlineController::class, 'store']);
        Route::put('/emergency-hotlines/{id}', [EmergencyHotlineController::class, 'update']);
        Route::delete('/emergency-hotlines/{id}', [EmergencyHotlineController::class, 'destroy']);


        Route::get('/activity-logs', [ActivityLogController::class, 'index']);
        Route::get('/activity-logs/{id}', [ActivityLogController::class, 'show']);
        Route::get('/activity-logs/statistics/summary', [ActivityLogController::class, 'statistics']);
        Route::get('/activity-logs/filters/options', [ActivityLogController::class, 'filters']);
        Route::get('/activity-logs/security/alerts', [ActivityLogController::class, 'securityAlerts']);
        Route::get('/activity-logs/audit/summary', [ActivityLogController::class, 'auditSummary']);
        Route::post('/activity-logs/export', [ActivityLogController::class, 'export']);
        Route::delete('/activity-logs/cleanup', [ActivityLogController::class, 'cleanup']);

        // Residency Status update by admin
        Route::post('/residency-status/{userId}', [ResidencyStatusController::class, 'updateStatus']);

        // Toggle My Benefits permission for a resident (admin only)
        Route::post('/residents/{id}/toggle-my-benefits', [\App\Http\Controllers\ResidentBenefitsController::class, 'toggle']);

        // 🎯 Programs Management (Admin only)
        Route::apiResource('programs', App\Http\Controllers\ProgramController::class);
        Route::post('/programs/{id}/notify-payout-change', [App\Http\Controllers\ProgramController::class, 'notifyPayoutChange']);
        
        // Program Application Forms (Admin only)
        Route::apiResource('program-application-forms', App\Http\Controllers\ProgramApplicationFormController::class);
        Route::post('/program-application-forms/{id}/publish', [App\Http\Controllers\ProgramApplicationFormController::class, 'publish']);
        Route::get('/program-application-forms/{id}/submissions', [App\Http\Controllers\ProgramApplicationFormController::class, 'getFormSubmissions']);
        Route::put('/program-application-forms/submissions/{submissionId}/status', [App\Http\Controllers\ProgramApplicationFormController::class, 'updateSubmissionStatus']);
        Route::get('/programs/{programId}/qualified-residents', [App\Http\Controllers\ProgramApplicationFormController::class, 'getQualifiedResidents']);
        
        // Program Announcements (Admin only)
        Route::apiResource('program-announcements', App\Http\Controllers\ProgramAnnouncementController::class);
        Route::post('/program-announcements/{id}/publish', [App\Http\Controllers\ProgramAnnouncementController::class, 'publish']);

        // 🏠 Household management
        Route::get('/households', [\App\Http\Controllers\HouseholdController::class, 'index']);
        Route::post('/households', [\App\Http\Controllers\HouseholdController::class, 'store']);
        Route::get('/households/{id}', [\App\Http\Controllers\HouseholdController::class, 'show']);
        Route::put('/households/{id}', [\App\Http\Controllers\HouseholdController::class, 'update']);
        Route::delete('/households/{id}', [\App\Http\Controllers\HouseholdController::class, 'destroy']);
        
        // 👥 Beneficiaries Management (Admin only)
        Route::apiResource('beneficiaries', App\Http\Controllers\BeneficiaryController::class);
        Route::post('/beneficiaries/{id}/toggle-visibility', [App\Http\Controllers\BeneficiaryController::class, 'toggleVisibility']);
        Route::post('/beneficiaries/{id}/mark-paid', [App\Http\Controllers\BeneficiaryController::class, 'markPaid']);
        Route::get('/beneficiaries/{id}/download-receipt', [App\Http\Controllers\BeneficiaryController::class, 'downloadReceipt']);
    });
    /*
    |--------------------------------------------------------------------------
    | Shared Authenticated Routes
    |--------------------------------------------------------------------------
    */

    // 👤 Resident: Own profile - Fixed routing
    Route::prefix('profile')->group(function () {
        Route::get('/', [ResidentProfileController::class, 'show']);
        Route::post('/update', [ResidentProfileController::class, 'update']);
        Route::put('/update', [ResidentProfileController::class, 'update']);
        Route::patch('/update', [ResidentProfileController::class, 'update']);
    });
    
    // Additional direct profile routes for compatibility
    Route::post('/profile/update', [ResidentProfileController::class, 'update']);
    Route::put('/profile/update', [ResidentProfileController::class, 'update']);
    Route::patch('/profile/update', [ResidentProfileController::class, 'update']);
    Route::post('/profile/upload-residency-verification', [ResidentProfileController::class, 'uploadResidencyVerification']);

    // 🆕 Resident: Complete first-time profile (Authenticated only)
    Route::post('/residents/complete-profile', [ResidentProfileController::class, 'store']);
    Route::put('/residents/complete-profile', [ResidentProfileController::class, 'store']);
    Route::get('/residents/my-profile', [ResidentController::class, 'myProfile']);

    // 🧾 Authenticated users (incl. admin): Read residents
    // Apply profile.complete middleware to protect resident-facing modules for incomplete profiles
    Route::middleware('profile.complete')->group(function () {
        Route::get('/residents', [ResidentProfileController::class, 'index']);
        Route::get('/residents/{id}', [ResidentProfileController::class, 'showById']);

        // Document Requests (resident-facing)
        Route::get('/document-requests', [App\Http\Controllers\DocumentRequestController::class, 'index']);
        Route::post('/document-requests', [App\Http\Controllers\DocumentRequestController::class, 'store']);
        Route::get('/document-requests/my', [App\Http\Controllers\DocumentRequestController::class, 'myRequests']);
        Route::post('/document-requests/{id}/confirm-payment', [App\Http\Controllers\DocumentRequestController::class, 'confirmPayment']); // Resident confirm payment

        // Projects reactions and viewing
        Route::post('/projects/{projectId}/react', [App\Http\Controllers\ProjectReactionController::class, 'react']);
        Route::delete('/projects/{projectId}/react', [App\Http\Controllers\ProjectReactionController::class, 'removeReaction']);
        Route::get('/projects/{projectId}/reactions', [App\Http\Controllers\ProjectReactionController::class, 'index']);
        Route::get('/projects/{projectId}/user-reaction', [App\Http\Controllers\ProjectReactionController::class, 'getUserReaction']);

        // Blotter Requests (resident submit)
        Route::post('/blotter-requests', [BlotterRequestController::class, 'store']);
        
        // My Benefits API - access controlled by mybenefits.allowed
        Route::middleware('mybenefits.allowed')->get('/my-benefits', [BeneficiaryController::class, 'getMyBenefits']);
        Route::middleware('mybenefits.allowed')->get('/my-benefits/{id}/track', [BeneficiaryController::class, 'getProgramTracking']);
        Route::middleware('mybenefits.allowed')->post('/my-benefits/{id}/upload-proof', [BeneficiaryController::class, 'uploadProofOfPayout']);
        Route::middleware('mybenefits.allowed')->post('/my-benefits/{id}/validate-receipt', [BeneficiaryController::class, 'validateReceipt']);
    });

    // 🔔 Legacy Notifications (keeping for compatibility)
    Route::get('/legacy-notifications', function (Request $request) {
        // Return notifications for the authenticated user
        $user = $request->user();
        $notifications = $user->notifications ?? collect();
        return response()->json([
            'notifications' => $notifications
        ]);
    });
    Route::patch('/legacy-notifications/{id}/read', [NotificationController::class, 'markAsRead']);

    // Assets
    Route::get('/assets', [AssetController::class, 'index']);
    Route::post('/assets', [AssetController::class, 'store']); // admin
    Route::patch('/assets/{id}', [AssetController::class, 'update']); // admin
    Route::get('/assets/{id}', [AssetController::class, 'show']);

    // Asset Requests
    Route::post('/assets/request', [AssetRequestController::class, 'store'])
        ->middleware('throttle:100,1'); // 100 requests per minute for dev
    Route::get('/asset-requests', [AssetRequestController::class, 'index']);
    // Place static routes before dynamic to avoid conflicts
    Route::get('/asset-requests/status-counts', [AssetRequestController::class, 'getStatusCounts']); // Get status counts
    Route::post('/asset-requests/generate-receipt', [AssetRequestController::class, 'generateReceipt']); // Generate PDF receipt
    Route::patch('/asset-requests/{id}', [AssetRequestController::class, 'update'])->whereNumber('id'); // admin
    Route::post('/asset-requests/{id}/pay', [AssetRequestController::class, 'processPayment'])->whereNumber('id'); // Process payment
    Route::delete('/asset-requests/{id}', [AssetRequestController::class, 'destroy'])->whereNumber('id');
    Route::get('/asset-requests/{id}', [AssetRequestController::class, 'show'])->whereNumber('id');

    // Blotter Requests - REMOVED DUPLICATE (already defined in profile.complete middleware group above)

    // 📋 Projects CRUD (Admin only)
    // Route::apiResource('/projects', App\Http\Controllers\ProjectController::class); // Moved inside admin group

    // 📝 Feedback management (Admin only)
    // Route::apiResource('/feedbacks', App\Http\Controllers\FeedbackController::class); // Moved inside admin group

    // 💬 Project Reactions (Authenticated users)
    Route::post('/projects/{projectId}/react', [App\Http\Controllers\ProjectReactionController::class, 'react']);
    Route::delete('/projects/{projectId}/react', [App\Http\Controllers\ProjectReactionController::class, 'removeReaction']);
    Route::get('/projects/{projectId}/reactions', [App\Http\Controllers\ProjectReactionController::class, 'index']);
    Route::get('/projects/{projectId}/user-reaction', [App\Http\Controllers\ProjectReactionController::class, 'getUserReaction']);

    // Document Requests - Admin only routes (outside profile.complete middleware)
    Route::match(['put', 'patch'], '/document-requests/{id}', [App\Http\Controllers\DocumentRequestController::class, 'update']); // Admin update
    Route::post('/document-requests/{id}/generate-pdf', [App\Http\Controllers\DocumentRequestController::class, 'generatePdf']); // Generate PDF
    Route::get('/document-requests/{id}/download-pdf', [App\Http\Controllers\DocumentRequestController::class, 'downloadPdf']); // Download PDF
    Route::get('/test-pdf', [App\Http\Controllers\DocumentRequestController::class, 'testPdf']); // Test PDF system
    Route::get('/document-requests/paid-records', [App\Http\Controllers\DocumentRequestController::class, 'getPaidRecords']); // Get paid records for Document Records
    Route::get('/document-requests/document-type-stats', [App\Http\Controllers\DocumentRequestController::class, 'getDocumentTypeStats']); // Get document type statistics
    Route::get('/document-requests/export-excel', [App\Http\Controllers\DocumentRequestController::class, 'exportExcel']); // Export all document records to Excel
    Route::post('/document-requests/{id}/admin-confirm-payment', [App\Http\Controllers\DocumentRequestController::class, 'adminConfirmPayment']); // Admin confirm payment
    Route::get('/test-excel-export', [App\Http\Controllers\DocumentRequestController::class, 'exportExcel']); // Test Excel export without auth
    Route::get('/test-excel-debug', [App\Http\Controllers\DocumentRequestController::class, 'testExcelExport']); // Debug Excel export
    
    // Photo management for document requests
    Route::get('/document-requests/{id}/photo', [App\Http\Controllers\DocumentRequestController::class, 'viewPhoto']); // View uploaded photo
    Route::get('/document-requests/{id}/download-photo', [App\Http\Controllers\DocumentRequestController::class, 'downloadPhoto']); // Download photo
    Route::delete('/document-requests/{id}/photo', [App\Http\Controllers\DocumentRequestController::class, 'deletePhoto']); // Delete photo (admin only)
});

// Direct profile update routes as fallback (outside middleware group for testing)
Route::post('/profile/update-fallback', [ResidentProfileController::class, 'update'])->middleware('auth:sanctum');
Route::put('/profile/update-fallback', [ResidentProfileController::class, 'update'])->middleware('auth:sanctum');
Route::patch('/profile/update-fallback', [ResidentProfileController::class, 'update'])->middleware('auth:sanctum');
Route::get('/profile/update', function() {
    return response()->json(['message' => 'Profile update endpoint is working. Use POST, PUT, or PATCH method to update.'], 200);
})->middleware('auth:sanctum');

// Debug route to check user profile status
Route::get('/profile/debug', function(Request $request) {
    $user = $request->user();
    $resident = \App\Models\Resident::where('user_id', $user->id)->first();
    
    return response()->json([
        'user_id' => $user->id,
        'user_email' => $user->email,
        'has_resident' => $resident ? true : false,
        'resident_id' => $resident ? $resident->id : null,
        'has_profile' => $resident && $resident->profile ? true : false,
        'profile_id' => $resident && $resident->profile ? $resident->profile->id : null,
    ]);
})->middleware('auth:sanctum');

// Additional fallback routes for profile operations (outside all middleware groups)
// These are already defined above, removing duplicates

// Debug route for profile endpoint (outside auth middleware for testing)
Route::get('/profile/test', function() {
    return response()->json([
        'message' => 'Profile endpoint is accessible',
        'timestamp' => now(),
        'auth_required' => true
    ]);
});

// Simple profile status check endpoint
Route::get('/profile-status', [ProfileStatusController::class, 'check'])->middleware('auth:sanctum');

// Simple test route to verify API is working
Route::get('/test-api', function() {
    return response()->json([
        'message' => 'API is working!',
        'timestamp' => now(),
        'routes_available' => [
            '/profile/update',
            '/profile/update-fallback',
            '/residents/complete-profile',
            '/residents/complete-profile-fallback'
        ]
    ]);
});

Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/admin/blotter-requests', [BlotterRequestController::class, 'index']);
    Route::patch('/blotter-requests/{id}', [BlotterRequestController::class, 'update']);
});

Route::middleware(['auth:sanctum'])->get('/blotter-requests', [BlotterRequestController::class, 'myRequests']);
Route::get('/blotter-records', [BlotterRecordsController::class, 'index']);
Route::get('/blotter-records/{id}', [BlotterRecordsController::class, 'show']);
Route::post('/blotter-records', [BlotterRecordsController::class, 'store']);

// 📋 Projects (Read-only for all authenticated users)
Route::get('/projects', [App\Http\Controllers\ProjectController::class, 'index']);

// 📝 Feedback (Residents can submit and view their own) - Protected by auth middleware
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/feedbacks', [App\Http\Controllers\FeedbackController::class, 'store']);
    Route::get('/feedbacks/my', [App\Http\Controllers\FeedbackController::class, 'myFeedback']);
    Route::get('/feedbacks', [App\Http\Controllers\FeedbackController::class, 'index']); // Allow filtering by project_id
    
    // Program Announcements (for residents)
    Route::get('/program-announcements', [App\Http\Controllers\ProgramAnnouncementController::class, 'index']);
    Route::get('/program-announcements/residents/dashboard', [App\Http\Controllers\ProgramAnnouncementController::class, 'getForResidents']);
    
    // Program Application Forms (for residents)
    Route::get('/program-application-forms', [App\Http\Controllers\ProgramApplicationFormController::class, 'index']);
    Route::get('/program-application-forms/published', [App\Http\Controllers\ProgramApplicationFormController::class, 'getPublishedForms']);
    Route::post('/program-application-forms/{id}/submit', [App\Http\Controllers\ProgramApplicationFormController::class, 'submitApplication']);
    Route::get('/program-application-forms/{id}/submissions', [App\Http\Controllers\ProgramApplicationFormController::class, 'getFormSubmissions']);
    Route::get('/my-submissions', [App\Http\Controllers\ProgramApplicationFormController::class, 'getMySubmissions']);
    
    // Programs (for residents - only non-draft programs)
    Route::get('/programs/residents', [App\Http\Controllers\ProgramController::class, 'getForResidents']);
    Route::get('/programs/{id}', [App\Http\Controllers\ProgramController::class, 'show']);
    
    // Resident Notifications
    Route::get('/notifications', [App\Http\Controllers\ResidentNotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [App\Http\Controllers\ResidentNotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [App\Http\Controllers\ResidentNotificationController::class, 'markAllAsRead']);
    
    // Beneficiaries (for residents)
    Route::get('/my-benefits', [App\Http\Controllers\BeneficiaryController::class, 'getMyBenefits']);
    Route::get('/my-benefits/{id}/track', [App\Http\Controllers\BeneficiaryController::class, 'getProgramTracking']);
    Route::post('/my-benefits/{id}/upload-proof', [App\Http\Controllers\BeneficiaryController::class, 'uploadProofOfPayout']);
    Route::post('/my-benefits/{id}/validate-receipt', [App\Http\Controllers\BeneficiaryController::class, 'validateReceipt']);
});

// ✅ **New Backend Structure for Disaster/Emergency Records**
// 1. **Model:**  
// `app/Models/DisasterEmergencyRecord.php`
// - Fields: `type`, `date`, `location`, `description`, `actions_taken`, `casualties`, `reported_by`

// 2. **Migration:**  
// `database/migrations/2024_07_22_000001_create_disaster_emergency_records_table.php`
// - Table: `disaster_emergency_records`
// - Columns:  
//   - `id`
//   - `type` (e.g., Fire, Flood)
//   - `date`
//   - `location`
//   - `description`
//   - `actions_taken` (nullable)
//   - `casualties` (nullable)
//   - `reported_by` (nullable)
//   - `timestamps`

// 3. **Controller:**  
// `app/Http/Controllers/DisasterEmergencyRecordController.php`
// - CRUD methods: `index`, `show`, `store`, `update`, `destroy`
// - Validates and returns JSON

// 4. **Register routes** in `routes/api.php`:
// ```php
// use App\Http\Controllers\DisasterEmergencyRecordController;
// Route::apiResource('/disaster-emergencies', DisasterEmergencyRecordController::class);
// ```

// 5. **Frontend:**  
//    - Make your “Add Disaster and Emergency records” button open a form.
//    - POST to `/disaster-emergencies` with the required fields.

// 6. **Next Steps**
// 1. **Run the migration** to create the table:
//    ```sh
//    php artisan migrate
//    ```
// 2. **Register routes** in `routes/api.php`:
//    ```php
//    use App\Http\Controllers\DisasterEmergencyRecordController;
//    Route::apiResource('/disaster-emergencies', DisasterEmergencyRecordController::class);
//    ```
// 3. **Frontend:**  
//    - Make your “Add Disaster and Emergency records” button open a form.
//    - POST to `/disaster-emergencies` with the required fields.

// 7. **Would you like the full frontend form code, or help with the API routes?**  
//    - Let me know if you want to customize the fields further!


Route::apiResource('disaster-emergencies', DisasterEmergencyRecordController::class);
Route::apiResource('financial-records', FinancialRecordController::class);

// Test PDF generation
Route::get('/test-pdf', function () {
    $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('receipts.asset-rental-receipt', [
        'assetRequest' => (object)[
            'id' => 1,
            'resident' => (object)[
                'residents_id' => 'RES-001',
                'profile' => (object)[
                    'first_name' => 'John',
                    'last_name' => 'Doe',
                    'contact_number' => '09123456789',
                    'full_address' => '123 Main St, Barangay Mamatid, Cabuyao City, Laguna'
                ]
            ],
            'items' => [
                (object)[
                    'asset' => (object)[
                        'name' => 'Tent',
                        'price' => 500
                    ],
                    'quantity' => 2,
                    'request_date' => '2023-01-01'
                ],
                (object)[
                    'asset' => (object)[
                        'name' => 'Generator',
                        'price' => 1000
                    ],
                    'quantity' => 1,
                    'request_date' => '2023-01-01'
                ]
            ]
        ],
        'receiptNumber' => 'REC-001',
        'amountPaid' => 2000
    ]);
    
    return $pdf->download('test-receipt.pdf');
});
Route::apiResource('disbursements', App\Http\Controllers\DisbursementController::class);

// Program Announcements (Admin only - moved to auth middleware group above)

// Program Application Forms (Admin only - outside auth middleware for admin access)
// Note: Moved to auth middleware group below for resident access