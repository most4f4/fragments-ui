// fragments microservice API to use, defaults to localhost:8080 if not set in env
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * Given an authenticated user, request all fragments for this user from the
 * fragments microservice (currently only running locally). We expect a user
 * to have an `idToken` attached, so we can send that along with the request.
 */
export async function getUserFragments(user) {
  console.log("Requesting user fragments data...");
  try {
    // Use Basic Auth credentials that exist in your .htpasswd file
    const username = "user1@email.com";
    const password = "password1";

    const credentials = btoa(`${username}:${password}`);

    const res = await fetch(`${apiUrl}/v1/fragments?expand=1`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${credentials}`,
      },
    });

    // const res = await fetch(`${apiUrl}/v1/fragments?expand=1`, {
    //   // Generate headers with the proper Authorization bearer token to pass.
    //   // We are using the `authorizationHeaders()` helper method we defined
    //   // earlier, to automatically attach the user's ID token.
    //   // headers: user.authorizationHeaders(),
    //   Authorization: `Basic ${credentials}`,
    // });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log("Successfully got user fragments data", { data });
    return data;
  } catch (err) {
    console.error("Unable to call GET /v1/fragment", { err });
    return { fragments: [] };
  }
}

export async function createFragment(user, data, contentType = "text/plain") {
  console.log("Creating fragment...");
  try {
    const username = "user1@email.com";
    const password = "password1";
    const credentials = btoa(`${username}:${password}`);

    const res = await fetch(`${apiUrl}/v1/fragments`, {
      method: "POST",
      headers: {
        "Content-Type": contentType,
        Authorization: `Basic ${credentials}`,
      },
      body: data,
    });

    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }

    return await res.json();
  } catch (err) {
    console.error("Unable to create fragment", { err });
    throw err;
  }
}

export async function getFragment(user, id) {
  console.log(`Requesting fragment ${id}...`);
  try {
    const username = "user1@email.com";
    const password = "password1";
    const credentials = btoa(`${username}:${password}`);

    const res = await fetch(`${apiUrl}/v1/fragments/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${credentials}`,
      },
    });

    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }

    const text = await res.text(); // Return as text
    return text;
  } catch (err) {
    console.error(`Unable to get fragment ${id}`, { err });
    throw err;
  }
}
