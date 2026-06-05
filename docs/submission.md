# Submission Checklist

Repository: https://github.com/Sarthak-Developer-Coder/Task-Management-App.git

How to run locally

```bash
npm install
npm run dev
# open http://localhost:3001
```

What to include in submission
- Project planning: [docs/planning.md](docs/planning.md)
- AI usage: [docs/ai-journal.md](docs/ai-journal.md)
- Progress log: [docs/progress-log.md](docs/progress-log.md)
- Reflection: [docs/reflection.md](docs/reflection.md)
- README: README.md

CI
- GitHub Actions workflow runs the end-to-end API test on `main` (see `.github/workflows/ci.yml`).

Deployment
- To deploy: push the project to a host (Render, Railway, Vercel). Ensure `PORT` is set to the host-provided port. The app listens on `process.env.PORT || 3001`.

Deliverables to submit
- GitHub repo URL
- Live URL (optional) — if deployed, add here
- Loom / video walkthrough — record using the walkthrough notes in `docs/walkthrough.md` (optional)
