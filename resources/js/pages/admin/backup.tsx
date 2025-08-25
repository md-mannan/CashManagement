import { AdminRouteGuard } from '@/components/admin-route-guard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Clock, Database, Download, FileText, HardDrive, Plus, Settings, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Admin', href: '/admin/dashboard' },
    { title: 'Backup & Restore', href: '/admin/backup' },
];

interface BackupFile {
    filename: string;
    size: string;
    created_at: string;
    type: string;
    status: string;
}

interface BackupStats {
    totalBackups: number;
    totalSize: string;
    lastBackup: string;
    nextScheduledBackup: string;
    storageUsed: string;
    storageLimit: string;
}

interface Props {
    backups: BackupFile[];
    stats: BackupStats;
    backupSettings: {
        autoBackup: boolean;
        backupFrequency: string;
        retentionDays: number;
        compression: boolean;
        includeFiles: boolean;
    };
}

export default function BackupRestore({ backups, stats, backupSettings }: Props) {
    const [restoreFile, setRestoreFile] = useState<File | null>(null);
    const [isCreatingBackup, setIsCreatingBackup] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const [showCreateBackupDialog, setShowCreateBackupDialog] = useState(false);

    const {
        data,
        setData,
        post,
        delete: destroy,
        processing,
    } = useForm({
        backup_type: 'full',
        compression: 'gzip',
        description: '',
    });

    const handleCreateBackup = () => {
        setShowCreateBackupDialog(true);
    };

    const handleSubmitBackup = () => {
        setIsCreatingBackup(true);
        post('/admin/backup/create', {
            onSuccess: () => {
                setIsCreatingBackup(false);
                setShowCreateBackupDialog(false);
                // Refresh the page to show new backup
                window.location.reload();
            },
            onError: () => {
                setIsCreatingBackup(false);
            },
        });
    };

    const handleRestore = () => {
        if (!restoreFile) {
            alert('Please select a backup file to restore');
            return;
        }

        if (confirm('Are you sure you want to restore from this backup? This will overwrite current data.')) {
            setIsRestoring(true);
            const formData = new FormData();
            formData.append('backup_file', restoreFile);

            post('/admin/backup/restore', {
                onSuccess: () => {
                    setIsRestoring(false);
                    setRestoreFile(null);
                    // Refresh the page
                    window.location.reload();
                },
                onError: () => {
                    setIsRestoring(false);
                },
            });
        }
    };

    const handleDeleteBackup = (filename: string) => {
        if (confirm(`Are you sure you want to delete backup "${filename}"?`)) {
            destroy(`/admin/backup/${filename}`, {
                onSuccess: () => {
                    // Refresh the page to show updated list
                    window.location.reload();
                },
            });
        }
    };

    const handleDownloadBackup = (filename: string) => {
        window.open(`/admin/backup/download/${filename}`, '_blank');
    };

    const getStatusColor = (status: string) => {
        if (status === 'completed') return 'bg-green-100 text-green-800';
        if (status === 'in_progress') return 'bg-blue-100 text-blue-800';
        if (status === 'failed') return 'bg-red-100 text-red-800';
        return 'bg-gray-100 text-gray-800';
    };

    const getStorageUsagePercentage = () => {
        try {
            const used = parseFloat(stats.storageUsed.replace(/[^\d.]/g, ''));
            const limit = parseFloat(stats.storageLimit.replace(/[^\d.]/g, ''));

            if (isNaN(used) || isNaN(limit) || limit === 0) {
                return 0;
            }

            return Math.round((used / limit) * 100);
        } catch {
            return 0;
        }
    };

    return (
        <AdminRouteGuard>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Backup & Restore" />
                <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Backup & Restore</h1>
                                <p className="text-gray-600">Manage database backups and restore operations</p>
                            </div>
                            <Button onClick={handleCreateBackup} disabled={isCreatingBackup}>
                                <Plus className="mr-2 h-4 w-4" />
                                {isCreatingBackup ? 'Creating...' : 'Create Backup'}
                            </Button>
                        </div>
                    </div>

                    {/* Create Backup Dialog */}
                    {showCreateBackupDialog && (
                        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
                            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                                <div className="mb-4">
                                    <h3 className="text-lg font-semibold">Create New Backup</h3>
                                    <p className="text-sm text-gray-600">Configure your backup settings</p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="backup_type">Backup Type</Label>
                                        <Select value={data.backup_type} onValueChange={(value) => setData('backup_type', value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="full">Full Backup</SelectItem>
                                                <SelectItem value="database">Database Only</SelectItem>
                                                <SelectItem value="config">Configuration Only</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="compression">Compression</Label>
                                        <Select value={data.compression} onValueChange={(value) => setData('compression', value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">No Compression</SelectItem>
                                                <SelectItem value="gzip">Gzip</SelectItem>
                                                <SelectItem value="zip">ZIP</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label htmlFor="description">Description (Optional)</Label>
                                        <Input
                                            id="description"
                                            placeholder="Enter backup description..."
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end space-x-2">
                                    <Button variant="outline" onClick={() => setShowCreateBackupDialog(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSubmitBackup} disabled={isCreatingBackup || processing}>
                                        {isCreatingBackup ? 'Creating...' : 'Create Backup'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stats Cards */}
                    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Backups</CardTitle>
                                <Database className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalBackups}</div>
                                <p className="text-xs text-muted-foreground">Backup files</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Size</CardTitle>
                                <HardDrive className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalSize}</div>
                                <p className="text-xs text-muted-foreground">Storage used</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Last Backup</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.lastBackup}</div>
                                <p className="text-xs text-muted-foreground">Last backup time</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
                                <Settings className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{getStorageUsagePercentage()}%</div>
                                <p className="text-xs text-muted-foreground">
                                    {stats.storageUsed} / {stats.storageLimit}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Backup List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Backup Files</CardTitle>
                            <CardDescription>Manage your database backup files</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {backups.length === 0 ? (
                                <div className="py-8 text-center">
                                    <Database className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No backups</h3>
                                    <p className="mt-1 text-sm text-gray-500">Get started by creating your first backup.</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>File</TableHead>
                                            <TableHead>Size</TableHead>
                                            <TableHead>Created</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {backups.map((backup) => (
                                            <TableRow key={backup.filename}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center">
                                                        <FileText className="mr-2 h-4 w-4 text-gray-500" />
                                                        {backup.filename}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{backup.size}</TableCell>
                                                <TableCell>{backup.created_at}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{backup.type}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusColor(backup.status)}>{backup.status}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex space-x-2">
                                                        <Button variant="outline" size="sm" onClick={() => handleDownloadBackup(backup.filename)}>
                                                            <Download className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="outline" size="sm" onClick={() => handleDeleteBackup(backup.filename)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>

                    {/* Restore Section */}
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Restore from Backup</CardTitle>
                            <CardDescription>Upload a backup file to restore your database</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="backup-file">Select Backup File</Label>
                                    <Input
                                        id="backup-file"
                                        type="file"
                                        accept=".sql,.gz,.zip"
                                        onChange={(e) => setRestoreFile(e.target.files?.[0] || null)}
                                    />
                                </div>
                                <Button onClick={handleRestore} disabled={!restoreFile || isRestoring}>
                                    <Upload className="mr-2 h-4 w-4" />
                                    {isRestoring ? 'Restoring...' : 'Restore Database'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Backup Settings */}
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Backup Settings</CardTitle>
                            <CardDescription>Configure automatic backup settings</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <input type="checkbox" id="auto-backup" checked={backupSettings.autoBackup} className="rounded border-gray-300" />
                                    <Label htmlFor="auto-backup">Enable automatic backups</Label>
                                </div>
                                <div>
                                    <Label htmlFor="frequency">Backup Frequency</Label>
                                    <Select value={backupSettings.backupFrequency}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="daily">Daily</SelectItem>
                                            <SelectItem value="weekly">Weekly</SelectItem>
                                            <SelectItem value="monthly">Monthly</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="retention">Retention Period (days)</Label>
                                    <Input id="retention" type="number" value={backupSettings.retentionDays} min="1" max="365" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        </AdminRouteGuard>
    );
}
