import { useState, useEffect } from "react";
import { getUser } from "../auth";
import { getUserFragments } from "../api";
import FragmentList from "../components/FragmentList";
import CreateFragmentForm from "../components/CreateFragmentForm";
import LoginButton from "../components/LoginButton";
import SignOutButton from "../components/SignOutButton";

export default function Home() {
  const [user, setUser] = useState(null);
  const [fragments, setFragments] = useState([]);

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

  return (
    <main>
      <div className="text-bg-dark p-3 text-center py-5">Fragments UI</div>

      {!user ? (
        <LoginButton />
      ) : (
        <div className="container pt-4">
          <section className="text-center">
            <h2>Welcome, {user.username}!</h2>
            <p>Email: {user.email}</p>
            <SignOutButton />
          </section>

          <CreateFragmentForm
            user={user}
            onFragmentCreated={handleNewFragment}
          />
          <FragmentList
            fragments={fragments}
            user={user}
            onFragmentChanged={handleFragmentChanged}
          />
        </div>
      )}
    </main>
  );
}
