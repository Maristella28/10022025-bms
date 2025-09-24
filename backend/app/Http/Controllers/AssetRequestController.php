<?php

namespace App\Http\Controllers;

// Configuration updated to use log mailer instead of SMTP

use App\Models\AssetRequest;
use App\Models\Asset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Notifications\AssetRequestNotification;
use App\Notifications\AssetPaymentNotification;
use App\Models\User;

class AssetRequestController extends Controller
{
    // List requests (admin: all, user: own)
    public function index(Request $request)
    {
        $user = Auth::user();
        $perPage = $request->get('per_page', 10);
        $page = $request->get('page', 1);
        
        if ($user->role === 'admin') {
            $query = AssetRequest::with(['items.asset', 'user', 'resident.profile']);
        } else {
            $query = AssetRequest::with(['items.asset', 'resident.profile'])->where('user_id', $user->id);
        }
        
        // Apply pagination
        $paginatedRequests = $query->orderBy('created_at', 'desc')->paginate($perPage, ['*'], 'page', $page);
        
        // Transform the data for the frontend
        $requests = $paginatedRequests->map(function ($req) {
            $firstItem = $req->items->first();
            return [
                'id' => $req->id,
                'resident' => $req->resident ? [
                    'residents_id' => $req->resident->residents_id ?? '',
                    'profile' => $req->resident->profile ? [
                        'first_name' => $req->resident->profile->first_name ?? '',
                        'last_name' => $req->resident->profile->last_name ?? '',
                    ] : null,
                ] : null,
                'user' => $req->user ? [
                    'name' => $req->user->name ?? '',
                ] : null,
                'asset' => $firstItem && $firstItem->asset ? [
                    'name' => $firstItem->asset->name ?? '',
                    'price' => $firstItem->asset->price ?? 0,
                ] : null,
                'request_date' => $firstItem ? $firstItem->request_date ?? '' : '',
                'status' => $req->status ?? '',
                'payment_status' => $req->payment_status ?? 'unpaid',
                'receipt_number' => $req->receipt_number ?? null,
                'amount_paid' => $req->amount_paid ?? null,
                'paid_at' => $req->paid_at ?? null,
                'total_amount' => $req->calculateTotalAmount(),
            ];
        });
        
        // Return paginated response
        return response()->json([
            'data' => $requests,
            'current_page' => $paginatedRequests->currentPage(),
            'last_page' => $paginatedRequests->lastPage(),
            'per_page' => $paginatedRequests->perPage(),
            'total' => $paginatedRequests->total(),
            'from' => $paginatedRequests->firstItem(),
            'to' => $paginatedRequests->lastItem(),
        ]);
    }

