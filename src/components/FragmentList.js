import { useState } from "react";
import { getFragment } from "../api";

export default function FragmentList({ fragments, user }) {
  const [fragmentData, setFragmentData] = useState({});

  const loadFragmentData = async (id) => {
    if (fragmentData[id]) return; // already loaded

    try {
      const text = await getFragment(user, id);
      setFragmentData((prev) => ({ ...prev, [id]: text }));
    } catch (error) {
      console.error(`Error loading fragment ${id}:`, error);
      // Optionally set error state or show user feedback
    }
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
