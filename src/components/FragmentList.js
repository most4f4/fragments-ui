// src/components/FragmentList.js
import { useState } from "react";
import { getFragment, deleteFragment } from "../api";
import EditFragmentForm from "./EditFragmentForm";
import FragmentConverter from "./FragmentConverter";

export default function FragmentList({ fragments, user, onFragmentChanged }) {
  const [fragmentData, setFragmentData] = useState({});
  const [editingFragment, setEditingFragment] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const loadFragmentData = async (id, fragment) => {
    if (fragmentData[id]) return; // already loaded

    try {
      // For images, we need to handle the response differently
      if (fragment.type.startsWith("image/")) {
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
          }/v1/fragments/${id}`,
          {
            headers: user.authorizationHeaders(),
          }
        );

        if (!response.ok) {
          throw new Error(`${response.status} ${response.statusText}`);
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setFragmentData((prev) => ({ ...prev, [id]: { type: "blob", url } }));
      } else {
        // For text fragments, use the existing method
        const text = await getFragment(user, id);
        setFragmentData((prev) => ({
          ...prev,
          [id]: { type: "text", data: text },
        }));
      }
    } catch (error) {
      console.error(`Error loading fragment ${id}:`, error);
    }
  };

  const handleEdit = (fragment) => {
    setEditingFragment(fragment);
    setShowEditModal(true);
  };

  const handleDelete = async (fragment) => {
    if (
      !confirm(
        `Are you sure you want to delete this fragment?\n\nType: ${fragment.type}\nID: ${fragment.id}`
      )
    ) {
      return;
    }

    try {
      await deleteFragment(user, fragment.id);

      // Clean up blob URL if it exists
      const data = fragmentData[fragment.id];
      if (data?.type === "blob" && data.url) {
        URL.revokeObjectURL(data.url);
      }

      // Remove from cache
      setFragmentData((prev) => {
        const newData = { ...prev };
        delete newData[fragment.id];
        return newData;
      });

      alert("Fragment deleted successfully!");
      onFragmentChanged();
    } catch (error) {
      alert(`Error deleting fragment: ${error.message}`);
    }
  };

  const handleEditClose = () => {
    setShowEditModal(false);
    setEditingFragment(null);
  };

  const handleFragmentUpdated = () => {
    // Clear cached data for this fragment so it reloads
    if (editingFragment) {
      const data = fragmentData[editingFragment.id];
      if (data?.type === "blob" && data.url) {
        URL.revokeObjectURL(data.url);
      }

      setFragmentData((prev) => {
        const newData = { ...prev };
        delete newData[editingFragment.id];
        return newData;
      });
    }
    onFragmentChanged();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getTypeLabel = (type) => {
    const typeLabels = {
      "text/plain": "Plain Text",
      "text/markdown": "Markdown",
      "text/html": "HTML",
      "text/csv": "CSV",
      "application/json": "JSON",
      "application/yaml": "YAML",
      "image/png": "PNG Image",
      "image/jpeg": "JPEG Image",
      "image/webp": "WebP Image",
      "image/gif": "GIF Image",
      "image/avif": "AVIF Image",
    };
    return typeLabels[type] || type;
  };

  const getTypeIcon = (type) => {
    if (type.startsWith("text/")) return "📝";
    if (type.startsWith("application/")) return "📄";
    if (type.startsWith("image/")) return "🖼️";
    return "📋";
  };

  const renderFragmentContent = (fragment) => {
    const data = fragmentData[fragment.id];
    if (!data) return null;

    if (fragment.type.startsWith("image/")) {
      return (
        <div className="text-center">
          <img
            src={data.url}
            alt="Fragment content"
            className="img-fluid"
            style={{ maxHeight: "200px" }}
            onError={() => console.error("Failed to load image")}
          />
        </div>
      );
    } else {
      return (
        <pre
          className="bg-light p-2 small text-break"
          style={{
            maxHeight: "200px",
            overflow: "auto",
            whiteSpace: "pre-wrap",
          }}
        >
          {data.data}
        </pre>
      );
    }
  };

  if (fragments.length === 0) {
    return (
      <div className="alert alert-info mt-4">
        <h5>📭 No fragments yet</h5>
        <p>Create your first fragment using the button above!</p>
      </div>
    );
  }

  return (
    <>
      <div className="mt-4">
        <h3>Your Fragments ({fragments.length})</h3>
        <div className="row">
          {fragments.map((fragment) => (
            <div key={fragment.id} className="col-md-6 col-lg-4 mb-3">
              <div className="card h-100">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <span className="badge bg-primary d-flex align-items-center gap-1">
                    {getTypeIcon(fragment.type)}
                    {getTypeLabel(fragment.type)}
                  </span>
                  <div className="btn-group btn-group-sm">
                    <button
                      onClick={() => handleEdit(fragment)}
                      className="btn btn-outline-warning"
                      title="Edit fragment"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(fragment)}
                      className="btn btn-outline-danger"
                      title="Delete fragment"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="card-body">
                  <div className="small text-muted mb-2">
                    <div className="row">
                      <div className="col-6">
                        <strong>Size:</strong> {fragment.size} bytes
                      </div>
                      <div className="col-6">
                        <strong>Created:</strong>
                        <br />
                        {formatDate(fragment.created)}
                      </div>
                    </div>
                    <div className="mt-1">
                      <strong>Updated:</strong> {formatDate(fragment.updated)}
                    </div>
                  </div>

                  <div className="small text-muted mb-3">
                    <strong>ID:</strong>
                    <code className="d-block text-break small">
                      {fragment.id}
                    </code>
                  </div>

                  <button
                    onClick={() => loadFragmentData(fragment.id, fragment)}
                    className="btn btn-sm btn-outline-primary w-100 mb-2"
                  >
                    {fragmentData[fragment.id]
                      ? "👁️ Hide Content"
                      : "👁️ Show Content"}
                  </button>

                  {fragmentData[fragment.id] && (
                    <div className="mt-2">
                      <hr />
                      <div className="small mb-2">
                        <strong>Content:</strong>
                      </div>
                      {renderFragmentContent(fragment)}
                    </div>
                  )}

                  {/* Converter Component */}
                  <FragmentConverter user={user} fragment={fragment} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <EditFragmentForm
        user={user}
        fragment={editingFragment}
        show={showEditModal}
        onClose={handleEditClose}
        onFragmentUpdated={handleFragmentUpdated}
      />
    </>
  );
}
