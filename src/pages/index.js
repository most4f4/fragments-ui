import { signIn, getUser } from "../auth";
import { useState, useEffect } from "react";
import { getUserFragments } from "../api";

export default function Home() {
  const [user, setUser] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    await signIn(); // Redirect to Cognito Hosted UI via oidc-client-ts
  };

  useEffect(() => {
    getUser().then(async (user) => {
      setUser(user);

      if (user) {
        const fragments = await getUserFragments(user);
        console.log("User fragments:", fragments);
        // You can setFragments(fragments) later to display them
      }
    });
  }, []);

  return (
    <main>
      <div className="text-bg-dark p-3 text-center py-5 ">Fragments UI</div>

      {!user ? (
        <div className=" d-grid gap-2 col-4 mx-auto pt-5">
          <button
            onClick={handleLogin}
            type="button"
            className="btn btn-success"
          >
            Login
          </button>
        </div>
      ) : (
        <section>
          <h2>Welcome, {user.username}!</h2>
          <p>Email: {user.email}</p>
        </section>
      )}
    </main>
  );
}
