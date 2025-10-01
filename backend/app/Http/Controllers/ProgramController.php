<?php

namespace App\Http\Controllers;

use App\Models\Program;
use Illuminate\Http\Request;

class ProgramController extends Controller
{
    public function index()
    {
        return response()->json(Program::all());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'beneficiary_type' => 'nullable|string',
            'assistance_type' => 'nullable|string',
            'amount' => 'nullable|numeric',
            'max_beneficiaries' => 'nullable|integer|min:1',
            'status' => 'required|string',
            'payout_date' => 'nullable|date|after:now',
        ]);
        $program = Program::create($data);
        return response()->json($program, 201);
    }

    public function show($id)
    {
        return response()->json(Program::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $program = Program::findOrFail($id);
        $data = $request->validate([
            'name' => 'sometimes|required|string',
            'description' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'beneficiary_type' => 'nullable|string',
            'assistance_type' => 'nullable|string',
            'amount' => 'nullable|numeric',
            'max_beneficiaries' => 'nullable|integer|min:1',
            'status' => 'required|string',
            'payout_date' => 'nullable|date|after:now',
        ]);
        \Log::info('Program update data:', $data);
        $program->update($data);
        \Log::info('Program updated:', $program->toArray());
        return response()->json($program);
    }

    public function destroy($id)
    {
        Program::destroy($id);
        return response()->json(null, 204);
    }

    public function getForResidents()
    {
        // Only return programs that are not in draft status
        $programs = Program::where('status', '!=', 'draft')
            ->where(function($query) {
                $query->where('status', 'ongoing')
                      ->orWhere('status', 'complete')
                      ->orWhereNull('status'); // Include programs with no status set (legacy)
            })
            ->get();
        
        return response()->json($programs);
    }
}