    // User requests an asset
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'items' => 'required|array|min:1',
                'items.*.asset_id' => 'required|exists:assets,id',
                'items.*.request_date' => 'required|date',
                'items.*.quantity' => 'required|integer|min:1',
            ]);
            $user = Auth::user();
            if (!$user) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }
            $resident = \App\Models\Resident::where('user_id', $user->id)->first();
            if (!$resident) {
                return response()->json(['error' => 'Resident profile not found. Please complete your profile.'], 400);
            }
            $residentId = $resident->id;

            // Check stock for each item
            foreach ($validated['items'] as $item) {
                $asset = \App\Models\Asset::findOrFail($item['asset_id']);
                if ($asset->stock < $item['quantity']) {
                    return response()->json(['error' => "Asset '{$asset->name}' does not have enough stock."], 400);
                }
            }

            $assetRequest = AssetRequest::create([
                'user_id' => $user->id,
                'resident_id' => $residentId,
                'status' => 'pending',
                'payment_status' => 'unpaid',
            ]);

            foreach ($validated['items'] as $item) {
                $assetItem = \App\Models\AssetRequestItem::create([
                    'asset_request_id' => $assetRequest->id,
                    'asset_id' => $item['asset_id'],
                    'request_date' => $item['request_date'],
                    'quantity' => $item['quantity'],
                ]);
                // Notify user for each item
                $asset = \App\Models\Asset::find($item['asset_id']);
                $user->notify(new AssetRequestNotification($asset, $item['request_date'], 'pending'));
            }

            // Notify all admins
            $admins = \App\Models\User::where('role', 'admin')->get();
            foreach ($admins as $admin) {
                $admin->notify(new \App\Notifications\AdminAssetRequestNotification($user, $assetRequest));
            }

            return response()->json($assetRequest->load('items'), 201);
        } catch (\Exception $e) {
            \Log::error('Asset request error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'Server error: ' . $e->getMessage()], 500);
        }
    }

    // Admin approves/denies a request
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:approved,denied',
            'admin_message' => 'nullable|string',
        ]);
        $assetRequest = AssetRequest::with('items.asset')->findOrFail($id);
        $assetRequest->status = $validated['status'];
        $assetRequest->admin_message = $validated['admin_message'] ?? null;
        $assetRequest->save();

        // If approved, decrement asset stock
        if ($validated['status'] === 'approved') {
            foreach ($assetRequest->items as $item) {
                $asset = $item->asset;
                if ($asset && $asset->stock > 0) {
                    $asset->decrement('stock', $item->quantity);
                }
            }
        }

        // Notify the user about the status change
        $user = $assetRequest->user;
        if ($user) {
            foreach ($assetRequest->items as $item) {
                $user->notify(new \App\Notifications\AssetRequestNotification(
                    $item->asset,
                    $item->request_date,
                    $assetRequest->status // 'approved' or 'denied'
                ));
            }
        }

        return response()->json($assetRequest->load('items.asset'));
    }

    // Process payment for an asset request
    public function processPayment(Request $request, $id)
    {
        try {
            \Log::info('Processing payment for asset request', ['id' => $id]);
            
            $assetRequest = AssetRequest::with(['items.asset', 'user'])->findOrFail($id);
            
            // Check if request is approved
            if ($assetRequest->status !== 'approved') {
                \Log::warning('Payment attempted on non-approved request', ['id' => $id, 'status' => $assetRequest->status]);
                return response()->json(['error' => 'Only approved requests can be paid'], 400);
            }
            
            // Check if already paid
            if ($assetRequest->payment_status === 'paid') {
                \Log::warning('Payment attempted on already paid request', ['id' => $id]);
                return response()->json(['error' => 'This request has already been paid'], 400);
            }
            
            // Calculate total amount
            $totalAmount = $assetRequest->calculateTotalAmount();
            \Log::info('Calculated total amount', ['id' => $id, 'amount' => $totalAmount]);
            
            // Generate receipt number
            $receiptNumber = $assetRequest->generateReceiptNumber();
            \Log::info('Generated receipt number', ['id' => $id, 'receipt' => $receiptNumber]);
            
            // Update payment status
            $assetRequest->update([
                'payment_status' => 'paid',
                'receipt_number' => $receiptNumber,
                'amount_paid' => $totalAmount,
                'paid_at' => now(),
            ]);
            
            \Log::info('Payment status updated', ['id' => $id, 'payment_status' => 'paid']);
            
            // Send notification to user
            if ($assetRequest->user) {
                try {
                    $assetRequest->user->notify(new AssetPaymentNotification($assetRequest, $receiptNumber, $totalAmount));
                    \Log::info('Payment notification sent', ['id' => $id, 'user_id' => $assetRequest->user->id]);
                } catch (\Exception $e) {
                    \Log::error('Failed to send payment notification', ['id' => $id, 'error' => $e->getMessage()]);
                    // Don't fail the payment if notification fails
                }
            }
            
            return response()->json([
                'message' => 'Payment processed successfully',
                'receipt_number' => $receiptNumber,
                'amount_paid' => $totalAmount,
                'asset_request' => $assetRequest->load('items.asset')
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Payment processing error: ' . $e->getMessage(), [
                'id' => $id,
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Server error: ' . $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        $user = auth()->user();
        $assetRequest = AssetRequest::with(['asset', 'resident.profile', 'user'])->find($id);

        if (!$assetRequest) {
            return response()->json(['error' => 'Asset request not found'], 404);
        }

        // Optionally, restrict access to only admins or the owner
        if ($user->role !== 'admin' && $assetRequest->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json($assetRequest);
    }

    public function destroy($id)
    {
        $request = AssetRequest::findOrFail($id);
        $request->delete();
        return response()->json(['message' => 'Request deleted']);
    }

    // Generate PDF receipt for an asset request
    public function generateReceipt(Request $request)
    {
        try {
            $validated = $request->validate([
                'asset_request_id' => 'required|exists:asset_requests,id',
                'receipt_number' => 'required|string',
                'amount_paid' => 'required|numeric|min:0',
            ]);

            // Load the asset request with related data
            $assetRequest = AssetRequest::with(['items.asset', 'resident.profile', 'user'])->findOrFail($validated['asset_request_id']);

            // Check if request is paid
            if ($assetRequest->payment_status !== 'paid') {
                return response()->json(['error' => 'Only paid requests can generate receipts'], 400);
            }

            // Generate PDF using the blade template
            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('receipts.asset-rental-receipt', [
                'assetRequest' => $assetRequest,
                'receiptNumber' => $validated['receipt_number'],
                'amountPaid' => $validated['amount_paid'],
            ]);

            // Return PDF as response
            return $pdf->download('receipt-' . $validated['receipt_number'] . '.pdf');
        } catch (\Exception $e) {
            \Log::error('Receipt generation error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Failed to generate receipt: ' . $e->getMessage()], 500);
        }
    }
    
    // Get status counts for dashboard
    public function getStatusCounts()
    {
        $user = Auth::user();
        \Log::info('getStatusCounts called', ['user' => $user]);

        if ($user->role === 'admin') {
            $query = AssetRequest::query();
        } else {
            $query = AssetRequest::where('user_id', $user->id);
        }

        $counts = [
            'approved' => (clone $query)->where('status', 'approved')->count(),
            'pending' => (clone $query)->where('status', 'pending')->count(),
            'denied' => (clone $query)->where('status', 'denied')->count(),
            'paid' => (clone $query)->where('payment_status', 'paid')->count(),
            'total' => $query->count(),
        ];

        \Log::info('Status counts:', $counts);
        return response()->json($counts);
    }
}