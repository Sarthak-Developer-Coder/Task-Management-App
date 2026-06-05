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
4. Add environment variable `API_BASE` = `https://<your-backend>.onrender.com` (or your Render URL). Vercel exposes this at build time and `tools/generate-env.js` will write `public/env.js` for the frontend.
5. Deploy. Vercel will provide a live URL for the frontend.

Notes about configuration

- If you host the backend on Render, set the frontend's `API_BASE` to the Render URL: e.g. `https://your-service.onrender.com`. The `tools/generate-env.js` script will also use `RENDER_EXTERNAL_URL` when present.
- Alternatively, deploy both frontend and backend to Render and use the service URL for both.

Using GitHub Actions to deploy to Render

- The repo contains `.github/workflows/deploy-render.yml`. Add `RENDER_SERVICE_ID` and `RENDER_API_KEY` as GitHub Secrets and push to `main` to trigger deploy via API.
