import { useState } from "react";

export default function FragmentList({ fragments, user }) {
  const [fragmentData, setFragmentData] = useState({});

  const loadFragmentData = async (id) => {
    if (fragmentData[id]) return; // already loaded

    const res = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
      }/v1/fragments/${id}`,
      {
        headers: user.authorizationHeaders(),
      }
    );

    const text = await res.text(); // assume plain text for now
    setFragmentData((prev) => ({ ...prev, [id]: text }));
  };

  return (
    <ul className="list-group mt-4">
      {fragments.map((fragment) => (
        <li key={fragment.id} className="list-group-item">
          <strong>{fragment.type}</strong>
          <br />
          Size: {fragment.size} bytes
          <br />
          Created: {fragment.created}
          <br />
          Updated: {fragment.updated}
          <br />
          ID: {fragment.id}
          <br />
          <button
            onClick={() => loadFragmentData(fragment.id)}
            className="btn btn-sm btn-outline-primary mt-2"
          >
            Show Data
          </button>
          {fragmentData[fragment.id] && (
            <pre className="mt-2 p-2 bg-light">{fragmentData[fragment.id]}</pre>
          )}
        </li>
      ))}
    </ul>
  );
}
