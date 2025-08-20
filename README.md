# CloudDocs

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
│   └── index.js               # Main app page; renders login, fragment list, and form components
├── api.js                     # Contains API utility to make authenticated requests to the backend
├── auth.js                    # Handles Cognito sign-in redirect, token parsing, and user session logic
├── components/
│   ├── LoginButton.js         # Reusable button component for triggering Cognito sign-in
│   ├── SignOutButton.js       # Reusable button component for triggering Cognito sign-out
│   ├── FragmentList.js        # Displays a list of user fragments with a button to fetch and view data
│   └── CreateFragmentForm.js  # Form UI to create and submit a new fragment to the backend

```

---

## 🧰 Packages & Libraries

### Core Dependencies

- **next**: Framework for building React apps with server-side rendering, routing, and static site generation
- **react**: Library for building component-based user interfaces
- **react-dom**: Entry point for DOM-related rendering paths in React
- **bootstrap**: Provides responsive UI components and styling
- **oidc-client-ts**: Handles OAuth2 PKCE login flow for secure authentication using Cognito

### Development Dependencies

- **eslint**: JavaScript linter for finding and fixing code issues
- **eslint-config-next**: ESLint rules specifically tailored for Next.js projects
- **@eslint/eslintrc**: ESLint configuration loader for custom setups

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
