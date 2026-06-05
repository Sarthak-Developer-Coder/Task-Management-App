# Deployment Guide

This project can be deployed to Render (full backend + static site) and/or Vercel (frontend static site). Below are step-by-step instructions.

Deploy backend (recommended): Render

1. Create an account at https://render.com and connect your GitHub account.
2. Create a new **Web Service** and select this repository.
3. For the build and start commands, leave blank for a Node service; Render will detect `package.json`.
4. Set the start command to: `node backend/server.js` (Render will supply `PORT` automatically).
5. Add any environment variables in Render dashboard (optional): `JWT_SECRET` etc.
6. Once the service is created, enable auto-deploy from the `main` branch. Alternatively, add the repo secrets `RENDER_SERVICE_ID` and `RENDER_API_KEY` and the provided GitHub Actions workflow will trigger deploys.

Deploy frontend: Vercel (static)

1. Create a Vercel account (https://vercel.com) and connect the GitHub repository.
2. When creating a project, choose this repo. In "Framework Preset" select "Other".
3. Set the Output Directory to `public`.
4. Set an environment variable `REACT_APP_API_BASE` or similar if your frontend needs to call the API. For this project, edit `public/app.js` if you need to point to a deployed backend; by default it calls `/api/*` on the same host.
5. Deploy. Vercel will provide a live URL for the frontend.

Notes about configuration

- If you host the backend on Render, set the frontend's API base to the Render URL: e.g. `https://your-service.onrender.com` and update `public/app.js` or set a small proxy configuration.
- Alternatively, deploy both frontend and backend to Render and use the service URL for both.

Using GitHub Actions to deploy to Render

- The repo contains `.github/workflows/deploy-render.yml`. Add `RENDER_SERVICE_ID` and `RENDER_API_KEY` as GitHub Secrets and push to `main` to trigger deploy via API.
