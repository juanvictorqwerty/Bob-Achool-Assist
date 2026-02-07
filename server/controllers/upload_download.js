const uploadService = require("../services/uploadService.js");

const uploadFiles = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    // Call service to process business logic
    const result = await uploadService.processUpload(token, files);

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
        const token = req.headers.authorization?.split(" ")[1];
        
        const fileData = await uploadService.getFileForDownload(token, fileId);
        
        // Send the file to the client
        res.download(fileData.path, fileData.originalName);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

module.exports = { uploadFiles, downloadFile };