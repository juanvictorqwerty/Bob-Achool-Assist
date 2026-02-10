import { useState, useEffect } from 'react';
import NavBar from "../components/navbar";
import CollectionCard from "../components/collectionCards";
import { Plus, Search, Loader2, Grid, List } from 'lucide-react';

interface Collection {
    id: string;
    collection_name: string;
    created_at: string;
    updated_at: string;
    file_count?: number;
    files?: FileMetadata[];
    }

    interface FileMetadata {
    id: string;
    file_name: string;
    original_name: string;
    file_path: string;
    file_size: number;
    mime_type: string;
    uploaded_at: string;
    }

    const HomePage = () => {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Fetch collections on mount
    useEffect(() => {
        fetchCollections();
    }, []);

    const fetchCollections = async () => {
        try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        
        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch('http://localhost:4000/api/collections', {
          headers
        });
        if (!response.ok) throw new Error('Failed to fetch collections');
        
        const data = await response.json();
        setCollections(data);
        } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
        // For demo purposes, set some mock data if API fails
        setCollections([
            {
            id: '1',
            collection_name: 'Project Documents',
            created_at: '2024-01-15T10:30:00Z',
            updated_at: '2024-01-20T14:22:00Z',
            file_count: 5
            },
            {
            id: '2',
            collection_name: 'Design Assets',
            created_at: '2024-01-10T09:15:00Z',
            updated_at: '2024-01-18T16:45:00Z',
            file_count: 12
            },
            {
            id: '3',
            collection_name: 'Research Papers',
            created_at: '2024-01-05T11:00:00Z',
            updated_at: '2024-01-12T10:30:00Z',
            file_count: 3
            }
        ]);
        } finally {
        setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('You must be logged in to delete collections');
          return;
        }
        
        if (!confirm('Are you sure you want to delete this collection?')) return;
        
        try {
        const response = await fetch(`http://localhost:4000/api/collections/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to delete');
        
        setCollections(collections.filter(c => c.id !== id));
        } catch (err) {
        alert('Failed to delete collection');
        }
    };

    const handleEdit = (collection: Collection) => {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('You must be logged in to edit collections');
          return;
        }
        
        const newName = prompt('Enter new collection name:', collection.collection_name);
        if (newName && newName !== collection.collection_name) {
        updateCollectionName(collection.id, newName);
        }
    };

    const updateCollectionName = async (id: string, newName: string) => {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('You must be logged in to edit collections');
          return;
        }
        
        try {
        const response = await fetch(`http://localhost:4000/api/collections/${id}`, {
            method: 'PUT',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ collection_name: newName })
        });
        if (!response.ok) throw new Error('Failed to update');
        
        setCollections(collections.map(c => 
            c.id === id ? { ...c, collection_name: newName } : c
        ));
        } catch (err) {
        alert('Failed to update collection');
        }
    };

    const handleDownload = async (collection: Collection) => {
        // This is handled inside CollectionCard, but you can add custom logic here
        console.log('Downloading collection:', collection.collection_name);
    };

    const filteredCollections = collections.filter(c => 
        c.collection_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50">
        <NavBar />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">My Collections</h1>
                <p className="text-gray-600 mt-1">
                {collections.length} {collections.length === 1 ? 'collection' : 'collections'} total
                </p>
            </div>
            
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm">
                <Plus size={20} />
                New Collection
            </button>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                type="text"
                placeholder="Search collections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
            </div>
            
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1">
                <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                <Grid size={20} />
                </button>
                <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                <List size={20} />
                </button>
            </div>
            </div>

            {/* Content */}
            {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-600">Loading collections...</p>
            </div>
            ) : error && collections.length === 0 ? (
            <div className="text-center py-20">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-500 text-3xl">!</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load collections</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button 
                onClick={fetchCollections}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                Try Again
                </button>
            </div>
            ) : filteredCollections.length === 0 ? (
            <div className="text-center py-20">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-gray-400" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No collections found</h3>
                <p className="text-gray-600">
                {searchQuery ? 'Try adjusting your search' : 'Create your first collection to get started'}
                </p>
            </div>
            ) : (
            <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "flex flex-col gap-4"
            }>
                {filteredCollections.map((collection) => (
                <CollectionCard
                    key={collection.id}
                    collection={collection}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                    onDownload={handleDownload}
                />
                ))}
            </div>
            )}
        </main>
        </div>
    );
};

export default HomePage;