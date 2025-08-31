import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import { Upload, Play, Pause, Download, Trash2, Image, Video, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Gallery',
        href: '/gallery',
    },
];

type MediaItem = {
    id: number;
    user_id: number;
    file_path: string;
    file_name: string;
    file_type: string;
    file_size: number;
    media_type: 'image' | 'video';
    created_at: string;
    url: string;
};

type GalleryFormData = {
    media_files: File[] | null;
};

export default function Gallery({ mediaItems }: { mediaItems: MediaItem[] }) {
    const { auth } = usePage<SharedData>().props;
    const { addToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');

    const { data, setData, post, errors, processing } = useForm<GalleryFormData>({
        media_files: null,
    });

    // Filter media items based on selected type
    const filteredMedia = mediaItems.filter(item => {
        if (filterType === 'all') return true;
        return item.media_type === filterType;
    });

    // Handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            setData('media_files', files);
            setIsUploading(true);
            
            // Create FormData and upload immediately
            const formData = new FormData();
            files.forEach(file => {
                formData.append('media_files[]', file);
            });
            
            router.post(route('gallery.upload'), formData, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setIsUploading(false);
                    setData('media_files', null);
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                    addToast({
                        type: 'success',
                        title: 'Upload Successful!',
                        message: `${files.length} file(s) uploaded successfully!`,
                    });
                },
                onError: (errors) => {
                    setIsUploading(false);
                    addToast({
                        type: 'error',
                        title: 'Upload Failed',
                        message: errors.media_files || 'Failed to upload files.',
                    });
                },
            });
        }
    };

    // Handle media preview
    const handleMediaClick = (media: MediaItem, index: number) => {
        setSelectedMedia(media);
        setCurrentIndex(index);
        setIsPlaying(false);
    };

    // Close preview
    const handleClosePreview = () => {
        setSelectedMedia(null);
        setIsPlaying(false);
    };

    // Navigate through media
    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setSelectedMedia(filteredMedia[currentIndex - 1]);
            setIsPlaying(false);
        }
    };

    const handleNext = () => {
        if (currentIndex < filteredMedia.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setSelectedMedia(filteredMedia[currentIndex + 1]);
            setIsPlaying(false);
        }
    };

    // Handle video play/pause
    const handleVideoToggle = () => {
        setIsPlaying(!isPlaying);
    };

    // Handle media download
    const handleDownload = (media: MediaItem) => {
        const link = document.createElement('a');
        link.href = media.url;
        link.download = media.file_name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        addToast({
            type: 'success',
            title: 'Download Started!',
            message: 'Your file is being downloaded.',
        });
    };

    // Handle media deletion
    const handleDelete = (mediaId: number) => {
        router.delete(route('gallery.delete', mediaId), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                addToast({
                    type: 'success',
                    title: 'Deleted!',
                    message: 'Media file deleted successfully.',
                });
            },
            onError: () => {
                addToast({
                    type: 'error',
                    title: 'Delete Failed',
                    message: 'Failed to delete media file.',
                });
            },
        });
    };

    // Format file size
    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gallery" />

            <div className="space-y-6">
                <HeadingSmall 
                    title="Media Gallery" 
                    description="Upload, view, and manage your photos and videos" 
                />

                {/* Upload Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Upload className="h-5 w-5" />
                            Upload Media
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="media_files">Select Images or Videos</Label>
                                <Input
                                    id="media_files"
                                    type="file"
                                    multiple
                                    accept="image/*,video/*"
                                    onChange={handleFileChange}
                                    ref={fileInputRef}
                                    disabled={isUploading}
                                    className="mt-1"
                                />
                                <p className="text-sm text-muted-foreground mt-1">
                                    Supported formats: JPG, PNG, GIF, MP4, MOV, AVI (Max 50MB per file)
                                </p>
                                <InputError className="mt-2" message={errors.media_files} />
                            </div>
                            
                            {isUploading && (
                                <div className="flex items-center gap-2 text-sm text-blue-600">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                    Uploading...
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Filter Section */}
                <div className="flex items-center gap-4">
                    <Label>Filter by type:</Label>
                    <div className="flex gap-2">
                        <Button
                            variant={filterType === 'all' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilterType('all')}
                        >
                            All ({mediaItems.length})
                        </Button>
                        <Button
                            variant={filterType === 'image' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilterType('image')}
                        >
                            Images ({mediaItems.filter(item => item.media_type === 'image').length})
                        </Button>
                        <Button
                            variant={filterType === 'video' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilterType('video')}
                        >
                            Videos ({mediaItems.filter(item => item.media_type === 'video').length})
                        </Button>
                    </div>
                </div>

                {/* Gallery Grid */}
                {filteredMedia.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                        {filteredMedia.map((media, index) => (
                            <Card key={media.id} className="group cursor-pointer hover:shadow-lg transition-shadow">
                                <CardContent className="p-2">
                                    <div 
                                        className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden"
                                        onClick={() => handleMediaClick(media, index)}
                                    >
                                        {media.media_type === 'image' ? (
                                            <img
                                                src={media.url}
                                                alt={media.file_name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                                <Video className="h-8 w-8 text-gray-400" />
                                            </div>
                                        )}
                                        
                                        {/* Media type badge */}
                                        <Badge 
                                            variant="secondary" 
                                            className="absolute top-2 left-2 text-xs"
                                        >
                                            {media.media_type === 'image' ? (
                                                <Image className="h-3 w-3 mr-1" />
                                            ) : (
                                                <Video className="h-3 w-3 mr-1" />
                                            )}
                                            {media.media_type}
                                        </Badge>

                                        {/* Actions overlay */}
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDownload(media);
                                                    }}
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(media.id);
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-2 space-y-1">
                                        <p className="text-xs font-medium truncate" title={media.file_name}>
                                            {media.file_name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatFileSize(media.file_size)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDate(media.created_at)}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium text-muted-foreground mb-2">
                                No media files yet
                            </h3>
                            <p className="text-sm text-muted-foreground text-center mb-4">
                                Upload your first photo or video to get started
                            </p>
                            <Button onClick={() => fileInputRef.current?.click()}>
                                Upload Media
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Media Preview Modal */}
            {selectedMedia && (
                <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
                    <div className="relative max-w-4xl max-h-[90vh] w-full mx-4">
                        {/* Close button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white hover:bg-black hover:bg-opacity-70"
                            onClick={handleClosePreview}
                        >
                            <X className="h-5 w-5" />
                        </Button>

                        {/* Navigation buttons */}
                        {currentIndex > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white hover:bg-black hover:bg-opacity-70"
                                onClick={handlePrevious}
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                        )}

                        {currentIndex < filteredMedia.length - 1 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white hover:bg-black hover:bg-opacity-70"
                                onClick={handleNext}
                            >
                                <ChevronRight className="h-5 w-5" />
                            </Button>
                        )}

                        {/* Media content */}
                        <div className="flex flex-col items-center justify-center h-full">
                            {selectedMedia.media_type === 'image' ? (
                                <img
                                    src={selectedMedia.url}
                                    alt={selectedMedia.file_name}
                                    className="max-w-full max-h-full object-contain"
                                />
                            ) : (
                                <video
                                    src={selectedMedia.url}
                                    className="max-w-full max-h-full"
                                    controls
                                    autoPlay={isPlaying}
                                />
                            )}
                            
                            {/* Media info */}
                            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white p-4 rounded-lg">
                                <h3 className="text-lg font-medium mb-2">{selectedMedia.file_name}</h3>
                                <div className="flex items-center gap-4 text-sm">
                                    <span>{formatFileSize(selectedMedia.file_size)}</span>
                                    <span>{formatDate(selectedMedia.created_at)}</span>
                                    <span className="capitalize">{selectedMedia.media_type}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
