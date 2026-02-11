import { useState, useRef, type ChangeEvent } from "react";
import { useNavigate } from "react-router";
import { Upload, File, X,  Loader2, AlertCircle } from "lucide-react";
import API_BASE_URL from "../config";

const MultiFileUpload = ({ onUploadSuccess }: { onUploadSuccess?: () => void }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [collectionName, setCollectionName] = useState("");
  const [status, setStatus] = useState("idle"); // idle | uploading | success | error
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const MAX_FILES = 6;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    setError("");

    if (files.length + selectedFiles.length > MAX_FILES) {
      setError(`You can only upload a maximum of ${MAX_FILES} files.`);
      return;
    }

    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    if (files.length <= MAX_FILES) setError("");
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    if (!collectionName.trim()) {
      setError("Please enter a collection name");
      return;
    }
    
    setStatus("uploading");
    setError("");

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file); // Use the same key for multiple files
    });
    formData.append("collection_name", collectionName);

    try {
      const response = await fetch(`${API_BASE_URL}/api/upload-multiple`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");
      
      setStatus("success");
      setFiles([]); // Clear after success
      setCollectionName(""); // Clear collection name after success
      if (onUploadSuccess) onUploadSuccess();
      navigate("/");
    } catch (err) {
      setStatus("error");
      setError("Server error occurred during upload.");
    } finally {
      setStatus("idle");
    }
  };

  return (
    <div className="w-full max-w-xl p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-slate-800">Upload Documents</h3>
      
      {/* Collection Name Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Collection Name *
        </label>
        <input
          type="text"
          value={collectionName}
          onChange={(e) => setCollectionName(e.target.value)}
          placeholder="e.g., Math Assignment, Biology Project"
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
          disabled={status === "uploading"}
        />
      </div>
      
      {/* Dropzone */}
      <div 
        className={`relative border-2 border-dashed rounded-xl p-8 transition-all flex flex-col items-center justify-center cursor-pointer
          ${files.length >= MAX_FILES ? 'bg-slate-50 border-slate-200 cursor-not-allowed' : 'border-slate-300 hover:border-orange-400 bg-orange-50/30'}`}
        onClick={() => files.length < MAX_FILES && fileInputRef.current?.click()}
      >
        <Upload className={files.length >= MAX_FILES ? "text-slate-300" : "text-orange-500"} size={32} />
        <p className="mt-2 text-sm font-medium text-slate-600">
          {files.length >= MAX_FILES ? "Limit reached" : "Click to add files"}
        </p>
        <p className="text-xs text-slate-400">{files.length} / {MAX_FILES} files selected</p>
        <input 
          type="file" 
          multiple 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          disabled={files.length >= MAX_FILES}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* File List */}
      <div className="mt-6 space-y-2">
        {files.map((file, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg group">
            <div className="flex items-center gap-3">
              <File className="text-slate-400 group-hover:text-orange-500 transition-colors" size={20} />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-700 truncate max-w-50">{file.name}</span>
                <span className="text-[10px] text-slate-400 uppercase">{(file.size / 1024).toFixed(0)} KB</span>
              </div>
            </div>
            <button 
              onClick={() => removeFile(idx)}
              className="p-1 hover:bg-red-100 hover:text-red-600 rounded text-slate-400 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Action Button */}
      {files.length > 0 && (
        <button
          onClick={handleUpload}
          disabled={status === "uploading"}
          className="w-full mt-6 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {status === "uploading" ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Uploading {files.length} files...
            </>
          ) : (
            `Upload ${files.length} ${files.length === 1 ? 'File' : 'Files'}`
          )}
        </button>
      )}
    </div>
  );
};

export default MultiFileUpload;