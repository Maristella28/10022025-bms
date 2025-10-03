<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProjectController extends Controller
{
    /**
     * Display a listing of projects.
     */
    public function index(): JsonResponse
    {
        $projects = Project::orderBy('created_at', 'desc')->get();
        return response()->json($projects);
    }

    /**
     * Store a newly created project.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'owner' => 'required|string|max:255',
            'deadline' => 'required|date',
            'status' => 'required|string|in:Planned,In Progress,Completed',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'completed_at' => 'nullable|date',
            'remarks' => 'nullable|string',
            'uploaded_files' => 'nullable|array',
            'uploaded_files.*' => 'nullable',
            'published' => 'nullable|in:true,false,1,0,"true","false","1","0"',
            'created_by_admin' => 'nullable|in:true,false,1,0,"true","false","1","0"'
        ]);

        $data = $request->all();
        
        // Convert string boolean values to actual booleans
        if (isset($data['published'])) {
            $data['published'] = filter_var($data['published'], FILTER_VALIDATE_BOOLEAN);
        }
        if (isset($data['created_by_admin'])) {
            $data['created_by_admin'] = filter_var($data['created_by_admin'], FILTER_VALIDATE_BOOLEAN);
        }
        
        // Handle main photo upload
        if ($request->hasFile('photo')) {
            $photo = $request->file('photo');
            $photoName = time() . '_' . $photo->getClientOriginalName();
            $photo->move(public_path('uploads/projects'), $photoName);
            $data['photo'] = 'uploads/projects/' . $photoName;
        }

        // Handle multiple file uploads
        $uploadedFiles = [];
        
        // Check for uploaded_files array (uploaded_files[0], uploaded_files[1], etc.)
        $fileIndex = 0;
        while ($request->hasFile("uploaded_files.{$fileIndex}") || $request->hasFile("uploaded_files[{$fileIndex}]")) {
            $file = $request->file("uploaded_files.{$fileIndex}") ?? $request->file("uploaded_files[{$fileIndex}]");
            if ($file && $file->isValid()) {
                $fileName = time() . '_' . $file->getClientOriginalName();
                $fileSize = $file->getSize(); // Get size before moving
                $fileType = $file->getMimeType(); // Get type before moving
                $file->move(public_path('uploads/projects/files'), $fileName);
                $uploadedFiles[] = [
                    'name' => $file->getClientOriginalName(),
                    'url' => 'uploads/projects/files/' . $fileName,
                    'size' => $fileSize,
                    'type' => $fileType
                ];
            }
            $fileIndex++;
        }
        
        // If we found uploaded files, save them
        if (!empty($uploadedFiles)) {
            $data['uploaded_files'] = $uploadedFiles;
        } elseif ($request->has('uploaded_files') && is_array($request->input('uploaded_files'))) {
            // Handle uploaded_files as metadata (for record project)
            $data['uploaded_files'] = $request->input('uploaded_files');
        }

        $project = Project::create($data);
        return response()->json($project, 201);
    }

    /**
     * Display the specified project.
     */
    public function show(Project $project): JsonResponse
    {
        return response()->json($project);
    }

    /**
     * Update the specified project.
     */
    public function update(Request $request, Project $project): JsonResponse
    {
        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'owner' => 'sometimes|required|string|max:255',
            'deadline' => 'sometimes|required|date',
            'status' => 'sometimes|required|string|in:Planned,In Progress,Completed',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'completed_at' => 'nullable|date',
            'remarks' => 'nullable|string',
            'uploaded_files' => 'nullable|array',
            'uploaded_files.*' => 'nullable',
            'published' => 'nullable|in:true,false,1,0,"true","false","1","0"',
            'created_by_admin' => 'nullable|in:true,false,1,0,"true","false","1","0"'
        ]);

        $data = $request->all();
        
        // Convert string boolean values to actual booleans
        if (isset($data['published'])) {
            $data['published'] = filter_var($data['published'], FILTER_VALIDATE_BOOLEAN);
        }
        if (isset($data['created_by_admin'])) {
            $data['created_by_admin'] = filter_var($data['created_by_admin'], FILTER_VALIDATE_BOOLEAN);
        }
        
        // Handle main photo upload
        if ($request->hasFile('photo')) {
            $photo = $request->file('photo');
            $photoName = time() . '_' . $photo->getClientOriginalName();
            $photo->move(public_path('uploads/projects'), $photoName);
            $data['photo'] = 'uploads/projects/' . $photoName;
        }

        // Handle multiple file uploads
        $uploadedFiles = [];
        
        // Check for uploaded_files array (uploaded_files[0], uploaded_files[1], etc.)
        $fileIndex = 0;
        while ($request->hasFile("uploaded_files.{$fileIndex}") || $request->hasFile("uploaded_files[{$fileIndex}]")) {
            $file = $request->file("uploaded_files.{$fileIndex}") ?? $request->file("uploaded_files[{$fileIndex}]");
            if ($file && $file->isValid()) {
                $fileName = time() . '_' . $file->getClientOriginalName();
                $fileSize = $file->getSize(); // Get size before moving
                $fileType = $file->getMimeType(); // Get type before moving
                $file->move(public_path('uploads/projects/files'), $fileName);
                $uploadedFiles[] = [
                    'name' => $file->getClientOriginalName(),
                    'url' => 'uploads/projects/files/' . $fileName,
                    'size' => $fileSize,
                    'type' => $fileType
                ];
            }
            $fileIndex++;
        }
        
        // If we found uploaded files, save them
        if (!empty($uploadedFiles)) {
            $data['uploaded_files'] = $uploadedFiles;
        } elseif ($request->has('uploaded_files') && is_array($request->input('uploaded_files'))) {
            // Handle uploaded_files as metadata (for record project)
            $data['uploaded_files'] = $request->input('uploaded_files');
        }

        $project->update($data);
        return response()->json($project);
    }

    /**
     * Remove the specified project.
     */
    public function destroy(Project $project): JsonResponse
    {
        $project->delete();
        return response()->json(null, 204);
    }
} 