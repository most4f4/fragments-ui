// src/components/CreateFragmentForm.js
import { useState } from "react";
import { createFragment } from "../api";

export default function CreateFragmentForm({ user, onFragmentCreated }) {
  const [show, setShow] = useState(false);
  const [content, setContent] = useState("");
  const [contentType, setContentType] = useState("text/plain");
  const [binaryData, setBinaryData] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  // Supported fragment types
  const supportedTypes = [
    { value: "text/plain", label: "Plain Text", category: "text" },
    { value: "text/markdown", label: "Markdown", category: "text" },
    { value: "text/html", label: "HTML", category: "text" },
    { value: "text/csv", label: "CSV", category: "text" },
    { value: "application/json", label: "JSON", category: "data" },
    { value: "application/yaml", label: "YAML", category: "data" },
    { value: "image/png", label: "PNG Image", category: "image" },
    { value: "image/jpeg", label: "JPEG Image", category: "image" },
    { value: "image/webp", label: "WebP Image", category: "image" },
    { value: "image/gif", label: "GIF Image", category: "image" },
    { value: "image/avif", label: "AVIF Image", category: "image" },
  ];

  const resetForm = () => {
    setContent("");
    setContentType("text/plain");
    setBinaryData(null);
    setPreviewUrl("");
    setShow(false);
  };

  const handleContentTypeChange = (newType) => {
    setContentType(newType);
    // Clear content when switching between text and image types
    const oldCategory = getTypeCategory(contentType);
    const newCategory = getTypeCategory(newType);

    if (oldCategory !== newCategory) {
      setContent("");
      setBinaryData(null);
      setPreviewUrl("");
    }
  };

  const getTypeCategory = (type) => {
    const typeInfo = supportedTypes.find((t) => t.value === type);
    return typeInfo?.category || "text";
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Auto-detect content type
    const detectedType = detectFileType(file.name);
    setContentType(detectedType);

    if (detectedType.startsWith("image/")) {
      handleImageFile(file);
    } else {
      handleTextFile(file);
    }
  };

  const detectFileType = (filename) => {
    const ext = filename.toLowerCase().split(".").pop();
    const typeMap = {
      txt: "text/plain",
      md: "text/markdown",
      markdown: "text/markdown",
      html: "text/html",
      htm: "text/html",
      csv: "text/csv",
      json: "application/json",
      yaml: "application/yaml",
      yml: "application/yaml",
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      webp: "image/webp",
      gif: "image/gif",
      avif: "image/avif",
    };
    return typeMap[ext] || "text/plain";
  };

  const handleImageFile = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const arrayBuffer = event.target.result;
      setBinaryData(arrayBuffer);

      // Create preview URL
      const blob = new Blob([arrayBuffer], { type: file.type });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setContent(`[Image file: ${file.name}]`);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleTextFile = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      setContent(event.target.result);
      setBinaryData(null);
      setPreviewUrl("");
    };
    reader.readAsText(file);
  };

  const handleManualImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && contentType.startsWith("image/")) {
      handleImageFile(file);
    }
  };

  const validateContent = () => {
    if (contentType === "application/json" && content) {
      try {
        JSON.parse(content);
      } catch (error) {
        throw new Error("Invalid JSON format. Please check your syntax.");
      }
    }

    if (contentType.startsWith("image/") && !binaryData) {
      throw new Error("Please upload an image file.");
    }

    if (!contentType.startsWith("image/") && !content.trim()) {
      throw new Error("Please enter some content.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      validateContent();

      let fragmentData;
      if (contentType.startsWith("image/")) {
        fragmentData = binaryData;
      } else {
        fragmentData = content;
      }

      const fragment = await createFragment(user, fragmentData, contentType);
      onFragmentCreated(fragment);
      resetForm();
      alert("Fragment created successfully!");
    } catch (error) {
      alert(`Error creating fragment: ${error.message}`);
    }
  };

  const getPlaceholderText = () => {
    switch (contentType) {
      case "application/json":
        return '{\n  "key": "value",\n  "number": 123,\n  "array": [1, 2, 3]\n}';
      case "text/markdown":
        return "# Markdown Title\n\nThis is **bold** text and this is *italic* text.\n\n- List item 1\n- List item 2";
      case "text/html":
        return "<h1>HTML Title</h1>\n<p>This is a <strong>bold</strong> paragraph.</p>\n<ul>\n  <li>List item</li>\n</ul>";
      case "text/csv":
        return "name,age,city\nJohn,25,New York\nJane,30,Los Angeles\nBob,35,Chicago";
      case "application/yaml":
        return "name: Example\nversion: 1.0\nfeatures:\n  - feature1\n  - feature2";
      default:
        return "Enter your text content here...";
    }
  };

  const isImageType = contentType.startsWith("image/");
  const typeCategory = getTypeCategory(contentType);

  return (
    <>
      <div className="d-flex gap-2 mb-3">
        <button className="btn btn-primary" onClick={() => setShow(true)}>
          ➕ Create Fragment
        </button>
      </div>

      {show && (
        <div
          className="modal d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered"
            role="document"
          >
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">Create New Fragment</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={resetForm}
                  ></button>
                </div>

                <div className="modal-body">
                  {/* Content Type Selection */}
                  <div className="mb-3">
                    <label htmlFor="contentType" className="form-label">
                      Fragment Type
                    </label>
                    <select
                      id="contentType"
                      className="form-select"
                      value={contentType}
                      onChange={(e) => handleContentTypeChange(e.target.value)}
                    >
                      <optgroup label="Text Formats">
                        {supportedTypes
                          .filter((t) => t.category === "text")
                          .map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label} ({type.value})
                            </option>
                          ))}
                      </optgroup>
                      <optgroup label="Data Formats">
                        {supportedTypes
                          .filter((t) => t.category === "data")
                          .map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label} ({type.value})
                            </option>
                          ))}
                      </optgroup>
                      <optgroup label="Image Formats">
                        {supportedTypes
                          .filter((t) => t.category === "image")
                          .map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label} ({type.value})
                            </option>
                          ))}
                      </optgroup>
                    </select>
                  </div>

                  {/* File Upload */}
                  <div className="mb-3">
                    <label htmlFor="fileUpload" className="form-label">
                      Upload File {isImageType && "(Required for images)"}
                    </label>
                    <input
                      type="file"
                      id="fileUpload"
                      className="form-control"
                      onChange={handleFileUpload}
                      accept={
                        isImageType
                          ? ".png,.jpg,.jpeg,.webp,.gif,.avif"
                          : ".txt,.json,.md,.html,.csv,.yaml,.yml"
                      }
                    />
                    <div className="form-text">
                      {isImageType
                        ? "Upload an image file"
                        : "Upload a file to auto-populate content and detect type"}
                    </div>
                  </div>

                  {/* Content Input */}
                  <div className="mb-3">
                    <label className="form-label">Content</label>

                    {isImageType ? (
                      // Image Preview Section
                      <div>
                        {previewUrl ? (
                          <div className="text-center p-3 border rounded">
                            <img
                              src={previewUrl}
                              alt="Image preview"
                              className="img-fluid"
                              style={{ maxHeight: "300px" }}
                            />
                            <div className="mt-2">
                              <small className="text-muted">
                                Image loaded ({contentType})
                              </small>
                              <br />
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary mt-1"
                                onClick={() => {
                                  setBinaryData(null);
                                  setPreviewUrl("");
                                  setContent("");
                                }}
                              >
                                Remove Image
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center p-5 border rounded text-muted">
                            <div className="mb-2">📷</div>
                            <div>No image selected</div>
                            <div className="small">
                              Use the file upload above to select an image
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      // Text Content Section
                      <div>
                        <textarea
                          className="form-control"
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          rows="12"
                          placeholder={getPlaceholderText()}
                          required
                          style={{ fontFamily: "monospace", fontSize: "14px" }}
                        />
                        <div className="mt-1 d-flex justify-content-between">
                          <small className="text-muted">
                            Character count: {content.length}
                          </small>
                          {content.length > 5000 && (
                            <small className="text-warning">
                              Large content may take longer to process
                            </small>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Help Text */}
                  <div className="alert alert-info small">
                    <strong>💡 Tip:</strong>{" "}
                    {isImageType
                      ? "Images will be stored in their original format and can be converted to other image formats later."
                      : "Text fragments can be converted to other formats (e.g., Markdown → HTML, CSV → JSON)."}
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={isImageType ? !binaryData : !content.trim()}
                  >
                    Create Fragment
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
