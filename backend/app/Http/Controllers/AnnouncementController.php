<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Carbon; // For date parsing

class AnnouncementController extends Controller
{
    public function index(Request $request)
    {
        // Auto-promote any due scheduled announcements to posted
        Announcement::where('status', 'scheduled')
            ->where('published_at', '<=', now())
            ->update(['status' => 'posted']);

        $query = Announcement::orderBy('created_at', 'desc');

        // ✅ Safe check for user role
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            // Show posted and due scheduled posts to non-admins
            $query->where(function ($q) {
                $q->where('status', 'posted')
                  ->orWhere(function ($q2) {
                      $q2->where('status', 'scheduled')
                         ->where('published_at', '<=', now());
                  });
            });
        }

        $announcements = $query->get()->map(function ($a) {
            $a->image_url = $a->image ? asset('storage/' . $a->image) : null;
            return $a;
        });

        return response()->json(['announcements' => $announcements], 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'         => 'required|string|max:255',
            'content'       => 'required|string',
            'image'         => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'published_at'  => 'nullable|date', // optional schedule datetime
        ]);

        // Determine publish time and status
        $publishedAt = $request->input('published_at')
            ? Carbon::parse($request->input('published_at'))
            : now();

        $status = $publishedAt->isFuture() ? 'scheduled' : 'posted';

        $data = [
            'title'        => $validated['title'],
            'content'      => $validated['content'],
            'published_at' => $publishedAt,
            'status'       => $status,
        ];

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('announcements', 'public');
        }

        $announcement = Announcement::create($data);

        return response()->json([
            'message' => 'Announcement created successfully.',
            'announcement' => $announcement
        ], 201);
    }

    public function show(Announcement $announcement)
    {
        $announcement->image_url = $announcement->image ? asset('storage/' . $announcement->image) : null;

        return response()->json(['announcement' => $announcement]);
    }

    public function update(Request $request, Announcement $announcement)
    {
        $validated = $request->validate([
            'title'         => 'required|string|max:255',
            'content'       => 'required|string',
            'image'         => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'published_at'  => 'nullable|date',
            'status'        => 'nullable|in:draft,posted,scheduled',
        ]);

        $announcement->title = $validated['title'];
        $announcement->content = $validated['content'];

        if ($request->has('published_at')) {
            $publishedAt = Carbon::parse($request->input('published_at'));
            $announcement->published_at = $publishedAt;
            // If publish date is changed to future/past, adjust status if not explicitly provided
            if (!$request->has('status')) {
                $announcement->status = $publishedAt->isFuture() ? 'scheduled' : 'posted';
            }
        }

        if ($request->has('status')) {
            $announcement->status = $request->input('status');
        }

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($announcement->image && Storage::disk('public')->exists($announcement->image)) {
                Storage::disk('public')->delete($announcement->image);
            }

            $announcement->image = $request->file('image')->store('announcements', 'public');
        }

        $announcement->save();

        return response()->json(['message' => 'Announcement updated successfully.']);
    }

    public function destroy(Announcement $announcement)
    {
        if ($announcement->image && Storage::disk('public')->exists($announcement->image)) {
            Storage::disk('public')->delete($announcement->image);
        }

        $announcement->delete();

        return response()->json(['message' => 'Announcement deleted successfully.']);
    }

    public function toggleStatus(Announcement $announcement)
    {
        // Cycle: draft -> posted; posted -> draft; scheduled -> draft
        if ($announcement->status === 'posted') {
            $announcement->status = 'draft';
        } else {
            $announcement->status = 'posted';
            // if setting to posted but it's scheduled in future, also set published_at to now
            if ($announcement->published_at && Carbon::parse($announcement->published_at)->isFuture()) {
                $announcement->published_at = now();
            }
        }

        $announcement->save();

        return response()->json([
            'message' => 'Status updated',
            'status' => $announcement->status
        ]);
    }
}
