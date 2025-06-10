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
        const result = await getUserFragments(user);
        setFragments(result.fragments);
      }
    });
  }, []);

  const handleNewFragment = (newFragment) => {
    // Add new fragment to the top of the list
    setFragments((prev) => [newFragment, ...prev]);
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
          <FragmentList fragments={fragments} user={user} />
        </div>
      )}
    </main>
  );
}
