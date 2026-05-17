const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { metricsMiddleware, metricsHandler } = require('./middleware/metrics');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(metricsMiddleware);

const usersRoutes = require('./routes/users.routes');
const quizzesRoutes = require('./routes/quizzes.routes');
const questionsRoutes = require('./routes/questions.routes');
const answersRoutes = require('./routes/answers.routes');
const resultsRoutes = require('./routes/results.routes');
const auditRoutes = require('./routes/audit.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const learningRoutes = require('./routes/learning.routes');

app.use('/api/users', usersRoutes);
app.use('/api/quizzes', quizzesRoutes);
app.use('/api/questions', questionsRoutes);
app.use('/api/answers', answersRoutes);
app.use('/api/results', resultsRoutes);
app.use('/api/audit-log', auditRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/learning', learningRoutes);

app.get('/api/quizzes-full', (req, res) => {
  const quizzesController = require('./controllers/quizzes.controller');
  quizzesController.getQuizzesFull(req, res);
});

app.get('/api/student-results', (req, res) => {
  const resultsController = require('./controllers/results.controller');
  resultsController.getStudentResults(req, res);
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.get('/metrics', metricsHandler);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 1112;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
