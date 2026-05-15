# Angular Alternative Frontend

This folder contains a compact Angular implementation outline for the same PostgreSQL Quiz API.

The active frontend in this project is the Vite React app in `frontend/react`, because it can be built directly into the existing Express `public/` folder. If your instructor specifically requires Angular, create a standard Angular workspace and move the files below into it:

```bash
npx @angular/cli new quiz-dbms-angular --routing --style css
```

Then copy:

- `app.component.ts`
- `app.component.html`
- `app.component.css`

The Angular version uses the same endpoints:

- `/api/dashboard/stats`
- `/api/quizzes-full`
- `/api/users`
- `/api/student-results`
- `/api/learning/categories`
- `/api/learning/enrollments`
- `/api/learning/result-answers`
- `/api/audit-log`
