// src/components/FragmentConverter.js
import { useState } from "react";
import { getFragmentConverted } from "../api";

export default function FragmentConverter({ user, fragment }) {
  const [convertedData, setConvertedData] = useState({});
  const [loading, setLoading] = useState({});

  // Define conversion options based on fragment type
  const getConversionOptions = (fragmentType) => {
    const conversions = {
      "text/plain": [{ ext: "txt", label: "Plain Text", mime: "text/plain" }],
      "text/markdown": [
        { ext: "md", label: "Markdown", mime: "text/markdown" },
        { ext: "html", label: "HTML", mime: "text/html" },
        { ext: "txt", label: "Plain Text", mime: "text/plain" },
      ],
      "text/html": [
        { ext: "html", label: "HTML", mime: "text/html" },
        { ext: "txt", label: "Plain Text", mime: "text/plain" },
      ],
      "text/csv": [
        { ext: "csv", label: "CSV", mime: "text/csv" },
        { ext: "txt", label: "Plain Text", mime: "text/plain" },
        { ext: "json", label: "JSON", mime: "application/json" },
      ],
      "application/json": [
        { ext: "json", label: "JSON", mime: "application/json" },
        { ext: "yaml", label: "YAML", mime: "application/yaml" },
        { ext: "txt", label: "Plain Text", mime: "text/plain" },
      ],
      "application/yaml": [
        { ext: "yaml", label: "YAML", mime: "application/yaml" },
        { ext: "txt", label: "Plain Text", mime: "text/plain" },
      ],
      "image/png": [
        { ext: "png", label: "PNG", mime: "image/png" },
        { ext: "jpg", label: "JPEG", mime: "image/jpeg" },
        { ext: "webp", label: "WebP", mime: "image/webp" },
        { ext: "gif", label: "GIF", mime: "image/gif" },
        { ext: "avif", label: "AVIF", mime: "image/avif" },
      ],
      "image/jpeg": [
        { ext: "jpg", label: "JPEG", mime: "image/jpeg" },
        { ext: "png", label: "PNG", mime: "image/png" },
        { ext: "webp", label: "WebP", mime: "image/webp" },
        { ext: "gif", label: "GIF", mime: "image/gif" },
        { ext: "avif", label: "AVIF", mime: "image/avif" },
      ],
      "image/webp": [
        { ext: "webp", label: "WebP", mime: "image/webp" },
        { ext: "png", label: "PNG", mime: "image/png" },
        { ext: "jpg", label: "JPEG", mime: "image/jpeg" },
        { ext: "gif", label: "GIF", mime: "image/gif" },
        { ext: "avif", label: "AVIF", mime: "image/avif" },
      ],
      "image/gif": [
        { ext: "gif", label: "GIF", mime: "image/gif" },
        { ext: "png", label: "PNG", mime: "image/png" },
        { ext: "jpg", label: "JPEG", mime: "image/jpeg" },
        { ext: "webp", label: "WebP", mime: "image/webp" },
        { ext: "avif", label: "AVIF", mime: "image/avif" },
      ],
      "image/avif": [
        { ext: "avif", label: "AVIF", mime: "image/avif" },
        { ext: "png", label: "PNG", mime: "image/png" },
        { ext: "jpg", label: "JPEG", mime: "image/jpeg" },
        { ext: "webp", label: "WebP", mime: "image/webp" },
        { ext: "gif", label: "GIF", mime: "image/gif" },
      ],
    };

    return conversions[fragmentType] || [];
  };

  const handleConvert = async (extension, mimeType) => {
    console.log("Convert clicked:", {
      extension,
      mimeType,
      fragmentId: fragment.id,
    });

    const key = `${fragment.id}_${extension}`; // Use underscore instead of dash

    // If already converted and cached, toggle visibility
    if (convertedData[key]) {
      console.log("Toggling visibility for cached conversion:", key);
      setConvertedData((prev) => {
        const newState = {
          ...prev,
          [key]: { ...prev[key], visible: !prev[key].visible },
        };
        console.log("New convertedData state:", newState);
        return newState;
      });
      return;
    }

    console.log("Starting new conversion:", key);
    setLoading((prev) => ({ ...prev, [key]: true }));

    try {
      console.log("Calling getFragmentConverted...");
      const data = await getFragmentConverted(user, fragment.id, extension);
      console.log("Conversion successful:", {
        extension,
        dataType: typeof data,
      });

      setConvertedData((prev) => {
        const newState = {
          ...prev,
          [key]: {
            data,
            mimeType,
            visible: true,
            isImage: mimeType.startsWith("image/"),
          },
        };
        console.log("Setting convertedData state:", newState);
        return newState;
      });
    } catch (error) {
      console.error("Conversion error:", error);
      alert(`Error converting fragment: ${error.message}`);
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const downloadConverted = (extension, mimeType) => {
    const key = `${fragment.id}_${extension}`; // Use underscore
    const converted = convertedData[key];

    if (!converted) return;

    let blob;
    let filename = `fragment-${fragment.id}.${extension}`;

    if (converted.isImage) {
      blob = converted.data; // Already a blob
    } else {
      blob = new Blob([converted.data], { type: mimeType });
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const conversions = getConversionOptions(fragment.type);

  if (conversions.length <= 1) {
    return (
      <div className="alert alert-info small">
        This fragment type doesn&apos;t support conversions.
      </div>
    );
  }

  return (
    <div className="mt-3">
      <h6>🔄 Convert To:</h6>
      <div className="d-flex flex-wrap gap-1 mb-2">
        {conversions.map(({ ext, label, mime }) => {
          const key = `${fragment.id}_${ext}`; // Use underscore
          const isLoading = loading[key];
          const converted = convertedData[key];
          const isOriginalType = mime === fragment.type;

          return (
            <button
              key={ext}
              onClick={() => handleConvert(ext, mime)}
              className={`btn btn-sm ${
                isOriginalType
                  ? "btn-outline-secondary"
                  : converted?.visible
                  ? "btn-success"
                  : "btn-outline-primary"
              }`}
              disabled={isLoading}
              title={isOriginalType ? "Original format" : `Convert to ${label}`}
            >
              {isLoading ? (
                <span className="spinner-border spinner-border-sm me-1" />
              ) : converted?.visible ? (
                "✓ "
              ) : (
                ""
              )}
              .{ext}
            </button>
          );
        })}
      </div>

      {/* Show converted data */}
      {Object.entries(convertedData).map(([key, data]) => {
        console.log("Rendering conversion:", {
          key,
          data,
          visible: data.visible,
        });

        if (!data.visible) return null;

        const [fragmentIdFromKey, extension] = key.split("_"); // Use underscore
        if (fragmentIdFromKey !== fragment.id) return null;

        return (
          <div key={key} className="card mt-2">
            <div className="card-header d-flex justify-content-between align-items-center">
              <small>
                <strong>Converted to .{extension}</strong>
                <span className="text-muted"> ({data.mimeType})</span>
              </small>
              <div>
                <button
                  onClick={() => downloadConverted(extension, data.mimeType)}
                  className="btn btn-sm btn-outline-primary me-2"
                >
                  📥 Download
                </button>
                <button
                  onClick={() =>
                    setConvertedData((prev) => ({
                      ...prev,
                      [key]: { ...prev[key], visible: false },
                    }))
                  }
                  className="btn btn-sm btn-outline-secondary"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="card-body">
              {data.isImage ? (
                <div className="text-center">
                  <img
                    src={URL.createObjectURL(data.data)}
                    alt={`Converted to ${extension}`}
                    className="img-fluid"
                    style={{ maxHeight: "300px" }}
                    onLoad={() => console.log("Image loaded successfully")}
                    onError={() => console.error("Image failed to load")}
                  />
                  <div className="mt-2 small text-muted">
                    Converted image ({data.mimeType})
                  </div>
                </div>
              ) : (
                <div>
                  <div className="small text-muted mb-2">
                    Converted text content:
                  </div>
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
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Debug info - remove after testing */}
      <div className="mt-2 small text-muted">
        Debug: {Object.keys(convertedData).length} conversions cached
        <br />
        Visible conversions:{" "}
        {Object.values(convertedData).filter((d) => d.visible).length}
      </div>
    </div>
  );
}
