<?php

namespace App\Http\Controllers;

use App\Models\Resident;
use Illuminate\Http\Request;

class ResidentRestoreController extends Controller
{
    /**
     * Restore a soft deleted resident by ID.
     */
    public function restore($id)
    {
        $resident = Resident::withTrashed()->find($id);
        if (!$resident) {
            return response()->json(['message' => 'Resident not found.'], 404);
        }
        if ($resident->deleted_at === null) {
            return response()->json(['message' => 'Resident is not deleted.'], 400);
        }
        $resident->restore();
        return response()->json(['message' => 'Resident restored successfully.']);
    }
}
