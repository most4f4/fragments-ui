// src/components/EditFragmentForm.js
import { useState, useEffect } from "react";
import { updateFragment } from "../api";

export default function EditFragmentForm({
  user,
  fragment,
  show,
  onClose,
  onFragmentUpdated,
}) {
  const [content, setContent] = useState("");
  const [binaryData, setBinaryData] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingContent, setLoadingContent] = useState(false);

  // Load fragment content when modal opens
  useEffect(() => {
    if (show && fragment) {
      setLoadingContent(true);
      loadFragmentContent();
    }
  }, [show, fragment, user]);

  // Cleanup blob URLs when component unmounts or closes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, []);

  const loadFragmentContent = async () => {
    try {
      if (fragment.type.startsWith("image/")) {
        // For images, fetch as blob and create preview URL
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
          }/v1/fragments/${fragment.id}`,
          {
            headers: user.authorizationHeaders(),
          }
        );

        if (!response.ok) {
          throw new Error(`${response.status} ${response.statusText}`);
        }

        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();

        setBinaryData(arrayBuffer);
        setContent(`[Current image: ${fragment.type}]`);

        // Create preview URL
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
      } else {
        // For text fragments, fetch as text
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
          }/v1/fragments/${fragment.id}`,
          {
            headers: user.authorizationHeaders(),
          }
        );

        if (!response.ok) {
          throw new Error(`${response.status} ${response.statusText}`);
        }

        const text = await response.text();
        setContent(text);
        setBinaryData(null);
        setPreviewUrl("");
      }
    } catch (error) {
      console.error("Error loading fragment content:", error);
      setContent("");
      setBinaryData(null);
      setPreviewUrl("");
      alert(`Error loading fragment: ${error.message}`);
    } finally {
      setLoadingContent(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type matches fragment type
    const expectedType = fragment.type;
    if (file.type !== expectedType) {
      alert(
        `Please upload a ${expectedType} file. Selected file is ${file.type}.`
      );
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const arrayBuffer = event.target.result;
      setBinaryData(arrayBuffer);

      // Clean up old preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      // Create new preview URL
      const blob = new Blob([arrayBuffer], { type: file.type });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setContent(`[New image: ${file.name}]`);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate content based on type
      if (fragment.type === "application/json" && content) {
        try {
          JSON.parse(content);
        } catch (error) {
          throw new Error("Invalid JSON format. Please check your syntax.");
        }
      }

      if (fragment.type.startsWith("image/") && !binaryData) {
        throw new Error("Please upload an image file.");
      }

      if (!fragment.type.startsWith("image/") && !content.trim()) {
        throw new Error("Please enter some content.");
      }

      // Prepare data for submission
      let fragmentData;
      if (fragment.type.startsWith("image/")) {
        fragmentData = binaryData;
      } else {
        fragmentData = content;
      }

      await updateFragment(user, fragment.id, fragmentData, fragment.type);
      onFragmentUpdated();
      onClose();
      alert("Fragment updated successfully!");
    } catch (error) {
      alert(`Error updating fragment: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Clean up blob URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }
    setContent("");
    setBinaryData(null);
    onClose();
  };

  const getPlaceholderText = () => {
    switch (fragment?.type) {
      case "application/json":
        return '{\n  "key": "value",\n  "number": 123,\n  "array": [1, 2, 3]\n}';
      case "text/markdown":
        return "# Markdown Title\n\nThis is **bold** text and this is *italic* text.\n\n- List item 1\n- List item 2";
      case "text/html":
        return "<h1>HTML Title</h1>\n<p>This is a <strong>bold</strong> paragraph.</p>";
      case "text/csv":
        return "name,age,city\nJohn,25,New York\nJane,30,Los Angeles";
      case "application/yaml":
        return "name: Example\nversion: 1.0\nfeatures:\n  - feature1\n  - feature2";
      default:
        return "Enter your text content here...";
    }
  };

  const getAcceptedFileTypes = () => {
    switch (fragment?.type) {
      case "image/png":
        return ".png";
      case "image/jpeg":
        return ".jpg,.jpeg";
      case "image/webp":
        return ".webp";
      case "image/gif":
        return ".gif";
      case "image/avif":
        return ".avif";
      default:
        return "";
    }
  };

  if (!show || !fragment) return null;

  const isImageType = fragment.type.startsWith("image/");

  return (
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
              <h5 className="modal-title">Edit Fragment ({fragment.type})</h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleClose}
              ></button>
            </div>

            <div className="modal-body">
              <div className="alert alert-info">
                <strong>Note:</strong> You cannot change the fragment type. This
                fragment is of type <code>{fragment.type}</code>.
                {isImageType &&
                  " You can replace the image with another image of the same type."}
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <strong>ID:</strong>
                  <code className="small d-block">{fragment.id}</code>
                </div>
                <div className="col-md-6">
                  <strong>Size:</strong> {fragment.size} bytes
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                  <strong>Created:</strong>{" "}
                  {new Date(fragment.created).toLocaleDateString()}
                </div>
                <div className="col-md-6">
                  <strong>Updated:</strong>{" "}
                  {new Date(fragment.updated).toLocaleDateString()}
                </div>
              </div>

              {/* Content Loading State */}
              {loadingContent && (
                <div className="text-center p-4">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p>Loading fragment content...</p>
                </div>
              )}

              {/* Content Input */}
              {!loadingContent && (
                <div className="mb-3">
                  <label className="form-label">Content</label>

                  {isImageType ? (
                    <div>
                      {/* Image Upload */}
                      <div className="mb-3">
                        <label htmlFor="imageUpload" className="form-label">
                          Replace Image
                        </label>
                        <input
                          type="file"
                          id="imageUpload"
                          className="form-control"
                          onChange={handleImageUpload}
                          accept={getAcceptedFileTypes()}
                        />
                        <div className="form-text">
                          Upload a new {fragment.type} image to replace the
                          current one
                        </div>
                      </div>

                      {/* Image Preview */}
                      {previewUrl ? (
                        <div className="text-center p-3 border rounded">
                          <img
                            src={previewUrl}
                            alt="Fragment preview"
                            className="img-fluid"
                            style={{ maxHeight: "300px" }}
                          />
                          <div className="mt-2 small text-muted">
                            {binaryData
                              ? `Image ready for update (${fragment.type})`
                              : "Current image"}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-5 border rounded text-muted">
                          <div className="mb-2">📷</div>
                          <div>No image loaded</div>
                          <div className="small">
                            There was an error loading the current image
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
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
                      <div className="mt-1 small text-muted">
                        Character count: {content.length}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="submit"
                className="btn btn-success"
                disabled={
                  loading ||
                  loadingContent ||
                  (isImageType && !binaryData) ||
                  (!isImageType && !content.trim())
                }
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Updating...
                  </>
                ) : (
                  "Update Fragment"
                )}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
