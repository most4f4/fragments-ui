import { useState } from "react";

export default function CreateFragmentForm({ user, onFragmentCreated }) {
  const [show, setShow] = useState(false);
  const [text, setText] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
      }/v1/fragments`,
      {
        method: "POST",
        headers: user.authorizationHeaders("text/plain"),
        body: text,
      }
    );

    if (res.ok) {
      const { fragment } = await res.json();
      onFragmentCreated(fragment); // notify parent
      setText("");
      setShow(false); // close modal
    } else {
      alert("Failed to create fragment.");
    }
  };

  return (
    <>
      <button className="btn btn-primary" onClick={() => setShow(true)}>
        Create Fragment
      </button>

      {show && (
        <div
          className="modal d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">New Fragment</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShow(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <textarea
                    className="form-control"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows="5"
                    required
                  />
                </div>
                <div className="modal-footer">
                  <button type="submit" className="btn btn-success">
                    Save
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
