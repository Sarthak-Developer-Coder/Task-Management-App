async function api(path, opts = {}) {
  opts.headers = opts.headers || {};
  const token = localStorage.getItem('token');
  if (token) opts.headers['Authorization'] = 'Bearer ' + token;
    const API_BASE = (typeof window !== 'undefined' && window.__API_BASE__) ? window.__API_BASE__ : '';
    const url = path.startsWith('http') ? path : (API_BASE ? API_BASE.replace(/\/$/, '') + path : path);
    const res = await fetch(url, opts);
  if (!res.ok) {
    let msg;
    try {
      const t = await res.text();
      msg = t || res.statusText;
    } catch {
      msg = res.statusText;
    }
    throw new Error(msg);
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return res.text();
}

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text) e.textContent = text;
  return e;
}

function fmtDate(iso) {
  if (!iso) return '';
  // Works for YYYY-MM-DD and ISO-like values.
  const d = new Date(iso.length === 10 ? iso + 'T00:00:00' : iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toISOString().slice(0, 10);
}

const toastHost = () => document.getElementById('toastHost');

function toast(type, title, message) {
  const host = toastHost();
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  const iconTxt = type === 'success' ? '✓' : type === 'error' ? '!' : 'i';
  t.innerHTML = `
    <div class="ticon" aria-hidden="true">${iconTxt}</div>
    <div>
      <strong>${title}</strong>
      ${message ? `<div class="msg">${message}</div>` : ''}
    </div>
  `;
  host.appendChild(t);

  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateY(6px)';
    t.style.transition = 'all .18s ease';
    setTimeout(() => t.remove(), 220);
  }, 3200);
}

function setBusy(busy) {
  const list = document.getElementById('taskList');
  const status = document.getElementById('taskStatus');
  if (list) list.setAttribute('aria-busy', busy ? 'true' : 'false');
  if (status && busy) status.textContent = 'Loading your tasks…';
}

let state = {
  tasks: [],
  filter: 'all'
};

function applyFilter(tasks) {
  if (state.filter === 'active') return tasks.filter(t => !t.completed);
  if (state.filter === 'done') return tasks.filter(t => !!t.completed);
  return tasks;
}

function syncFilterUI() {
  const buttons = Array.from(document.querySelectorAll('.filter'));
  buttons.forEach(b => {
    const active = b.dataset.filter === state.filter;
    b.classList.toggle('is-active', active);
    b.setAttribute('aria-selected', active ? 'true' : 'false');
  });
}

function renderTask(task) {
  const list = document.getElementById('taskList');

  const li = el('div', 'task');

  const head = document.createElement('div');
  head.className = 'task-head';

  const left = document.createElement('div');
  left.style.display = 'flex';
  left.style.flexDirection = 'column';
  left.style.gap = '6px';

  const title = el(
    'div',
    'task-title',
    task.title + (task.due_date ? '' : '')
  );
  if (task.completed) title.classList.add('completed');

  const pills = document.createElement('div');
  pills.className = 'pills';
  const statusPill = el('span', 'pill ' + (task.completed ? 'done' : 'ok'), task.completed ? 'Completed' : 'Active');
  pills.appendChild(statusPill);
  if (task.due_date) {
    pills.appendChild(el('span', 'pill due', 'Due ' + fmtDate(task.due_date)));
  }

  left.appendChild(title);
  left.appendChild(pills);

  head.appendChild(left);

  const actions = el('div', 'task-actions');

  const toggle = el('button', 'btn btn-mini', task.completed ? 'Undo' : 'Done');
  toggle.onclick = async () => {
    try {
      await api('/api/tasks/' + task.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...task, completed: !task.completed })
      });
      toast('success', 'Updated', task.completed ? 'Marked as active.' : 'Marked as completed.');
      await loadTasks();
    } catch (err) {
      toast('error', 'Update failed', err.message);
    }
  };

  const del = el('button', 'btn btn-mini btn-danger', 'Delete');
  del.onclick = async () => {
    // No confirm(): quick action with toast undo-free (backend delete is final).
    try {
      await api('/api/tasks/' + task.id, { method: 'DELETE' });
      toast('success', 'Deleted', 'Task removed.');
      await loadTasks();
    } catch (err) {
      toast('error', 'Delete failed', err.message);
    }
  };

  actions.appendChild(toggle);
  actions.appendChild(del);

  li.appendChild(head);

  const desc = el('div', 'task-desc', task.description || '');
  if (!task.description) desc.style.display = 'none';

  li.appendChild(desc);
  li.appendChild(actions);

  list.appendChild(li);
}

