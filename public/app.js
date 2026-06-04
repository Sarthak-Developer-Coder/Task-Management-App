async function api(path, opts = {}) {
  opts.headers = opts.headers || {};
  const token = localStorage.getItem('token');
  if (token) opts.headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch(path, opts);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text) e.textContent = text;
  return e;
}

async function load() {
  const list = document.getElementById('tasks');
  list.innerHTML = 'Loading...';
  try {
    const tasks = await api('/api/tasks');
    list.innerHTML = '';
    tasks.forEach(renderTask);
  } catch (err) {
    list.innerHTML = 'Failed to load tasks';
    console.error(err);
  }
}

function renderTask(task) {
  const list = document.getElementById('tasks');
  const li = el('li', 'task');
  const title = el('div', 'task-title', task.title + (task.due_date ? ' — due ' + task.due_date : ''));
  if (task.completed) title.classList.add('completed');
  const desc = el('div', 'task-desc', task.description || '');
  const actions = el('div', 'task-actions');

  const toggle = el('button', 'btn', task.completed ? 'Undo' : 'Done');
  toggle.onclick = async () => {
    await api('/api/tasks/' + task.id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...task, completed: !task.completed }) });
    load();
  };

  const del = el('button', 'btn danger', 'Delete');
  del.onclick = async () => {
    if (!confirm('Delete this task?')) return;
    await api('/api/tasks/' + task.id, { method: 'DELETE' });
    load();
  };

  actions.appendChild(toggle);
  actions.appendChild(del);
  li.appendChild(title);
  li.appendChild(desc);
  li.appendChild(actions);
  list.appendChild(li);
}

function showApp(show) {
  document.getElementById('app').style.display = show ? 'block' : 'none';
  document.getElementById('auth').style.display = show ? 'none' : 'block';
}

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  showApp(!!token);
  if (token) load();

  document.getElementById('add').addEventListener('click', async () => {
    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const due_date = document.getElementById('due_date').value || null;
    if (!title) return alert('Title required');
    await api('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, description, due_date }) });
    document.getElementById('title').value = '';
    document.getElementById('description').value = '';
    document.getElementById('due_date').value = '';
    load();
  });

  document.getElementById('register').addEventListener('click', async () => {
    const name = document.getElementById('reg_name').value.trim();
    const email = document.getElementById('reg_email').value.trim();
    const password = document.getElementById('reg_password').value;
    try {
      const res = await api('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password }) });
      localStorage.setItem('token', res.token);
      showApp(true);
      load();
    } catch (err) { alert('Register failed: ' + err.message); }
  });

  document.getElementById('login').addEventListener('click', async () => {
    const email = document.getElementById('login_email').value.trim();
    const password = document.getElementById('login_password').value;
    try {
      const res = await api('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      localStorage.setItem('token', res.token);
      showApp(true);
      load();
    } catch (err) { alert('Login failed: ' + err.message); }
  });

  document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('token');
    showApp(false);
  });
});
