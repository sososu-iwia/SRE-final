import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  active = 'dashboard';
  query = '';
  loading = true;
  error = '';
  data: any = {
    dashboard: {},
    quizzes: [],
    users: [],
    results: [],
    categories: [],
    enrollments: [],
    resultAnswers: [],
    audit: []
  };

  nav = ['dashboard', 'quizzes', 'users', 'results', 'learning', 'audit'];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loading = true;
    Promise.all([
      this.http.get('/api/dashboard/stats').toPromise(),
      this.http.get('/api/quizzes-full').toPromise(),
      this.http.get('/api/users').toPromise(),
      this.http.get('/api/student-results').toPromise(),
      this.http.get('/api/learning/categories').toPromise(),
      this.http.get('/api/learning/enrollments').toPromise(),
      this.http.get('/api/learning/result-answers').toPromise(),
      this.http.get('/api/audit-log').toPromise()
    ])
      .then(([dashboard, quizzes, users, results, categories, enrollments, resultAnswers, audit]) => {
        this.data = { dashboard, quizzes, users, results, categories, enrollments, resultAnswers, audit };
        this.error = '';
      })
      .catch((err) => {
        this.error = err.message || 'Failed to load API data';
      })
      .finally(() => {
        this.loading = false;
      });
  }
}
