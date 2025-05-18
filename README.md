# Fragments UI

A simple **React + Next.js** frontend for testing and interacting with the secure fragments microservice using **Amazon Cognito** for user authentication and **OIDC (OpenID Connect)**.

---

## ⚙️ Setup Instructions

### 1. Clone the repo

```bash
git clone https://github.com/most4f4/fragments-ui.git
cd fragments-ui
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```
NEXT_PUBLIC_AWS_COGNITO_POOL_ID=us-east-1_abc123
NEXT_PUBLIC_AWS_COGNITO_CLIENT_ID=xyz456exampleclientid
NEXT_PUBLIC_COGNITO_DOMAIN=your-cognito-domain.auth.us-east-1.amazoncognito.com
NEXT_PUBLIC_OAUTH_SIGN_IN_REDIRECT_URL=http://localhost:3000
API_URL=http://localhost:8080
```

---

## 🧪 Testing Auth Flow

1. Run the frontend:

```bash
npm run dev
```

2. Open browser: [http://localhost:3000](http://localhost:3000)

3. Click **Login** — user will be redirected to Cognito Hosted UI.

4. After successful login, the app will:
   - Display the user's email/username
   - Call the fragments microservice with the Bearer token
   - Log response to browser console

---

## 🔐 Authentication

Authentication is handled via **Amazon Cognito** using the **Authorization Code Flow with PKCE**.

- User logs in via the Hosted UI
- Cognito redirects back to the app with `?code=...`
- `oidc-client-ts` exchanges it for tokens
- Authenticated requests are sent to the backend using:

```http
Authorization: Bearer <id_token>
```

---

## 📁 Project Structure

```
/src
├── pages/
│   └── index.js       # Main app page
├── api.js             # Handles fetch to secure backend route
├── auth.js            # Handles signinRedirect, token parsing, and user formatting
├── components/
│   └── Login.jsx      # Optional login form using Amplify UI components
```

---

## 🧰 Packages & Libraries

- **Next.js:** React framework for SSR and routing
- **React:** UI rendering
- **oidc-client-ts:** Handles OAuth2 PKCE login flow
- **@aws-amplify/ui-react:** Optional pre-built UI components
- **dotenv:** Loads env variables (CLI only)

---

## ✅ Example Secure Request

```js
const res = await fetch("http://localhost:8080/v1/fragments", {
  headers: user.authorizationHeaders(),
});
```

---

## 📸 Notes

- Fragments UI is meant for **testing auth flows** and **sending secure API calls**
- It is not a production-ready frontend
- Uses memory storage (not localStorage) for tokens by default
