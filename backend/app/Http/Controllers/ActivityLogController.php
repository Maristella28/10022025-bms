<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ActivityLogController extends Controller
{
    /**
     * Get paginated activity logs with filtering
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        // Only admins can view activity logs
        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $filters = $request->only([
            'user_id',
            'action',
            'model_type',
            'date_from',
            'date_to',
            'search',
            'per_page'
        ]);

        $logs = ActivityLogService::getLogs($filters);

        return response()->json([
            'logs' => $logs,
            'filters' => $filters,
        ]);
    }

    /**
     * Get a specific activity log
     */
    public function show($id)
    {
        $user = Auth::user();

        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $log = ActivityLog::with('user')->findOrFail($id);

        return response()->json(['log' => $log]);
    }

    /**
     * Get activity log statistics
     */
    public function statistics(Request $request)
    {
        $user = Auth::user();

        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $dateFrom = $request->get('date_from', now()->subDays(30));
        $dateTo = $request->get('date_to', now());

        $stats = [
            'total_logs' => ActivityLog::whereBetween('created_at', [$dateFrom, $dateTo])->count(),
            'login_count' => ActivityLog::where('action', 'login')->whereBetween('created_at', [$dateFrom, $dateTo])->count(),
            'user_registrations' => ActivityLog::where('action', 'created')->where('model_type', 'App\Models\User')->whereBetween('created_at', [$dateFrom, $dateTo])->count(),
            'resident_updates' => ActivityLog::where('action', 'updated')->where('model_type', 'App\Models\Resident')->whereBetween('created_at', [$dateFrom, $dateTo])->count(),
            'admin_actions' => ActivityLog::where('action', 'like', 'admin.%')->whereBetween('created_at', [$dateFrom, $dateTo])->count(),
            'top_actions' => ActivityLog::selectRaw('action, COUNT(*) as count')
                ->whereBetween('created_at', [$dateFrom, $dateTo])
                ->groupBy('action')
                ->orderBy('count', 'desc')
                ->limit(10)
                ->get(),
            'active_users' => ActivityLog::selectRaw('user_id, COUNT(*) as activity_count')
                ->whereBetween('created_at', [$dateFrom, $dateTo])
                ->whereNotNull('user_id')
                ->groupBy('user_id')
                ->orderBy('activity_count', 'desc')
                ->limit(10)
                ->with('user')
                ->get(),
        ];

        return response()->json(['statistics' => $stats]);
    }

    /**
     * Get available filter options
     */
    public function filters()
    {
        $user = Auth::user();

        \Log::info('Filters method accessed', [
            'user_id' => $user->id ?? null,
            'user_role' => $user->role ?? null,
        ]);

        if ($user->role !== 'admin') {
            \Log::warning('Unauthorized access to filters method', [
                'user_id' => $user->id ?? null,
                'user_role' => $user->role ?? null,
            ]);
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $filters = [
            'actions' => ActivityLog::select('action')->distinct()->pluck('action'),
            'model_types' => ActivityLog::select('model_type')->distinct()->whereNotNull('model_type')->pluck('model_type'),
            'users' => ActivityLog::with('user:id,name,email')
                ->select('user_id')
                ->distinct()
                ->whereNotNull('user_id')
                ->get()
                ->pluck('user'),
        ];

        \Log::info('Filters method response', [
            'filters' => $filters,
        ]);

        return response()->json(['filters' => $filters]);
    }

    /**
     * Export activity logs (basic implementation)
     */
    public function export(Request $request)
    {
        $user = Auth::user();

        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $filters = $request->only([
            'user_id',
            'action',
            'model_type',
            'date_from',
            'date_to',
            'search'
        ]);

        $logs = ActivityLogService::getLogs(array_merge($filters, ['per_page' => 1000]));

        // Log the export action
        ActivityLogService::logAdminAction('export_activity_logs', "Admin exported activity logs", $request);

        return response()->json([
            'message' => 'Export data prepared',
            'logs' => $logs,
            'exported_at' => now(),
        ]);
    }

    /**
     * Delete old activity logs (cleanup)
     */
    public function cleanup(Request $request)
    {
        $user = Auth::user();

        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $days = $request->get('days', 90); // Default 90 days
        $deletedCount = ActivityLog::where('created_at', '<', now()->subDays($days))->delete();

        // Log the cleanup action
        ActivityLogService::logAdminAction('cleanup_activity_logs', "Admin deleted {$deletedCount} activity logs older than {$days} days", $request);

        return response()->json([
            'message' => "Successfully deleted {$deletedCount} old activity logs",
            'deleted_count' => $deletedCount,
        ]);
    }

    /**
     * Security alerts (placeholder implementation)
     */
    public function securityAlerts(Request $request)
    {
        $user = Auth::user();
        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json([
            'alerts' => [],
        ]);
    }

    /**
     * Audit summary (basic metrics)
     */
    public function auditSummary(Request $request)
    {
        $user = Auth::user();
        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $dateFrom = $request->get('date_from', now()->subDays(30));
        $dateTo = $request->get('date_to', now());

        $successfulOperations = ActivityLog::whereBetween('created_at', [$dateFrom, $dateTo])->count();
        $failedOperations = ActivityLog::whereBetween('created_at', [$dateFrom, $dateTo])
            ->where('action', 'like', '%failed%')
            ->count();

        return response()->json([
            'audit_summary' => [
                'successful_operations' => $successfulOperations,
                'failed_operations' => $failedOperations,
                'avg_response_time' => 0,
            ],
        ]);
    }
}