function renderList() {
  const list = document.getElementById('taskList');
  const empty = document.getElementById('emptyState');
  list.innerHTML = '';

  const filtered = applyFilter(state.tasks);

  if (!filtered.length) {
    if (empty) empty.style.display = 'block';
    if (document.getElementById('taskStatus')) document.getElementById('taskStatus').textContent = '';
    return;
  }

  if (empty) empty.style.display = 'none';

  filtered.forEach(renderTask);
}

async function loadTasks() {
  setBusy(true);
  try {
    const tasks = await api('/api/tasks');
    state.tasks = tasks;
    syncFilterUI();
    renderList();
    const status = document.getElementById('taskStatus');
    if (status) {
      const allCount = tasks.length;
      const filteredCount = applyFilter(tasks).length;
      status.textContent = state.filter === 'all'
        ? `${allCount} task${allCount === 1 ? '' : 's'} total`
        : `${filteredCount} ${state.filter === 'active' ? 'active' : 'completed'} task${filteredCount === 1 ? '' : 's'}`;
    }
  } catch (err) {
    const list = document.getElementById('taskList');
    if (list) list.innerHTML = '';
    const empty = document.getElementById('emptyState');
    if (empty) empty.style.display = 'block';
    toast('error', 'Failed to load tasks', err.message);
  } finally {
    setBusy(false);
  }
}

function showApp(show) {
  document.getElementById('app').style.display = show ? 'block' : 'none';
  document.getElementById('auth').style.display = show ? 'none' : 'block';
}

function wireEvents() {
  const logoutBtn = document.getElementById('logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      toast('info', 'Signed out', 'See you soon.');
      showApp(false);
    });
  }

  document.querySelectorAll('.filter').forEach(btn => {
    btn.addEventListener('click', () => {
      state.filter = btn.dataset.filter || 'all';
      syncFilterUI();
      renderList();
    });
  });

  document.getElementById('add').addEventListener('click', async () => {
    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const due_date = document.getElementById('due_date').value || null;
    const initial_completed = document.getElementById('initial_completed')?.value === '1' ? 1 : 0;

    if (!title) {
      toast('error', 'Validation', 'Title is required.');
      return;
    }

    try {
      await api('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, due_date: due_date || null, completed: initial_completed })
      });
      document.getElementById('title').value = '';
      document.getElementById('description').value = '';
      document.getElementById('due_date').value = '';
      document.getElementById('initial_completed').value = '0';
      toast('success', 'Task added', 'Nice.');
      await loadTasks();
    } catch (err) {
      toast('error', 'Add failed', err.message);
    }
  });

  document.getElementById('register').addEventListener('click', async () => {
    const name = document.getElementById('reg_name').value.trim();
    const email = document.getElementById('reg_email').value.trim();
    const password = document.getElementById('reg_password').value;
    try {
      const res = await api('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      localStorage.setItem('token', res.token);
      document.getElementById('userName').textContent = res.user?.name ? `Hi, ${res.user.name}` : '';
      showApp(true);
      toast('success', 'Welcome', 'Account created.');
      await loadTasks();
    } catch (err) {
      toast('error', 'Register failed', err.message);
    }
  });

  document.getElementById('login').addEventListener('click', async () => {
    const email = document.getElementById('login_email').value.trim();
    const password = document.getElementById('login_password').value;
    try {
      const res = await api('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      localStorage.setItem('token', res.token);
      document.getElementById('userName').textContent = res.user?.name ? `Hi, ${res.user.name}` : '';
      showApp(true);
      toast('success', 'Signed in', 'Let’s do this.');
      await loadTasks();
    } catch (err) {
      toast('error', 'Login failed', err.message);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  wireEvents();

  const token = localStorage.getItem('token');
  const usernameEl = document.getElementById('userName');
  if (!usernameEl) return;

  showApp(!!token);

  if (token) {
    usernameEl.textContent = 'Loading…';
    // We don't have an endpoint to fetch user; fallback to token parse is ok.
    // Token payload includes {id,email}.
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        usernameEl.textContent = payload?.email ? `Signed in as ${payload.email}` : 'Signed in';
      } else {
        usernameEl.textContent = 'Signed in';
      }
    } catch {
      usernameEl.textContent = 'Signed in';
    }
    loadTasks();
  } else {
    state.tasks = [];
    state.filter = 'all';
  }
});

