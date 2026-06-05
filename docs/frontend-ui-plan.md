# Frontend “World Best UI” Plan

## Information gathered
- Frontend is plain static files: `public/index.html`, `public/styles.css`, `public/app.js`.
- Backend API endpoints:
  - `GET /api/tasks`
  - `POST /api/tasks`
  - `PUT /api/tasks/:id`
  - `DELETE /api/tasks/:id`
  - Auth: `POST /api/auth/register`, `POST /api/auth/login`
- Current UI is minimal: single column, basic task cards, confirm() deletion, limited error handling.

## Plan (file-by-file)

### 1) `public/index.html`
- Upgrade structure to a modern shell:
  - App header with app name + user menu (logout)
  - Tabs/filters for tasks (All / Active / Done)
  - Proper containers for:
    - Auth card (register/login)
    - Task dashboard (new task form + list)
  - Add regions for:
    - toast container
    - error banner / inline messages

### 2) `public/styles.css`
- Replace minimal styling with modern UI:
  - CSS variables for theme
  - improved typography (system font stack)
  - responsive layout (2-column on wide screens)
  - better buttons, inputs, focus outlines
  - skeleton/loader styles
  - refined task cards with:
    - title/description hierarchy
    - due date pill
    - status pill (Active/Completed)
    - hover actions

### 3) `public/app.js`
- UX improvements:
  - Loading state on task fetch (spinner/skeleton)
  - Empty state illustration/text
  - Toast notifications for success/failure
  - Remove `confirm()`; replace with inline “Delete task?” affordance or action toast
  - Add client-side filtering (All/Active/Done)
  - Better date display (format `YYYY-MM-DD`)
  - Add accessibility: ARIA labels, aria-live for toasts
  - Robust error handling with message extraction

## Dependent files to edit
- `public/index.html`
- `public/styles.css`
- `public/app.js`

## Followup steps
- Run `npm run dev`.
- Manually test:
  - register/login
  - create task
  - toggle done
  - delete task
  - filters + empty/loading states
- Ensure no console errors.

