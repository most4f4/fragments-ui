// src/components/LoginButton.js
import React, { useState } from "react";
import { signIn } from "../auth";
import styles from "../styles/LoginButton.module.css";

export default function LoginButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn();
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogin}
      disabled={isLoading}
      className={styles.loginButton}
    >
      {isLoading ? (
        <>
          <span
            className="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          ></span>
          Signing in...
        </>
      ) : (
        <>🚀 Get Started</>
      )}
    </button>
  );
}
