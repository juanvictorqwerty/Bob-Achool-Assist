import { useState } from 'react';
import { Download, Folder, FileText, Calendar, MoreVertical, Trash2, Edit } from 'lucide-react';

interface FileMetadata {
  id: string;
  file_name: string;
  original_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
}

interface Collection {
  id: string;
  collection_name: string;
  created_at: string;
  updated_at: string;
  file_count?: number;
  files?: FileMetadata[];
}

interface CollectionCardProps {
    collection: Collection;
    onDelete?: (id: string) => void;
    onEdit?: (collection: Collection) => void;
    onDownload?: (collection: Collection) => void;
    }

    const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    };

    export const CollectionCard = ({ 
    collection, 
    onDelete, 
    onEdit,
    onDownload 
    }: CollectionCardProps) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0 });

    const handleDownload = async () => {
        if (isDownloading) return;
        
        setIsDownloading(true);
        setDownloadProgress({ current: 0, total: 0 });
        
        try {
            if (onDownload) {
                await onDownload(collection);
            } else {
                // Default download behavior - download all files as zip or individual files
                await downloadCollection(collection);
            }
        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to download collection: ' + (error instanceof Error ? error.message : 'Unknown error'));
        } finally {
            setIsDownloading(false);
            setDownloadProgress({ current: 0, total: 0 });
        }
    };

    const downloadCollection = async (collection: Collection) => {
        const token = localStorage.getItem('token');
        
        // Fetch collection files if not already present
        let collectionData = collection;
        if (!collection.files || collection.files.length === 0) {
            console.log('Fetching collection details...');
            const response = await fetch(`http://localhost:4000/api/collections/${collection.id}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to fetch collection: ${response.status} - ${errorText}`);
            }
            
            collectionData = await response.json();
        }
        
        // Check if there are files to download
        if (!collectionData.files || collectionData.files.length === 0) {
            alert('No files in this collection');
            return;
        }
        
        console.log(`Starting download of ${collectionData.files.length} files`);
        setDownloadProgress({ current: 0, total: collectionData.files.length });
        
        // Download each file individually with better error handling
        const errors: string[] = [];
        for (let i = 0; i < collectionData.files.length; i++) {
            const file = collectionData.files[i];
            try {
                await downloadFile(file);
                setDownloadProgress({ current: i + 1, total: collectionData.files.length });
                console.log(`Downloaded ${i + 1}/${collectionData.files.length}: ${file.original_name}`);
                
                // Longer delay between downloads to avoid browser blocking
                if (i < collectionData.files.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            } catch (error) {
                console.error(`Failed to download ${file.original_name}:`, error);
                errors.push(file.original_name);
            }
        }
        
        // Show summary
        if (errors.length > 0) {
            alert(`Download completed with errors. Failed files:\n${errors.join('\n')}`);
        } else {
            console.log('All files downloaded successfully');
        }
    };

    const downloadFile = async (file: FileMetadata): Promise<void> => {
        console.log(`Downloading: ${file.original_name} (ID: ${file.id})`);
        
        const response = await fetch(`http://localhost:4000/api/download/${file.id}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const blob = await response.blob();
        
        if (blob.size === 0) {
            throw new Error('Downloaded file is empty');
        }
        
        console.log(`Blob created: ${file.original_name}, size: ${blob.size} bytes`);
        
        // Create temporary URL for the blob
        const url = URL.createObjectURL(blob);
        
        // Create anchor element and trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = file.original_name;
        
        // Important: Add to DOM before clicking (some browsers require this)
        document.body.appendChild(a);
        
        // Click to trigger download
        a.click();
        
        // Cleanup after a short delay
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    };

    return (
        <div className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden">
        {/* Card Header with Gradient */}
        <div className="h-24 bg-gradient-to-br from-blue-500 to-purple-600 relative">
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
            
            {/* Menu Button */}
            <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
            <MoreVertical size={18} />
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
            <div className="absolute top-12 right-3 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-10 min-w-[120px]">
                {onEdit && (
                <button
                    onClick={() => { onEdit(collection); setIsMenuOpen(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                    <Edit size={14} /> Edit
                </button>
                )}
                {onDelete && (
                <button
                    onClick={() => { onDelete(collection.id); setIsMenuOpen(false); }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                    <Trash2 size={14} /> Delete
                </button>
                )}
            </div>
            )}
        </div>

        {/* Card Content */}
        <div className="p-5">
            <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 rounded-lg text-blue-600">
                <Folder size={24} />
                </div>
                <div>
                <h3 className="font-semibold text-gray-900 line-clamp-1" title={collection.collection_name}>
                    {collection.collection_name}
                </h3>
                <p className="text-sm text-gray-500">
                    {collection.file_count || 0} files
                </p>
                </div>
            </div>
            </div>

            {/* Metadata */}
            <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={14} className="text-gray-400" />
                <span>Created {formatDate(collection.created_at)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText size={14} className="text-gray-400" />
                <span>Updated {formatDate(collection.updated_at)}</span>
            </div>
            </div>

            {/* Download Button */}
            <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white rounded-lg transition-all duration-200 font-medium text-sm"
            >
            {isDownloading ? (
                <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>
                    {downloadProgress.total > 0 
                        ? `Downloading ${downloadProgress.current}/${downloadProgress.total}...`
                        : 'Downloading...'
                    }
                </span>
                </>
            ) : (
                <>
                <Download size={18} />
                <span>Download Collection</span>
                </>
            )}
            </button>
        </div>
        </div>
    );
};

export default CollectionCard;