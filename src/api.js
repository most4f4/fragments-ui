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
    // const username = "user1@email.com";
    // const password = "password1";

    // const credentials = btoa(`${username}:${password}`);

    // const res = await fetch(`${apiUrl}/v1/fragments?expand=1`, {
    //   headers: {
    //     "Content-Type": "application/json",
    //     Authorization: `Basic ${credentials}`,
    //   },
    // });

    const res = await fetch(`${apiUrl}/v1/fragments?expand=1`, {
      // Generate headers with the proper Authorization bearer token to pass.
      // We are using the `authorizationHeaders()` helper method we defined
      // earlier, to automatically attach the user's ID token.
      headers: user.authorizationHeaders(),
    });
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
    // const username = "user1@email.com";
    // const password = "password1";
    // const credentials = btoa(`${username}:${password}`);

    const res = await fetch(`${apiUrl}/v1/fragments`, {
      method: "POST",
      headers: user.authorizationHeaders(contentType),
      // headers: {
      //   "Content-Type": contentType,
      //   Authorization: `Basic ${credentials}`,
      // },
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
    // const username = "user1@email.com";
    // const password = "password1";
    // const credentials = btoa(`${username}:${password}`);

    const res = await fetch(`${apiUrl}/v1/fragments/${id}`, {
      headers: user.authorizationHeaders(),
      // headers: {
      //   "Content-Type": "application/json",
      //   Authorization: `Basic ${credentials}`,
      // },
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

/**
 * Update an existing fragment
 * @param {Object} user - The authenticated user
 * @param {string} fragmentId - The ID of the fragment to update
 * @param {string} content - The new content for the fragment
 * @param {string} contentType - The content type (must match existing fragment type)
 * @returns {Promise<Object>} The updated fragment metadata
 */
export async function updateFragment(user, fragmentId, content, contentType) {
  console.log(`Updating fragment ${fragmentId}...`);
  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${fragmentId}`, {
      method: "PUT",
      headers: {
        ...user.authorizationHeaders(),
        "Content-Type": contentType,
      },
      body: content,
    });

    if (!res.ok) {
      const errorData = await res.json(); // Get error details
      throw new Error(
        errorData.error?.message || `${res.status} ${res.statusText}`
      );
    }

    const result = await res.json();
    console.log("Successfully updated fragment", { result });
    return result;
  } catch (error) {
    console.error("Error updating fragment:", error);
    throw error;
  }
}

/**
 * Delete a fragment
 * @param {Object} user - The authenticated user
 * @param {string} fragmentId - The ID of the fragment to delete
 * @returns {Promise<Object>} The success response
 */
export async function deleteFragment(user, fragmentId) {
  console.log(`Deleting fragment ${fragmentId}...`);
  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${fragmentId}`, {
      method: "DELETE",
      headers: user.authorizationHeaders(),
    });

    if (!res.ok) {
      const errorData = await res.json(); // Get error details
      throw new Error(
        errorData.error?.message || `${res.status} ${res.statusText}`
      );
    }

    const result = await res.json(); // Get success response
    console.log("Successfully deleted fragment", { result });
    return result;
  } catch (error) {
    console.error("Error deleting fragment:", error);
    throw error;
  }
}

// Add this to your src/api.js file

/**
 * Get a fragment converted to a specific format
 * @param {Object} user - The authenticated user
 * @param {string} fragmentId - The ID of the fragment
 * @param {string} extension - The extension to convert to (e.g., 'html', 'txt', 'jpg')
 * @returns {Promise<string|ArrayBuffer>} The converted fragment data
 */
export async function getFragmentConverted(user, fragmentId, extension) {
  console.log(`Converting fragment ${fragmentId} to .${extension}...`);
  try {
    const res = await fetch(
      `${apiUrl}/v1/fragments/${fragmentId}.${extension}`,
      {
        headers: user.authorizationHeaders(),
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(
        errorData.error?.message || `${res.status} ${res.statusText}`
      );
    }

    // Check if it's an image or binary data
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.startsWith("image/")) {
      return await res.blob(); // Return as blob for images
    } else {
      return await res.text(); // Return as text for text formats
    }
  } catch (err) {
    console.error(`Unable to convert fragment ${fragmentId} to .${extension}`, {
      err,
    });
    throw err;
  }
}
