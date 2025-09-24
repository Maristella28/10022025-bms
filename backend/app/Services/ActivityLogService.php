<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ActivityLogService
{
    /**
     * Log an activity
     */
    public static function log(
        string $action,
        ?Model $model = null,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?string $description = null,
        ?Request $request = null
    ): ActivityLog {
        $userId = Auth::id();
        $ipAddress = $request ? $request->ip() : request()->ip();
        $userAgent = $request ? $request->userAgent() : request()->userAgent();

        $modelType = $model ? get_class($model) : null;
        $modelId = $model ? $model->getKey() : null;

        // Generate description if not provided
        if (!$description) {
            $description = self::generateDescription($action, $model, $userId);
        }

        return ActivityLog::create([
            'user_id' => $userId,
            'action' => $action,
            'model_type' => $modelType,
            'model_id' => $modelId,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
            'description' => $description,
        ]);
    }

    /**
     * Log user authentication activities
     */
    public static function logAuth(string $action, ?Request $request = null): ActivityLog
    {
        $user = Auth::user();
        $userName = $user && isset($user->name) ? $user->name : 'Unknown';
        $userEmail = $user && isset($user->email) ? $user->email : '';

        $description = match($action) {
            'login' => "User {$userName} ({$userEmail}) logged in",
            'logout' => "User {$userName} ({$userEmail}) logged out",
            'register' => "User {$userName} ({$userEmail}) registered",
            'verify_email' => "User {$userName} ({$userEmail}) verified email",
            default => "User authentication: {$action}"
        };

        return self::log($action, $user ?? null, null, null, $description, $request);
    }

    /**
     * Log model creation
     */
    public static function logCreated(Model $model, ?Request $request = null): ActivityLog
    {
        $description = self::generateDescription('created', $model, Auth::id());
        return self::log('created', $model, null, $model->toArray(), $description, $request);
    }

    /**
     * Log model update
     */
    public static function logUpdated(Model $model, array $oldValues = [], ?Request $request = null): ActivityLog
    {
        $description = self::generateDescription('updated', $model, Auth::id());
        return self::log('updated', $model, $oldValues, $model->toArray(), $description, $request);
    }

    /**
     * Log model deletion
     */
    public static function logDeleted(Model $model, ?Request $request = null): ActivityLog
    {
        $description = self::generateDescription('deleted', $model, Auth::id());
        return self::log('deleted', $model, $model->toArray(), null, $description, $request);
    }

    /**
     * Log admin actions
     */
    public static function logAdminAction(string $action, ?string $description = null, ?Request $request = null): ActivityLog
    {
        $user = Auth::user();
        $userName = $user && isset($user->name) ? $user->name : 'Unknown Admin';
        if (!$description) {
            $description = "Admin {$userName} performed action: {$action}";
        }

        return self::log("admin.{$action}", null, null, null, $description, $request);
    }

    /**
     * Generate a human-readable description for the activity
     */
    private static function generateDescription(string $action, ?Model $model, ?int $userId): string
    {
        $user = $userId ? \App\Models\User::find($userId) : null;
        $userName = $user ? $user->name : 'System';

        if (!$model) {
            return "{$userName} performed action: {$action}";
        }

        $modelName = class_basename($model);
        $modelId = $model->getKey();

        return match($action) {
            'created' => "{$userName} created {$modelName} #{$modelId}",
            'updated' => "{$userName} updated {$modelName} #{$modelId}",
            'deleted' => "{$userName} deleted {$modelName} #{$modelId}",
            'viewed' => "{$userName} viewed {$modelName} #{$modelId}",
            default => "{$userName} performed {$action} on {$modelName} #{$modelId}"
        };
    }

    /**
     * Get activity logs with filtering
     */
    public static function getLogs(array $filters = []): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        $query = ActivityLog::with('user')->orderBy('created_at', 'desc');

        if (isset($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (isset($filters['action'])) {
            $query->where('action', $filters['action']);
        }

        if (isset($filters['model_type'])) {
            $query->where('model_type', $filters['model_type']);
        }

        if (isset($filters['date_from'])) {
            $query->where('created_at', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->where('created_at', '<=', $filters['date_to']);
        }

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('action', 'like', "%{$search}%");
            });
        }

        return $query->paginate($filters['per_page'] ?? 50);
    }
}
