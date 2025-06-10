import React from "react";
import { signOut } from "../auth";

export default function SignOutButton() {
  const handleLogout = async (e) => {
    e.preventDefault();
    await signOut();
  };

  return (
    <button onClick={handleLogout} className="btn btn-danger">
      Sign Out
    </button>
  );
}
