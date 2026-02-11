import {
  getAllCollections,
  getCollectionDetails,
  updateCollectionName,
  deleteCollection,
  getCollectionFiles,
  deleteFileFromCollection
} from '../services/collectionService.js';

// Get all collections
const getAllCollectionsHandler = async (req, res) => {
  console.log('\n[COLLECTION] getAllCollectionsHandler called');
  try {
    const collections = await getAllCollections();

    console.log(`[COLLECTION] ✓ Retrieved ${collections.length} collections`);
    res.status(200).json(collections);
  } catch (error) {
    console.error('[COLLECTION] Error:', error);
    res.status(error.status || 500).json({ message: error.message });
  }
};

// Get collection details
const getCollectionDetailsHandler = async (req, res) => {
  try {
    const { collectionId } = req.params;

    const collection = await getCollectionDetails(null, collectionId);
    res.status(200).json(collection);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

// Update collection name
const updateCollectionNameHandler = async (req, res) => {
  try {
    const { collectionId } = req.params;
    const { collection_name } = req.body;

    const result = await updateCollectionName(null, collectionId, collection_name);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

// Delete collection
const deleteCollectionHandler = async (req, res) => {
  try {
    const { collectionId } = req.params;

    const result = await deleteCollection(null, collectionId);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};



// Get collection files
const getCollectionFilesHandler = async (req, res) => {
  try {
    const { collectionId } = req.params;

    const files = await getCollectionFiles(null, collectionId);
    res.status(200).json(files);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

// Delete file
const deleteFileHandler = async (req, res) => {
  try {
    const { fileId } = req.params;

    const result = await deleteFileFromCollection(null, fileId);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export {
  getAllCollectionsHandler,
  getCollectionDetailsHandler,
  updateCollectionNameHandler,
  deleteCollectionHandler,
  getCollectionFilesHandler,
  deleteFileHandler
};
