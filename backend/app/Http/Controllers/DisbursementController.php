<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Disbursement;
use Illuminate\Support\Facades\Storage;

class DisbursementController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Disbursement::with('beneficiary');
        if ($request->has('beneficiary_id')) {
            $query->where('beneficiary_id', $request->beneficiary_id);
        }
        if ($request->has('date')) {
            $query->where('date', $request->date);
        }
        if ($request->filled('method')) {
            $query->where('method', $request->input('method'));
        }
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('remarks', 'like', "%$search%")
                  ->orWhere('method', 'like', "%$search%")
                  ;
            });
        }
        return response()->json($query->orderByDesc('id')->get());
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'beneficiary_id' => 'required|exists:beneficiaries,id',
            'date' => 'required|date',
            'amount' => 'required|numeric',
            'method' => 'required|string',
            'remarks' => 'nullable|string',
            'attachment' => 'nullable|file',
        ]);
        if ($request->hasFile('attachment')) {
            $data['attachment'] = $request->file('attachment')->store('attachments');
        }
        $disbursement = Disbursement::create($data);
        return response()->json($disbursement, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $disbursement = Disbursement::with('beneficiary')->findOrFail($id);
        return response()->json($disbursement);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Disbursement $disbursement)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $disbursement = Disbursement::findOrFail($id);
        $data = $request->validate([
            'beneficiary_id' => 'sometimes|exists:beneficiaries,id',
            'date' => 'sometimes|date',
            'amount' => 'sometimes|numeric',
            'method' => 'sometimes|string',
            'remarks' => 'nullable|string',
            'attachment' => 'nullable|file',
        ]);
        if ($request->hasFile('attachment')) {
            if ($disbursement->attachment) {
                Storage::delete($disbursement->attachment);
            }
            $data['attachment'] = $request->file('attachment')->store('attachments');
        }
        $disbursement->update($data);
        return response()->json($disbursement);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $disbursement = Disbursement::findOrFail($id);
        if ($disbursement->attachment) {
            Storage::delete($disbursement->attachment);
        }
        $disbursement->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
