// src/pages/index.js
import { useState, useEffect } from "react";
import { getUser } from "../auth";
import { getUserFragments } from "../api";
import FragmentList from "../components/FragmentList";
import CreateFragmentForm from "../components/CreateFragmentForm";
import LandingPage from "../components/LandingPage";
import Dashboard from "../components/Dashboard";

export default function Home() {
  const [user, setUser] = useState(null);
  const [fragments, setFragments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUser().then(async (user) => {
      setUser(user);
      if (user) {
        try {
          const result = await getUserFragments(user);
          // Safely access fragments with fallback
          setFragments(result?.fragments || []);
        } catch (error) {
          console.error("Error fetching fragments:", error);
          setFragments([]);
        }
      }
      setLoading(false);
    });
  }, []);

  const refreshFragments = async () => {
    if (!user) return;

    try {
      const result = await getUserFragments(user);
      setFragments(result?.fragments || []);
    } catch (error) {
      console.error("Error refreshing fragments:", error);
      setFragments([]);
    }
  };

  const handleNewFragment = async (newFragment) => {
    await refreshFragments();
  };

  const handleFragmentChanged = async () => {
    await refreshFragments();
  };

  // Show loading state
  if (loading) {
    return (
      <main>
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "100vh" }}
        >
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p>Loading Fragments...</p>
          </div>
        </div>
      </main>
    );
  }

  // Show landing page for non-authenticated users
  if (!user) {
    return (
      <main>
        <LandingPage />
      </main>
    );
  }

  // Show dashboard for authenticated users
  return (
    <main>
      <Dashboard user={user} fragments={fragments}>
        <CreateFragmentForm user={user} onFragmentCreated={handleNewFragment} />
        <FragmentList
          fragments={fragments}
          user={user}
          onFragmentChanged={handleFragmentChanged}
        />
      </Dashboard>
    </main>
  );
}
