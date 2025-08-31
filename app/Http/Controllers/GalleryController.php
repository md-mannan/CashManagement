<?php

namespace App\Http\Controllers;

use App\Models\Media;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class GalleryController extends Controller
{
    /**
     * Display the gallery page.
     */
    public function index(): Response
    {
        // Ensure user is authenticated
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        $mediaItems = Media::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($media) {
                return [
                    'id' => $media->id,
                    'user_id' => $media->user_id,
                    'file_path' => $media->file_path,
                    'file_name' => $media->file_name,
                    'file_type' => $media->file_type,
                    'file_size' => $media->file_size,
                    'media_type' => $media->media_type,
                    'created_at' => $media->created_at,
                    'url' => $media->url,
                ];
            });

        return Inertia::render('Gallery', [
            'mediaItems' => $mediaItems,
        ]);
    }

    /**
     * Upload media files.
     */
    public function upload(Request $request)
    {
        $request->validate([
            'media_files.*' => 'required|file|mimes:jpeg,jpg,png,gif,mp4,mov,avi|max:51200', // 50MB max
        ]);

        $uploadedFiles = [];
        $files = $request->file('media_files');

        foreach ($files as $file) {
            $mediaType = $this->getMediaType($file->getMimeType());
            $fileName = time() . '_' . $file->getClientOriginalName();
            $filePath = $file->storeAs('media/' . Auth::id(), $fileName, 'public');

            $media = Media::create([
                'user_id' => Auth::id(),
                'file_path' => $filePath,
                'file_name' => $file->getClientOriginalName(),
                'file_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
                'media_type' => $mediaType,
            ]);

            $uploadedFiles[] = $media;
        }

        return redirect()->back()->with('success', count($uploadedFiles) . ' file(s) uploaded successfully!');
    }

    /**
     * Delete a media file.
     */
    public function destroy(Media $media)
    {
        // Check if user owns the media
        if ($media->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        // Delete file from storage
        if (Storage::disk('public')->exists($media->file_path)) {
            Storage::disk('public')->delete($media->file_path);
        }

        // Delete from database
        $media->delete();

        return redirect()->back()->with('success', 'Media file deleted successfully!');
    }

    /**
     * Determine media type from MIME type.
     */
    private function getMediaType(string $mimeType): string
    {
        if (str_starts_with($mimeType, 'image/')) {
            return 'image';
        } elseif (str_starts_with($mimeType, 'video/')) {
            return 'video';
        }

        return 'image'; // Default fallback
    }
}
