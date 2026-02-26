import express from 'express';

type Task = {
  id: number;
  title: string;
  done: boolean;
};

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());

let tasks: Task[] = [];
let nextId = 1;

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

app.get('/tasks', (_req, res) => {
  res.json(tasks);
});

app.get('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const task = tasks.find((item) => item.id === id);

  if (!task) {
    return res.status(404).json({ message: 'Task não encontrada' });
  }

  return res.json(task);
});

app.post('/tasks', (req, res) => {
  const title = String(req.body?.title || '').trim();
  const done = Boolean(req.body?.done);

  if (!title) {
    return res.status(400).json({ message: 'Campo title é obrigatório' });
  }

  const newTask: Task = {
    id: nextId,
    title,
    done,
  };

  tasks.push(newTask);
  nextId += 1;

  return res.status(201).json(newTask);
});

app.patch('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const task = tasks.find((item) => item.id === id);

  if (!task) {
    return res.status(404).json({ message: 'Task não encontrada' });
  }

  if (typeof req.body?.title === 'string') {
    const title = req.body.title.trim();
    if (!title) {
      return res.status(400).json({ message: 'Campo title não pode ser vazio' });
    }
    task.title = title;
  }

  if (typeof req.body?.done === 'boolean') {
    task.done = req.body.done;
  }

  return res.json(task);
});

app.delete('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const previousLength = tasks.length;
  tasks = tasks.filter((item) => item.id !== id);

  if (tasks.length === previousLength) {
    return res.status(404).json({ message: 'Task não encontrada' });
  }

  return res.status(204).send();
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API rodando em http://localhost:${port}`);
});
