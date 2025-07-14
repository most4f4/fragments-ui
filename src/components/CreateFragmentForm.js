import { useState } from "react";

export default function CreateFragmentForm({ user, onFragmentCreated }) {
  const [show, setShow] = useState(false);
  const [content, setContent] = useState("");
  const [contentType, setContentType] = useState("text/plain");

  // Supported fragment types
  const supportedTypes = [
    { value: "text/plain", label: "Plain Text" },
    { value: "text/markdown", label: "Markdown" },
    { value: "text/html", label: "HTML" },
    { value: "text/csv", label: "CSV" },
    { value: "application/json", label: "JSON" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate JSON if that's the selected type
    if (contentType === "application/json") {
      try {
        JSON.parse(content);
      } catch (error) {
        alert("Invalid JSON format. Please check your syntax.");
        return;
      }
    }

    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
        }/v1/fragments`,
        {
          method: "POST",
          headers: user.authorizationHeaders(contentType),
          body: content,
        }
      );

      if (res.ok) {
        const { fragment } = await res.json();
        onFragmentCreated(fragment); // notify parent
        setContent("");
        setContentType("text/plain");
        setShow(false); // close modal
        alert("Fragment created successfully!");
      } else {
        const errorText = await res.text();
        alert(
          `Failed to create fragment: ${res.status} ${res.statusText}\n${errorText}`
        );
      }
    } catch (error) {
      alert(`Error creating fragment: ${error.message}`);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setContent(event.target.result);

        // Auto-detect content type based on file extension
        const fileName = file.name.toLowerCase();
        if (fileName.endsWith(".json")) {
          setContentType("application/json");
        } else if (fileName.endsWith(".md") || fileName.endsWith(".markdown")) {
          setContentType("text/markdown");
        } else if (fileName.endsWith(".html") || fileName.endsWith(".htm")) {
          setContentType("text/html");
        } else if (fileName.endsWith(".csv")) {
          setContentType("text/csv");
        } else {
          setContentType("text/plain");
        }
      };
      reader.readAsText(file);
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
      default:
        return "Enter your text content here...";
    }
  };

  return (
    <>
      <div className="d-flex gap-2 mb-3">
        <button className="btn btn-primary" onClick={() => setShow(true)}>
          Create Fragment
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
                    onClick={() => setShow(false)}
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
                      onChange={(e) => setContentType(e.target.value)}
                    >
                      {supportedTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label} ({type.value})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* File Upload Option */}
                  <div className="mb-3">
                    <label htmlFor="fileUpload" className="form-label">
                      Upload File (Optional)
                    </label>
                    <input
                      type="file"
                      id="fileUpload"
                      className="form-control"
                      onChange={handleFileUpload}
                      accept=".txt,.json,.md,.html,.csv"
                    />
                    <div className="form-text">
                      Upload a file to auto-populate content and detect type
                    </div>
                  </div>

                  {/* Content Textarea */}
                  <div className="mb-3">
                    <label htmlFor="content" className="form-label">
                      Content
                    </label>
                    <textarea
                      id="content"
                      className="form-control"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows="10"
                      placeholder={getPlaceholderText()}
                      required
                      style={{ fontFamily: "monospace", fontSize: "14px" }}
                    />
                  </div>

                  {/* Character count */}
                  <div className="text-muted small">
                    Character count: {content.length}
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="submit" className="btn btn-success">
                    Create Fragment
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShow(false)}
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
