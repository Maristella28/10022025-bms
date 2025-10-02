<?php

namespace App\Http\Controllers;

use App\Models\Program;
use App\Models\Beneficiary;
use App\Models\Resident;
use App\Models\ResidentNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

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

    /**
     * Send payout date change notification to all beneficiaries
     */
    public function notifyPayoutChange(Request $request, $id)
    {
        try {
            $program = Program::findOrFail($id);
            
            $request->validate([
                'new_payout_date' => 'required|date',
                'program_name' => 'required|string'
            ]);

            // Get all beneficiaries for this program
            $beneficiaries = Beneficiary::where('program_id', $id)
                ->where('visible_to_resident', true)
                ->get();

            if ($beneficiaries->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No beneficiaries found for this program'
                ], 404);
            }

            $newPayoutDate = $request->new_payout_date;
            $programName = $request->program_name;
            $emailsSent = 0;
            $notificationsCreated = 0;
            $errors = [];

            // Format the payout date for display
            $formattedDate = \Carbon\Carbon::parse($newPayoutDate)
                ->format('F j, Y \a\t g:i A');

            foreach ($beneficiaries as $beneficiary) {
                try {
                    // Extract name from beneficiary name field
                    $beneficiaryName = $beneficiary->name;
                    
                    // Send email notification
                    if ($beneficiary->email && filter_var($beneficiary->email, FILTER_VALIDATE_EMAIL)) {
                        Mail::send('emails.payout-date-change', [
                            'beneficiaryName' => $beneficiaryName,
                            'programName' => $programName,
                            'newPayoutDate' => $formattedDate,
                            'newPayoutDateTime' => $newPayoutDate
                        ], function ($message) use ($beneficiary, $programName) {
                            $message->to($beneficiary->email)
                                    ->subject("Updated Payout Schedule for {$programName}");
                        });
                        $emailsSent++;
                    } else {
                        Log::warning("Invalid or missing email for beneficiary {$beneficiary->name}: {$beneficiary->email}");
                    }

                    // Create database notification for resident
                    // Try multiple matching strategies
                    $resident = null;
                    
                    // Strategy 1: Exact name match
                    $resident = Resident::whereRaw("CONCAT(first_name, ' ', last_name) = ?", [$beneficiaryName])->first();
                    
                    // Strategy 2: Email match if exact name fails
                    if (!$resident && $beneficiary->email) {
                        $resident = Resident::whereHas('user', function($query) use ($beneficiary) {
                            $query->where('email', $beneficiary->email);
                        })->first();
                    }
                    
                    // Strategy 3: Partial name match if others fail
                    if (!$resident) {
                        $nameParts = explode(' ', $beneficiaryName);
                        if (count($nameParts) >= 2) {
                            $firstName = $nameParts[0];
                            $lastName = $nameParts[1];
                            $resident = Resident::where('first_name', 'LIKE', '%' . $firstName . '%')
                                ->where('last_name', 'LIKE', '%' . $lastName . '%')
                                ->first();
                        }
                    }

                    if ($resident) {
                        ResidentNotification::create([
                            'resident_id' => $resident->id,
                            'program_id' => $id,
                            'type' => 'payout_change',
                            'title' => 'Payout Schedule Updated',
                            'message' => "The payout schedule for '{$programName}' has been updated to {$formattedDate}",
                            'data' => [
                                'program_name' => $programName,
                                'new_payout_date' => $newPayoutDate,
                                'formatted_date' => $formattedDate
                            ]
                        ]);
                        $notificationsCreated++;
                    }

                    Log::info("Payout change notification sent to {$beneficiary->name} ({$beneficiary->email})");

                } catch (\Exception $e) {
                    $errors[] = "Failed to send notification to {$beneficiary->name}: " . $e->getMessage();
                    Log::error("Failed to send payout change notification to {$beneficiary->name}: " . $e->getMessage());
                }
            }

            return response()->json([
                'success' => true,
                'message' => "Payout change notifications sent successfully",
                'data' => [
                    'emails_sent' => $emailsSent,
                    'notifications_created' => $notificationsCreated,
                    'total_beneficiaries' => $beneficiaries->count(),
                    'errors' => $errors
                ]
            ]);

        } catch (\Exception $e) {
            Log::error("Error sending payout change notifications: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to send notifications: ' . $e->getMessage()
            ], 500);
        }
    }
}
