# Contributing

Thank you for your interest in contributing to the Women Safety App.

Please follow these guidelines:

- Fork the repository and create feature branches off `main`.
- Keep changes small and focused; include tests where applicable.
- Follow existing code style conventions. The backend uses standard Python formatting and the frontend uses React + Tailwind style.
- Run the test suite before opening PRs:

  ```bash
  # Backend tests
  python3 -m unittest discover -s backend/tests -v

  # Frontend build
  cd frontend && npm ci && npm run build
  ```

- Add a short description to your PR describing why the change is needed and any manual steps to validate.
- Respect users' privacy: don't commit any sensitive data (use `.env`, which is ignored by git).

If you're unsure about a larger architectural change, open an issue first and discuss.
