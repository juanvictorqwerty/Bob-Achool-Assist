import { processUpload, getFileForDownloadPublic } from "../services/uploadService.js";

const uploadFiles = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const files = req.files;
    const { collectionName } = req.body;

    if (!token) {
      return res.status(401).json({ message: 'Missing authorization token' });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    // Call service to process business logic
    const result = await processUpload(token, files, collectionName);

    res.status(200).json({
      message: "Files uploaded successfully",
      data: result,
    });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

const downloadFile = async (req, res) => {
    try {
        const { fileId } = req.params;
        
        // Public download - no token required
        const fileData = await getFileForDownloadPublic(fileId);
        
        // Send the file to the client
        res.download(fileData.path, fileData.originalName);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

export { uploadFiles, downloadFile };