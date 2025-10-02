<?php

namespace App\Http\Controllers;

use App\Models\ResidentNotification;
use App\Models\Resident;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ResidentNotificationController extends Controller
{
    /**
     * Get notifications for the authenticated resident
     */
    public function index(Request $request)
    {
        try {
            $user = $request->user();
            $resident = Resident::where('user_id', $user->id)->first();

            if (!$resident) {
                return response()->json([
                    'success' => false,
                    'message' => 'Resident profile not found'
                ], 404);
            }

            $notifications = ResidentNotification::where('resident_id', $resident->id)
                ->with('program')
                ->orderBy('created_at', 'desc')
                ->get();

            $unreadCount = $notifications->where('is_read', false)->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'notifications' => $notifications,
                    'unread_count' => $unreadCount
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch notifications: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(Request $request, $id)
    {
        try {
            $user = $request->user();
            $resident = Resident::where('user_id', $user->id)->first();

            if (!$resident) {
                return response()->json([
                    'success' => false,
                    'message' => 'Resident profile not found'
                ], 404);
            }

            $notification = ResidentNotification::where('id', $id)
                ->where('resident_id', $resident->id)
                ->first();

            if (!$notification) {
                return response()->json([
                    'success' => false,
                    'message' => 'Notification not found'
                ], 404);
            }

            $notification->markAsRead();

            return response()->json([
                'success' => true,
                'message' => 'Notification marked as read'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark notification as read: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(Request $request)
    {
        try {
            $user = $request->user();
            $resident = Resident::where('user_id', $user->id)->first();

            if (!$resident) {
                return response()->json([
                    'success' => false,
                    'message' => 'Resident profile not found'
                ], 404);
            }

            ResidentNotification::where('resident_id', $resident->id)
                ->where('is_read', false)
                ->update([
                    'is_read' => true,
                    'read_at' => now()
                ]);

            return response()->json([
                'success' => true,
                'message' => 'All notifications marked as read'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark all notifications as read: ' . $e->getMessage()
            ], 500);
        }
    }
}