import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';
import { Trash2, Check, Upload } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: '/settings/profile',
    },
];

type ProfileForm = {
    name: string;
    email: string;
    profile_photo?: File | null;
};

type ProfileFormData = {
    name: string;
    email: string;
    profile_photo?: File | null;
};

export default function Profile({ mustVerifyEmail, status, profilePhotos }: { 
    mustVerifyEmail: boolean; 
    status?: string;
    profilePhotos: any[];
}) {
    const { auth } = usePage<SharedData>().props;
    const { addToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(auth.user.avatar || null);
    const [isUploading, setIsUploading] = useState(false);



    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm<ProfileFormData>({
        name: auth.user.name ?? '',
        email: auth.user.email ?? '',
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setIsUploading(true);
            
            // Create FormData and upload immediately
            const formData = new FormData();
            formData.append('profile_photo', file);
            
            // Use Inertia router for SPA behavior
            router.post(route('settings.profile.upload-photo'), formData, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setIsUploading(false);
                    addToast({
                        type: 'success',
                        title: 'Success!',
                        message: 'Profile photo uploaded successfully!',
                    });
                },
                onError: (errors) => {
                    setIsUploading(false);
                    addToast({
                        type: 'error',
                        title: 'Upload Failed',
                        message: errors.profile_photo || 'Failed to upload photo.',
                    });
                },
            });
        }
    };

    const handleRemovePhoto = () => {
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        
        // Send request to remove existing photo
        router.delete(route('settings.profile.remove-photo'), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                addToast({
                    type: 'success',
                    title: 'Success!',
                    message: 'Profile photo removed successfully!',
                });
            },
            onError: (errors) => {
                addToast({
                    type: 'error',
                    title: 'Error',
                    message: 'Failed to remove profile photo.',
                });
            },
        });
    };

    const handleSetCurrentPhoto = (photoId: number) => {
        router.patch(route('settings.profile.set-current-photo', photoId), {}, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                addToast({
                    type: 'success',
                    title: 'Success!',
                    message: 'Profile photo updated successfully!',
                });
            },
            onError: (errors) => {
                addToast({
                    type: 'error',
                    title: 'Error',
                    message: 'Failed to update profile photo.',
                });
            },
        });
    };

    const handleDeletePhoto = (photoId: number) => {
        router.delete(route('settings.profile.delete-photo', photoId), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                addToast({
                    type: 'success',
                    title: 'Success!',
                    message: 'Profile photo deleted successfully!',
                });
            },
            onError: (errors) => {
                addToast({
                    type: 'error',
                    title: 'Error',
                    message: 'Failed to delete profile photo.',
                });
            },
        });
    };

    const handleDownloadPhoto = (url: string, filename: string) => {
        // For external URLs or blob URLs, we need to fetch the image first
        if (url.startsWith('http') || url.startsWith('blob:')) {
            fetch(url)
                .then(response => response.blob())
                .then(blob => {
                    // Create blob URL for download
                    const blobUrl = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = blobUrl;
                    link.download = filename;
                    
                    // Append to body, click, and remove
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    // Clean up blob URL
                    window.URL.revokeObjectURL(blobUrl);
                    
                    // Show success toast
                    addToast({
                        type: 'success',
                        title: 'Download Started!',
                        message: 'Your photo is being downloaded.',
                    });
                })
                .catch(error => {
                    addToast({
                        type: 'error',
                        title: 'Download Failed',
                        message: 'Failed to download the photo. Please try again.',
                    });
                });
        } else {
            // For local URLs, use direct download
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            
            // Append to body, click, and remove
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Show success toast
            addToast({
                type: 'success',
                title: 'Download Started!',
                message: 'Your photo is being downloaded.',
            });
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('settings.profile.update'), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Profile information" description="Update your name, email address, and profile photo" />

                    <form onSubmit={submit} className="space-y-6">
                        {/* Profile Photo Section */}
                        <div className="space-y-4">
                            <Label>Profile Photo</Label>
                            <div className="flex items-center gap-4">
                                {/* Main Profile Photo with Dropdown */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="p-0 h-auto">
                                            <Avatar className="h-20 w-20 cursor-pointer hover:opacity-80 transition-opacity">
                                                <AvatarImage 
                                                    src={previewUrl || (profilePhotos.find(p => p.is_current)?.url) || null} 
                                                    alt={auth.user.name} 
                                                />
                                                <AvatarFallback className="bg-blue-500 text-lg font-bold text-white">
                                                    {auth.user.name?.charAt(0) || 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-56">
                                        <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                                            <Upload className="mr-2 h-4 w-4" />
                                            Upload New Photo
                                        </DropdownMenuItem>
                                        {profilePhotos.length > 0 && (
                                            <DropdownMenuItem onClick={() => document.getElementById('photo-gallery')?.scrollIntoView({ behavior: 'smooth' })}>
                                                <Check className="mr-2 h-4 w-4" />
                                                View Photo Gallery
                                            </DropdownMenuItem>
                                        )}
                                        {(previewUrl || (profilePhotos.find(p => p.is_current)?.url)) && (
                                            <DropdownMenuItem onClick={handleRemovePhoto} className="text-red-600">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Remove Current Photo
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploading}
                                        >
                                            {isUploading ? 'Uploading...' : 'Change Photo'}
                                        </Button>
                                        {(previewUrl || (profilePhotos.find(p => p.is_current)?.url)) && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={handleRemovePhoto}
                                            >
                                                Remove
                                            </Button>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        JPG, PNG, GIF up to 2MB
                                    </p>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    name="profile_photo"
                                    className="hidden"
                                />
                            </div>
                            {errors.profile_photo && (
                                <InputError className="mt-2" message={errors.profile_photo} />
                            )}
                        </div>

                                                {/* Profile Photo Gallery */}
                        {profilePhotos.length > 0 && (
                            <div id="photo-gallery" className="space-y-4 mb-8">
                                <Label className="text-lg font-semibold ">Photo Gallery</Label>
                                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-5">
                                    {profilePhotos.map((photo) => {
                                        return (
                                                                            <div key={photo.id} className="relative group cursor-pointer">
                                    {/* Facebook-style photo thumbnail */}
                                    <div 
                                        className="aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all duration-200"
                                        onClick={() => !photo.is_current && handleSetCurrentPhoto(photo.id)}
                                        title={photo.is_current ? "Current profile picture" : "Click to set as profile picture"}
                                    >
                                                    <img 
                                                        src={photo.url} 
                                                        alt="Profile photo" 
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            // Fallback to first letter if image fails to load
                                                            const target = e.target as HTMLImageElement;
                                                            target.style.display = 'none';
                                                            const fallback = target.nextElementSibling as HTMLElement;
                                                            if (fallback) fallback.style.display = 'flex';
                                                        }}
                                                    />
                                                    {/* Fallback avatar */}
                                                    <div 
                                                        className="w-full h-full bg-blue-500 flex items-center justify-center text-white font-bold text-xl"
                                                        style={{ display: 'none' }}
                                                    >
                                                        {auth.user.name?.charAt(0) || 'U'}
                                                    </div>
                                                </div>
                                                
                                                                                    {/* Facebook-style dropdown trigger */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="absolute top-2 right-2 h-6 w-6 p-0 text-white hover:bg-white hover:text-black bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="More options"
                                            >
                                                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                                </svg>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            {!photo.is_current && (
                                                <DropdownMenuItem onClick={() => handleSetCurrentPhoto(photo.id)}>
                                                    <Check className="mr-2 h-4 w-4" />
                                                    Make profile picture
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuItem onClick={() => handleDownloadPhoto(photo.url, photo.file_name || 'profile-photo.jpg')}>
                                                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Download
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDeletePhoto(photo.id)} className="text-red-600">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete photo
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                                
                                                {/* Current photo indicator */}
                                                {photo.is_current && (
                                                    <div className="absolute bottom-1 left-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                                                        <Check className="h-2.5 w-2.5" />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Hover over photos to see options. Current photo is marked with a green checkmark.
                                </p>
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>

                            <Input
                                id="name"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                autoComplete="name"
                                placeholder="Full name"
                            />

                            <InputError className="mt-2" message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email address</Label>

                            <Input
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="username"
                                placeholder="Email address"
                            />

                            <InputError className="mt-2" message={errors.email} />
                        </div>

                        {mustVerifyEmail && auth.user.email_verified_at === null && (
                            <div>
                                <p className="-mt-4 text-sm text-muted-foreground">
                                    Your email address is unverified.{' '}
                                    <Link
                                        href={route('verification.send')}
                                        method="post"
                                        as="button"
                                        className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                    >
                                        Click here to resend the verification email.
                                    </Link>
                                </p>

                                {status === 'verification-link-sent' && (
                                    <div className="mt-2 text-sm font-medium text-green-600">
                                        A new verification link has been sent to your email address.
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>Save</Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">Saved</p>
                            </Transition>
                        </div>
                    </form>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
