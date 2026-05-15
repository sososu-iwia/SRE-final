import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Database,
  GraduationCap,
  LayoutDashboard,
  Moon,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  Users
} from 'lucide-react';
import './styles.css';

const api = {
  get: async (endpoint) => {
    const response = await fetch(`/api${endpoint}`);
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `HTTP ${response.status}`);
    }
    return response.json();
  }
};

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'quizzes', label: 'Quizzes', icon: BookOpen },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'results', label: 'Results', icon: GraduationCap },
  { id: 'learning', label: 'Learning', icon: ClipboardList },
  { id: 'audit', label: 'Audit', icon: ShieldCheck }
];

function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}

function number(value) {
  const parsed = Number(value || 0);
  return Number.isInteger(parsed) ? parsed : parsed.toFixed(1);
}

function App() {
  const [active, setActive] = useState('dashboard');
  const [query, setQuery] = useState('');
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('quiz-theme');
    if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [data, setData] = useState({
    dashboard: null,
    quizzes: [],
    users: [],
    results: [],
    audit: [],
    categories: [],
    enrollments: [],
    resultAnswers: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadAll() {
    setLoading(true);
    setError('');
    try {
      const [
        dashboard,
        quizzes,
        users,
        results,
        audit,
        categories,
        enrollments,
        resultAnswers
      ] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/quizzes-full'),
        api.get('/users'),
        api.get('/student-results'),
        api.get('/audit-log'),
        api.get('/learning/categories'),
        api.get('/learning/enrollments'),
        api.get('/learning/result-answers')
      ]);

      setData({ dashboard, quizzes, users, results, audit, categories, enrollments, resultAnswers });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('quiz-theme', theme);
  }, [theme]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return data;
    const includes = (row) => JSON.stringify(row).toLowerCase().includes(needle);
    return {
      ...data,
      quizzes: data.quizzes.filter(includes),
      users: data.users.filter(includes),
      results: data.results.filter(includes),
      audit: data.audit.filter(includes),
      categories: data.categories.filter(includes),
      enrollments: data.enrollments.filter(includes),
      resultAnswers: data.resultAnswers.filter(includes)
    };
  }, [data, query]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><Database size={22} /></div>
          <div>
            <strong>Quiz DBMS</strong>
            <span>PostgreSQL workspace</span>
          </div>
        </div>
        <nav className="side-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                className={active === item.id ? 'nav-button active' : 'nav-button'}
                key={item.id}
                onClick={() => setActive(item.id)}
                type="button"
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Educational assessment platform</p>
            <h1>{navItems.find((item) => item.id === active)?.label}</h1>
          </div>
          <div className="toolbar">
            <label className="search-box">
              <Search size={17} />
              <input
                placeholder="Search data"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <button className="icon-button" onClick={loadAll} title="Refresh" type="button">
              <RefreshCw size={18} />
            </button>
            <button
              className="theme-button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              type="button"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        </header>

        {error && <div className="notice error">API error: {error}</div>}
        {loading ? <LoadingState /> : <Content active={active} data={filtered} />}
      </main>
    </div>
  );
}

function Content({ active, data }) {
  if (active === 'dashboard') return <Dashboard data={data} />;
  if (active === 'quizzes') return <Quizzes quizzes={data.quizzes} categories={data.categories} />;
  if (active === 'users') return <UsersView users={data.users} />;
  if (active === 'results') return <Results results={data.results} resultAnswers={data.resultAnswers} />;
  if (active === 'learning') return <Learning categories={data.categories} enrollments={data.enrollments} />;
  return <Audit audit={data.audit} />;
}

