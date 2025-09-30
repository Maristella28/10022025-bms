<?php

namespace App\Http\Controllers;

use App\Models\ProgramApplicationForms;
use App\Models\ApplicationFormField;
use App\Models\ApplicationSubmission;
use App\Models\ApplicationSubmissionData;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ProgramApplicationFormController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = ProgramApplicationForms::with(['program', 'fields', 'submissions']);

        // Filter by program if provided
        if ($request->has('program_id')) {
            $query->where('program_id', $request->program_id);
        }

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $forms = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $forms
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'program_id' => 'required|exists:programs,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'in:draft,published,closed',
            'published_at' => 'nullable|date',
            'deadline' => 'nullable|date|after:published_at',
            'allow_multiple_submissions' => 'boolean',
            'form_settings' => 'nullable|array',
            'fields' => 'required|array|min:1',
            'fields.*.field_name' => 'required|string|max:255',
            'fields.*.field_label' => 'required|string|max:255',
            'fields.*.field_type' => 'required|in:text,textarea,select,checkbox,file,email,number,date',
            'fields.*.field_description' => 'nullable|string',
            'fields.*.is_required' => 'boolean',
            'fields.*.field_options' => 'nullable|array',
            'fields.*.validation_rules' => 'nullable|array',
            'fields.*.sort_order' => 'integer|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Create the form
            $form = ProgramApplicationForms::create($request->only([
                'program_id', 'title', 'description', 'status', 'published_at',
                'deadline', 'allow_multiple_submissions', 'form_settings'
            ]));

            // Create form fields
            foreach ($request->fields as $fieldData) {
                ApplicationFormField::create([
                    'form_id' => $form->id,
                    'field_name' => $fieldData['field_name'],
                    'field_label' => $fieldData['field_label'],
                    'field_type' => $fieldData['field_type'],
                    'field_description' => $fieldData['field_description'] ?? null,
                    'is_required' => $fieldData['is_required'] ?? false,
                    'field_options' => $fieldData['field_options'] ?? null,
                    'validation_rules' => $fieldData['validation_rules'] ?? null,
                    'sort_order' => $fieldData['sort_order'] ?? 0
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Application form created successfully',
                'data' => $form->load(['program', 'fields'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create application form',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $form = ProgramApplicationForms::with(['program', 'fields' => function($query) {
            $query->active()->ordered();
        }, 'submissions'])->find($id);

        if (!$form) {
            return response()->json([
                'success' => false,
                'message' => 'Application form not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $form
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $form = ProgramApplicationForms::find($id);

        if (!$form) {
            return response()->json([
                'success' => false,
                'message' => 'Application form not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|in:draft,published,closed',
            'published_at' => 'nullable|date',
            'deadline' => 'nullable|date|after:published_at',
            'allow_multiple_submissions' => 'sometimes|boolean',
            'form_settings' => 'nullable|array',
            'fields' => 'sometimes|array|min:1',
            'fields.*.field_name' => 'required|string|max:255',
            'fields.*.field_label' => 'required|string|max:255',
            'fields.*.field_type' => 'required|in:text,textarea,select,checkbox,file,email,number,date',
            'fields.*.field_description' => 'nullable|string',
            'fields.*.is_required' => 'boolean',
            'fields.*.field_options' => 'nullable|array',
            'fields.*.validation_rules' => 'nullable|array',
            'fields.*.sort_order' => 'integer|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Update the form
            $form->update($request->only([
                'title', 'description', 'status', 'published_at',
                'deadline', 'allow_multiple_submissions', 'form_settings'
            ]));

            // Update form fields if provided
            if ($request->has('fields')) {
                // Delete existing fields
                $form->fields()->delete();

                // Create new fields
                foreach ($request->fields as $fieldData) {
                    ApplicationFormField::create([
                        'form_id' => $form->id,
                        'field_name' => $fieldData['field_name'],
                        'field_label' => $fieldData['field_label'],
                        'field_type' => $fieldData['field_type'],
                        'field_description' => $fieldData['field_description'] ?? null,
                        'is_required' => $fieldData['is_required'] ?? false,
                        'field_options' => $fieldData['field_options'] ?? null,
                        'validation_rules' => $fieldData['validation_rules'] ?? null,
                        'sort_order' => $fieldData['sort_order'] ?? 0
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Application form updated successfully',
                'data' => $form->load(['program', 'fields'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update application form',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $form = ProgramApplicationForms::find($id);

        if (!$form) {
            return response()->json([
                'success' => false,
                'message' => 'Application form not found'
            ], 404);
        }

        // Delete associated files
        $submissions = $form->submissions()->with('submissionData')->get();
        foreach ($submissions as $submission) {
            foreach ($submission->submissionData as $data) {
                if ($data->isFile() && Storage::exists($data->file_path)) {
                    Storage::delete($data->file_path);
                }
            }
        }

        $form->delete();

        return response()->json([
            'success' => true,
            'message' => 'Application form deleted successfully'
        ]);
    }

    /**
     * Publish a form
     */
    public function publish(string $id): JsonResponse
    {
        $form = ProgramApplicationForms::find($id);

        if (!$form) {
            return response()->json([
                'success' => false,
                'message' => 'Application form not found'
            ], 404);
        }

        $form->update([
            'status' => 'published',
            'published_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Application form published successfully',
            'data' => $form->load(['program', 'fields'])
        ]);
    }

    /**
     * Get published forms for residents
     */
    public function getPublishedForms(Request $request): JsonResponse
    {
        $forms = ProgramApplicationForms::published()
            ->with(['program', 'fields' => function($query) {
                $query->active()->ordered();
            }])
            ->orderBy('published_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $forms
        ]);
    }

    /**
     * Submit application form
     */
    public function submitApplication(Request $request, string $id): JsonResponse
    {
        $form = ProgramApplicationForms::with('fields')->find($id);

        if (!$form) {
            return response()->json([
                'success' => false,
                'message' => 'Application form not found'
            ], 404);
        }

        if ($form->status !== 'published') {
            return response()->json([
                'success' => false,
                'message' => 'Application form is not available for submissions'
            ], 400);
        }

        // Check if form is still active
        if ($form->deadline && now() > $form->deadline) {
            return response()->json([
                'success' => false,
                'message' => 'Application deadline has passed'
            ], 400);
        }

        // Get resident ID from authenticated user
        $residentId = auth()->user()->resident_id ?? auth()->user()->id;

        if (!$residentId) {
            return response()->json([
                'success' => false,
                'message' => 'Resident not found'
            ], 400);
        }

        // Check if multiple submissions are allowed
        if (!$form->allow_multiple_submissions) {
            $existingSubmission = ApplicationSubmission::where('form_id', $form->id)
                ->where('resident_id', $residentId)
                ->first();

            if ($existingSubmission) {
                return response()->json([
                    'success' => false,
                    'message' => 'You have already submitted an application for this form'
                ], 400);
            }
        }

        DB::beginTransaction();
        try {
            // Create submission
            $submission = ApplicationSubmission::create([
                'form_id' => $form->id,
                'resident_id' => $residentId,
                'submitted_at' => now()
            ]);

            // Process form data
            foreach ($form->fields as $field) {
                $fieldValue = $request->input($field->field_name);
                $filePath = null;
                $fileOriginalName = null;
                $fileMimeType = null;
                $fileSize = null;

                // Handle file uploads
                if ($field->field_type === 'file' && $request->hasFile($field->field_name)) {
                    $file = $request->file($field->field_name);
                    $fileOriginalName = $file->getClientOriginalName();
                    $fileMimeType = $file->getMimeType();
                    $fileSize = $file->getSize();
                    
                    // Validate file
                    $maxSize = 5 * 1024 * 1024; // 5MB
                    if ($fileSize > $maxSize) {
                        throw new \Exception("File size exceeds 5MB limit");
                    }

                    $allowedTypes = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'];
                    $extension = $file->getClientOriginalExtension();
                    if (!in_array(strtolower($extension), $allowedTypes)) {
                        throw new \Exception("File type not allowed");
                    }

                    $filePath = $file->store('application-files', 'public');
                }

                // Store submission data
                ApplicationSubmissionData::create([
                    'submission_id' => $submission->id,
                    'field_id' => $field->id,
                    'field_value' => $fieldValue,
                    'file_path' => $filePath,
                    'file_original_name' => $fileOriginalName,
                    'file_mime_type' => $fileMimeType,
                    'file_size' => $fileSize
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Application submitted successfully',
                'data' => $submission
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit application',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
