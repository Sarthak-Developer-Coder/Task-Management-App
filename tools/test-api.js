async function run() {
  const base = 'http://localhost:3001';
  const email = `user+${Date.now()}@example.com`;
  const password = 'Password123!';
  console.log('Registering', email);
  let res = await fetch(base + '/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Test User', email, password }) });
  const regText = await res.text();
  let reg;
  try { reg = JSON.parse(regText); } catch (e) { reg = regText; }
  console.log('Register status', res.status);
  if (!res.ok) { console.error('Register failed', reg); process.exit(1); }
  console.log('Registered OK');
  const token = reg.token;

  console.log('Listing tasks (should be empty)');
  res = await fetch(base + '/api/tasks', { headers: { Authorization: 'Bearer ' + token } });
  const tasksText = await res.text();
  let tasks0;
  try { tasks0 = JSON.parse(tasksText); } catch(e) { tasks0 = tasksText }
  console.log('Tasks status', res.status);
  console.log('Tasks body:', tasks0);

  console.log('Creating a task');
  res = await fetch(base + '/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify({ title: 'Test Task', description: 'Created in test', due_date: null }) });
  const taskText = await res.text();
  let task;
  try { task = JSON.parse(taskText); } catch(e) { task = taskText }
  console.log('Create status', res.status);
  if (!res.ok) { console.error('Create failed', task); process.exit(1); }
  console.log('Created task id', task.id);

  console.log('Updating task to completed');
  res = await fetch(base + '/api/tasks/' + task.id, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify({ ...task, completed: true }) });
  const updated = await res.json();
  if (!res.ok) { console.error('Update failed', updated); process.exit(1); }
  console.log('Updated completed:', updated.completed);

  console.log('Deleting task');
  res = await fetch(base + '/api/tasks/' + task.id, { method: 'DELETE', headers: { Authorization: 'Bearer ' + token } });
  const del = await res.json();
  console.log('Delete result:', del);

  console.log('Test completed successfully');
}

run().catch(err => { console.error(err); process.exit(1); });