function Dashboard({ data }) {
  const stats = data.dashboard || {};
  return (
    <>
      <section className="metric-grid">
        <Metric icon={Users} label="Users" value={stats.users} hint="students, teachers, admins" />
        <Metric icon={BookOpen} label="Quizzes" value={stats.quizzes} hint={`${stats.questions || 0} questions`} />
        <Metric icon={CheckCircle2} label="Attempts" value={stats.results} hint={`${number(stats.passRate)}% pass rate`} />
        <Metric icon={BarChart3} label="Average score" value={number(stats.averageScore)} hint="active attempts only" />
        <Metric icon={Sparkles} label="Learning records" value={(stats.enrollments || 0) + (stats.resultAnswers || 0)} hint="new PostgreSQL tables" />
      </section>

      <section className="dashboard-layout">
        <Panel title="Latest results">
          <DataTable
            columns={['Student', 'Quiz', 'Score', 'Status', 'Submitted']}
            rows={(stats.latestResults || []).map((row) => [
              row.username,
              row.quiz_title,
              `${number(row.score)}%`,
              <Badge tone={row.score >= 60 ? 'success' : 'danger'}>{row.status}</Badge>,
              formatDate(row.submitted_at)
            ])}
          />
        </Panel>
        <Panel title="Top quizzes">
          <div className="stack">
            {(stats.topQuizzes || []).map((quiz) => (
              <div className="progress-row" key={quiz.quiz_id}>
                <div>
                  <strong>{quiz.title}</strong>
                  <span>{quiz.attempts || 0} attempts, avg {number(quiz.average_score)}</span>
                </div>
                <div className="progress-track"><i style={{ width: `${Math.min(Number(quiz.pass_rate || 0), 100)}%` }} /></div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Roles">
          <Breakdown items={stats.roleBreakdown || []} labelKey="role" />
        </Panel>
        <Panel title="Quiz status">
          <Breakdown items={stats.statusBreakdown || []} labelKey="status" />
        </Panel>
      </section>
    </>
  );
}

function Quizzes({ quizzes, categories }) {
  const categoryMap = new Map(categories.map((item) => [item.quiz_id, item.categories]));
  return (
    <section className="quiz-grid">
      {quizzes.map((quiz) => (
        <article className="quiz-card" key={quiz.quiz_id}>
          <div className="card-head">
            <div>
              <h2>{quiz.title}</h2>
              <p>{quiz.description || 'No description yet'}</p>
            </div>
            <Badge tone={quiz.status === 'published' ? 'success' : 'warning'}>{quiz.status}</Badge>
          </div>
          <div className="chip-row">
            {(categoryMap.get(quiz.quiz_id) || '').split(',').filter(Boolean).map((name) => (
              <span className="chip" key={name}>{name}</span>
            ))}
          </div>
          <div className="question-list">
            {(quiz.questions || []).map((question) => (
              <div className="question-item" key={question.question_id}>
                <strong>{question.position}. {question.text}</strong>
                <span>{question.question_type} · {number(question.points)} points</span>
              </div>
            ))}
          </div>
        </article>
      ))}
    </section>
  );
}

function UsersView({ users }) {
  return (
    <Panel title="Users">
      <DataTable
        columns={['ID', 'Name', 'Email', 'Role', 'Created']}
        rows={users.map((user) => [
          user.user_id,
          user.name,
          user.email,
          <Badge tone={user.role === 'admin' ? 'danger' : user.role === 'teacher' ? 'warning' : 'success'}>{user.role}</Badge>,
          formatDate(user.created_at)
        ])}
      />
    </Panel>
  );
}

function Results({ results, resultAnswers }) {
  return (
    <section className="dashboard-layout">
      <Panel title="Student results">
        <DataTable
          columns={['Student', 'Quiz', 'Score', 'Level', 'Submitted']}
          rows={results.map((result) => [
            result.student_name || result.username,
            result.quiz_title,
            `${number(result.score)}%`,
            <Badge tone={result.performance_level === 'passed' ? 'success' : 'danger'}>{result.performance_level || result.status}</Badge>,
            formatDate(result.submitted_at)
          ])}
        />
      </Panel>
      <Panel title="Saved answers">
        <DataTable
          columns={['Student', 'Question', 'Answer', 'Correct', 'Points']}
          rows={resultAnswers.map((row) => [
            row.student_name,
            row.question_text,
            row.answer_text || row.written_answer || '-',
            <Badge tone={row.is_correct ? 'success' : 'danger'}>{row.is_correct ? 'yes' : 'no'}</Badge>,
            number(row.points_awarded)
          ])}
        />
      </Panel>
    </section>
  );
}

function Learning({ categories, enrollments }) {
  return (
    <section className="dashboard-layout">
      <Panel title="Quiz categories">
        <DataTable
          columns={['Quiz', 'Categories']}
          rows={categories.map((row) => [row.quiz_title, row.categories || '-'])}
        />
      </Panel>
      <Panel title="Enrollments">
        <DataTable
          columns={['Student', 'Quiz', 'Assigned by', 'Status', 'Due date']}
          rows={enrollments.map((row) => [
            row.student_name,
            row.quiz_title,
            row.assigned_by_name || '-',
            <Badge tone={row.status === 'completed' ? 'success' : row.status === 'overdue' ? 'danger' : 'warning'}>{row.status}</Badge>,
            formatDate(row.due_at)
          ])}
        />
      </Panel>
    </section>
  );
}

function Audit({ audit }) {
  return (
    <Panel title="Trigger audit log">
      <DataTable
        columns={['ID', 'Operation', 'Table', 'Record', 'Changed at']}
        rows={audit.map((row) => [
          row.audit_id,
          <Badge tone={row.operation_type === 'DELETE' ? 'danger' : row.operation_type === 'UPDATE' ? 'warning' : 'success'}>{row.operation_type}</Badge>,
          row.table_name,
          row.record_id || '-',
          formatDate(row.changed_at)
        ])}
      />
    </Panel>
  );
}

function Metric({ icon: Icon, label, value, hint }) {
  return (
    <article className="metric-card">
      <div className="metric-icon"><Icon size={20} /></div>
      <div>
        <span>{label}</span>
        <strong>{value ?? 0}</strong>
        <small>{hint}</small>
      </div>
    </article>
  );
}

function Panel({ title, children }) {
  return (
    <article className="panel">
      <h2>{title}</h2>
      {children}
    </article>
  );
}

function DataTable({ columns, rows }) {
  if (!rows.length) return <div className="empty">No records found</div>;
  return (
    <div className="table-shell">
      <table>
        <thead>
          <tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Breakdown({ items, labelKey }) {
  return (
    <div className="stack">
      {items.map((item) => (
        <div className="split-row" key={item[labelKey]}>
          <strong>{item[labelKey]}</strong>
          <span>{item.total}</span>
        </div>
      ))}
    </div>
  );
}

function Badge({ tone = 'neutral', children }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

function LoadingState() {
  return (
    <div className="loading-state">
      <Activity size={34} />
      <span>Loading PostgreSQL data...</span>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
