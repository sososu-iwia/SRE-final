(function () {
  const storageKey = 'quiz-theme';
  const root = document.documentElement;

  function getPreferredTheme() {
    const savedTheme = localStorage.getItem(storageKey);
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function setTheme(theme) {
    root.dataset.theme = theme;
    localStorage.setItem(storageKey, theme);

    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
      const isDark = theme === 'dark';
      toggle.textContent = isDark ? 'Light' : 'Dark';
      toggle.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
      toggle.setAttribute('title', isDark ? 'Switch to light theme' : 'Switch to dark theme');
    }
  }

  window.quizTheme = {
    get: getPreferredTheme,
    set: setTheme,
    toggle: () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark')
  };

  setTheme(getPreferredTheme());

  document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.addEventListener('click', window.quizTheme.toggle);
      setTheme(root.dataset.theme || getPreferredTheme());
    }
  });
})();
