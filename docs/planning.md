# Planning Document

Problem statement

Build a small Task Management web app that demonstrates planning, progressive development, and AI-assisted workflow for the Vibe Coder assignment.

Application overview

Users can create, update, complete, and delete tasks. The app is intentionally minimal to allow clear demonstration of development steps, commit history, and AI usage.

Features
- Create tasks with title, description, due date
- List tasks
- Mark tasks completed / undo
- Delete tasks

Technical architecture

- Frontend: static HTML + vanilla JS served from `public/`
- Backend: Express.js API in `backend/server.js`
- Database: SQLite local file `data.db` via `sqlite3`

Database design

Table `tasks`:
- `id` INTEGER PRIMARY KEY
- `title` TEXT
- `description` TEXT
- `completed` INTEGER (0/1)
- `due_date` TEXT
- `created_at` TEXT
- `updated_at` TEXT

Milestones
- Initial planning commit
- Project scaffold (server, DB, static frontend)
- Implement API CRUD
- Implement frontend UI & integration
- Documentation and AI journal
- Reflection and final polish
