# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/3c41502a-d748-4fcf-a20b-028c91821e71

## How can I edit this code?

There are several ways of editing your application.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Test Mode (Frontend Only)

To test the application without a backend connection, you can enable test mode by setting the `VITE_TEST_FRONTEND` environment variable to `"true"`.

Create a `.env` file in the root directory:

```sh
VITE_TEST_FRONTEND=true
```

When test mode is enabled:

- Authentication is bypassed
- A mock user and meal plan are automatically loaded
- You can navigate all routes without signing in
- All features work with mock data

**Note:** Remember to set `VITE_TEST_FRONTEND=false` or remove it when you want to connect to the backend.

## Google OAuth Configuration

The app supports both mobile (Capacitor) and web Google OAuth authentication. By default, the app automatically detects the platform and uses the appropriate method.

You can force a specific mode by setting the `VITE_GOOGLE_AUTH_MODE` environment variable:

```sh
# Force mobile mode (uses Capacitor Social Login)
VITE_GOOGLE_AUTH_MODE=mobile

# Force web mode (uses Google Identity Services)
VITE_GOOGLE_AUTH_MODE=web
```

**Note:** If not set, the app will automatically detect the platform:

- Native iOS/Android apps → uses mobile endpoints (`/auth/google/mobile/signin` or `/auth/google/mobile/signup`)
- Web browsers → uses web endpoints (`/auth/google/web/signin` or `/auth/google/web/signup`)

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/3c41502a-d748-4fcf-a20b-028c91821e71) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
