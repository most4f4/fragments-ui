// src/components/LoginButton.js
import React from "react";
import { signIn } from "../auth";

export default function LoginButton() {
  const handleLogin = async (e) => {
    e.preventDefault();
    await signIn();
  };

  return (
    <div className="d-grid gap-2 col-4 mx-auto pt-5">
      <button onClick={handleLogin} type="button" className="btn btn-success">
        Login
      </button>
    </div>
  );
}
