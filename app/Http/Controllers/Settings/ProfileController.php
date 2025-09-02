<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\ProfilePhoto;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $profilePhotos = $user->profilePhotos()->orderBy('created_at', 'desc')->get();
        
        // Ensure URLs are properly generated for frontend
        $profilePhotosWithUrls = $profilePhotos->map(function($photo) {
            return [
                'id' => $photo->id,
                'file_path' => $photo->file_path,
                'file_name' => $photo->file_name,
                'file_type' => $photo->file_type,
                'file_size' => $photo->file_size,
                'is_current' => $photo->is_current,
                'url' => $photo->url, // Explicitly include the URL
                'created_at' => $photo->created_at,
            ];
        });

        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
            'profilePhotos' => $profilePhotosWithUrls,
        ]);
    }

    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $data = $request->validated();

        $user->fill($data);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return to_route('settings.profile.edit');
    }

    /**
     * Test file upload functionality.
     */
    public function testUpload(Request $request): RedirectResponse
    {
        if ($request->hasFile('profile_photo')) {
            $file = $request->file('profile_photo');
            return back()->with('status', 'File received successfully: ' . $file->getClientOriginalName());
        }

        return back()->withErrors(['message' => 'No file received']);
    }

    /**
     * Upload a new profile photo.
     */
    public function uploadPhoto(Request $request)
    {
        try {
            $request->validate([
                'profile_photo' => ['required', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'],
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors())->withInput();
        }

        $user = $request->user();
        $file = $request->file('profile_photo');

        try {
            // Store new profile photo first
            $path = $file->store('profile-photos', 'public');

            // Mark all existing photos as not current
            $user->profilePhotos()->update(['is_current' => false]);

            // Create profile photo record with is_current = true
            $profilePhoto = $user->profilePhotos()->create([
                'file_path' => $path,
                'file_name' => $file->getClientOriginalName(),
                'file_type' => $file->getClientMimeType(),
                'file_size' => $file->getSize(),
                'is_current' => true,
            ]);

            // Update user's current profile photo to match the new ProfilePhoto record
            $user->update(['profile_photo' => $profilePhoto->file_path]);

            // Refresh the user data to ensure avatar is updated
            $user->refresh();

            return back()->with('status', 'Profile photo updated successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['message' => 'Upload failed: ' . $e->getMessage()]);
        }
    }

    /**
     * Set a photo from history as current.
     */
    public function setCurrentPhoto(Request $request, ProfilePhoto $profilePhoto)
    {
        $user = $request->user();

        // Ensure the photo belongs to the user
        if ($profilePhoto->user_id !== $user->id) {
            abort(403);
        }

        // Mark all photos as not current
        $user->profilePhotos()->update(['is_current' => false]);

        // Mark this photo as current
        $profilePhoto->update(['is_current' => true]);

        // Update user's current profile photo to match the selected ProfilePhoto
        $user->update(['profile_photo' => $profilePhoto->file_path]);



        return back()->with('status', 'Profile photo updated successfully.');
    }

    /**
     * Delete a profile photo from history.
     */
    public function deletePhoto(Request $request, ProfilePhoto $profilePhoto)
    {
        $user = $request->user();

        // Ensure the photo belongs to the user
        if ($profilePhoto->user_id !== $user->id) {
            abort(403);
        }

        // Log the deletion attempt for debugging
        \Log::info('Attempting to delete profile photo', [
            'user_id' => $user->id,
            'photo_id' => $profilePhoto->id,
            'file_path' => $profilePhoto->file_path,
            'full_path' => storage_path('app/public/' . $profilePhoto->file_path),
            'file_exists' => file_exists(storage_path('app/public/' . $profilePhoto->file_path)),
            'is_readable' => is_readable(storage_path('app/public/' . $profilePhoto->file_path)),
            'is_writable' => is_writable(storage_path('app/public/' . $profilePhoto->file_path)),
        ]);

        // If this is the current photo, we need to handle it specially
        if ($profilePhoto->is_current) {
            // Mark all other photos as not current first
            $user->profilePhotos()->where('id', '!=', $profilePhoto->id)->update(['is_current' => false]);
            
            // Set the most recent photo as current, or clear user's profile photo if no other photos exist
            $nextPhoto = $user->profilePhotos()->where('id', '!=', $profilePhoto->id)->orderBy('created_at', 'desc')->first();
            
            if ($nextPhoto) {
                $nextPhoto->update(['is_current' => true]);
                $user->update(['profile_photo' => $nextPhoto->file_path]);
            } else {
                // No other photos exist, clear the user's profile photo
                $user->update(['profile_photo' => null]);
            }
        }

        // Delete file from storage with enhanced error handling for cPanel
        $fileDeleted = false;
        $errorMessage = '';
        
        try {
            // Method 1: Try Laravel Storage facade
            if (Storage::disk('public')->exists($profilePhoto->file_path)) {
                Storage::disk('public')->delete($profilePhoto->file_path);
                $fileDeleted = true;
            }
        } catch (\Exception $e) {
            $errorMessage .= 'Storage facade failed: ' . $e->getMessage() . '; ';
        }

        // Method 2: Try direct file deletion
        if (!$fileDeleted) {
            try {
                $fullPath = storage_path('app/public/' . $profilePhoto->file_path);
                if (file_exists($fullPath)) {
                    if (unlink($fullPath)) {
                        $fileDeleted = true;
                    } else {
                        $errorMessage .= 'Direct unlink failed; ';
                    }
                } else {
                    $errorMessage .= 'File does not exist at path: ' . $fullPath . '; ';
                }
            } catch (\Exception $e) {
                $errorMessage .= 'Direct deletion failed: ' . $e->getMessage() . '; ';
            }
        }

        // Method 3: Try public storage path
        if (!$fileDeleted) {
            try {
                $publicPath = public_path('storage/' . $profilePhoto->file_path);
                if (file_exists($publicPath)) {
                    if (unlink($publicPath)) {
                        $fileDeleted = true;
                    } else {
                        $errorMessage .= 'Public path unlink failed; ';
                    }
                }
            } catch (\Exception $e) {
                $errorMessage .= 'Public path deletion failed: ' . $e->getMessage() . '; ';
            }
        }

        // Log the result
        if ($fileDeleted) {
            \Log::info('Profile photo file deleted successfully', [
                'photo_id' => $profilePhoto->id,
                'file_path' => $profilePhoto->file_path
            ]);
        } else {
            \Log::error('Failed to delete profile photo file', [
                'photo_id' => $profilePhoto->id,
                'file_path' => $profilePhoto->file_path,
                'errors' => $errorMessage
            ]);
        }

        // Delete record regardless of file deletion success
        $profilePhoto->delete();

        if ($fileDeleted) {
            return back()->with('status', 'Profile photo deleted successfully.');
        } else {
            return back()->with('status', 'Profile photo record deleted, but file cleanup failed. Please contact support.');
        }
    }

    /**
     * Remove the user's profile photo.
     */
    public function removePhoto(Request $request)
    {
        $user = $request->user();

        // Mark all profile photos as not current
        $user->profilePhotos()->update(['is_current' => false]);

        // Update user's profile photo to null
        $user->update(['profile_photo' => null]);

        return back()->with('status', 'Profile photo removed successfully.');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
