<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Household;
use App\Models\Resident;
use Illuminate\Support\Facades\Log;

class HouseholdController extends Controller
{
    public function index(Request $request)
    {
        $query = Household::query();

        if ($request->has('search')) {
            $q = $request->get('search');
            $query->where('household_no', 'like', "%{$q}%")->orWhere('address', 'like', "%{$q}%");
        }

        $households = $query->orderBy('id', 'desc')->paginate(20);

        return response()->json($households);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'household_no' => 'required|string|unique:households,household_no',
            'address' => 'nullable|string',
            'head_resident_id' => 'nullable|exists:residents,id',
            'members_count' => 'nullable|integer|min:0',
        ]);

        $data['created_by'] = $request->user() ? $request->user()->id : null;

        $household = Household::create($data);

        // If head_resident_id provided, update resident's household_no
        if (!empty($data['head_resident_id'])) {
            $resident = Resident::find($data['head_resident_id']);
            if ($resident) {
                $resident->household_no = $household->household_no;
                $resident->save();
            }
        }

        Log::info('Household created', ['household' => $household->toArray(), 'by' => $data['created_by']]);

        return response()->json(['household' => $household], 201);
    }

    public function show($id)
    {
        $household = Household::where('id', $id)->with('residents')->first();
        if (!$household) {
            return response()->json(['message' => 'Household not found'], 404);
        }
        return response()->json(['household' => $household]);
    }

    public function update(Request $request, $id)
    {
        $household = Household::find($id);
        if (!$household) {
            return response()->json(['message' => 'Household not found'], 404);
        }

        $data = $request->validate([
            'address' => 'nullable|string',
            'head_resident_id' => 'nullable|exists:residents,id',
            'members_count' => 'nullable|integer|min:0',
        ]);

        $household->update($data);

        // Sync resident household_no if head changed
        if (array_key_exists('head_resident_id', $data) && $data['head_resident_id']) {
            $resident = Resident::find($data['head_resident_id']);
            if ($resident) {
                $resident->household_no = $household->household_no;
                $resident->save();
            }
        }

        Log::info('Household updated', ['household' => $household->toArray(), 'by' => $request->user() ? $request->user()->id : null]);

        return response()->json(['household' => $household]);
    }

    public function destroy($id)
    {
        $household = Household::find($id);
        if (!$household) {
            return response()->json(['message' => 'Household not found'], 404);
        }

        $household->delete();

        return response()->json(['message' => 'Household deleted']);
    }
}
