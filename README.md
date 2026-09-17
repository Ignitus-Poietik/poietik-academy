# Poietik Academy

Poietik Academy is a Ghana-focused engineering academy platform for public admissions, Paystack tuition payments, cohort operations, and student administration.

The repository contains:

- A React 19 + Vite frontend
- A Django backend API
- SQLite for local development
- PostgreSQL/Supabase-compatible configuration for deployment
- Paystack checkout initialization, verification, and signed webhooks
- Session-protected admin routes
- Responsive light-theme UI using the Poietik `b-logo.png` brand palette

## Features

### Public experience

- Landing page with academy positioning, track overview, pedagogy pillars, and responsive navigation
- Web Development Foundations and Full-Stack Development track selection
- Enrollment form for name, email, Ghana WhatsApp number, and cohort
- Admin-configured cohort pricing shown on the enrollment page
- Paystack checkout initialization
- Payment verification and onboarding success flow
- Framer Motion page and content transitions

### Admin suite

Admin pages are protected by the Django session-based admin guard.

- Overview metrics and recent enrollment activity
- Cohort builder with pricing, status, dates, syllabus, and shareable links
- Student roster with search and filtering
- Student deletion and operational actions
- CSV export for student records
- Admin login, session check, and logout

## Project structure

```text
academy_project/
├── backend/
│   ├── academy/
│   │   ├── migrations/
│   │   ├── models.py
│   │   ├── urls.py
│   │   └── views.py
│   ├── backend/
│   │   ├── settings.py
│   │   └── urls.py
│   ├── .env.example
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── pages/
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Requirements

- Python 3.11 or newer
- Node.js 18 or newer
- npm
- A Paystack account for live checkout

## Local setup on Windows

### 1. Backend environment

From the repository root:

```powershell
cd backend
python -m venv ..\.venv
..\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install django
```

If a backend requirements file is added later, install it with:

```powershell
pip install -r requirements.txt
```

### 2. Configure environment values

Copy the example file:

```powershell
Copy-Item .env.example .env
```

Set at least these values for local development:

```env
SECRET_KEY=replace-with-a-local-secret
PAYSTACK_SECRET_KEY=sk_test_replace_me
PAYSTACK_CALLBACK_URL=http://localhost:5173/enrollment/success
DATABASE_URL=
```

The local project currently uses SQLite by default. `DATABASE_URL` is reserved for a PostgreSQL/Supabase deployment configuration.

### 3. Apply migrations and create an admin user

```powershell
python manage.py migrate
python manage.py createsuperuser
```

Start Django:

```powershell
python manage.py runserver 127.0.0.1:8000
```

### 4. Frontend setup

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev -- --host 127.0.0.1
```

The frontend runs at:

```text
http://127.0.0.1:5173/
```

Vite proxies `/api` requests to Django at `http://127.0.0.1:8000` during development.

## Frontend routes

| Route                 | Purpose                                      |
| --------------------- | -------------------------------------------- |
| `/`                   | Public academy landing page                  |
| `/enroll`             | Public cohort selection and enrollment form  |
| `/enrollment/success` | Payment success and onboarding instructions  |
| `/admin/login`        | Admin login                                  |
| `/admin`              | Admin overview                               |
| `/admin/overview`     | Admin overview                               |
| `/admin/cohorts`      | Cohort and public enrollment link builder    |
| `/admin/students`     | Student roster, metrics, filters, and export |

## Backend API

All API routes are under `/api/`.

### Public endpoints

- `GET /api/csrf/`
- `GET /api/cohorts/`
- `POST /api/enroll/initialize/`
- `POST /api/payments/verify/`
- `POST /api/payments/paystack/webhook/`

### Admin endpoints

These require an authenticated staff session:

- `POST /api/admin/login/`
- `GET /api/admin/me/`
- `POST /api/admin/logout/`
- `GET /api/admin/overview/`
- `GET /api/admin/cohorts/`
- `POST /api/admin/cohorts/` (create or update; include `id` to update)
- `DELETE /api/admin/cohorts/<id>/delete/`
- `GET /api/admin/students/`
- `DELETE /api/admin/students/<id>/delete/`
- `GET /api/admin/students/export/`

## Paystack integration

The enrollment flow creates a student record, generates a payment reference, and initializes Paystack checkout when `PAYSTACK_SECRET_KEY` is configured.

Configure the Paystack webhook to point to:

```text
https://your-domain.example/api/payments/paystack/webhook/
```

The webhook validates the `x-paystack-signature` header using HMAC SHA-512 before marking a student payment as paid.

For local testing, use Paystack test credentials and a publicly reachable webhook tunnel. Do not expose the Paystack secret key in frontend code.

## Database and deployment

SQLite is used locally for convenience. For deployment, configure Django to use PostgreSQL or Supabase through environment variables and a production database adapter.

### Deploy the backend to Render with Neon

The repository includes [`render.yaml`](render.yaml). In Render, create a Blueprint from the repository, or create a Python web service with these equivalent settings:

```text
Root directory: backend
Build command: pip install -r requirements.txt && python manage.py collectstatic --no-input
Pre-deploy command: python manage.py migrate
Start command: gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --timeout 120
Health check path: /api/health/
```

Create a Neon database and copy its pooled connection string into Render as `DATABASE_URL`. The Django configuration automatically uses PostgreSQL when `DATABASE_URL` is present and keeps SQLite for local development.

Set these Render environment variables:

```env
DEBUG=False
SECRET_KEY=<generate-a-long-random-secret>
DATABASE_URL=<neon-pooled-postgresql-url>
ALLOWED_HOSTS=poietik-academy-api.onrender.com
FRONTEND_URL=https://<your-vercel-project>.vercel.app
PAYSTACK_SECRET_KEY=sk_live_...
PAYSTACK_PUBLIC_KEY=pk_live_...
PAYSTACK_CALLBACK_URL=https://<your-vercel-project>.vercel.app/enrollment/success
```

Add your custom Vercel domain to `ALLOWED_HOSTS` only if Django itself receives requests for that host. `FRONTEND_URL` is the important value for browser CORS, CSRF, and admin session cookies.

After the first deploy, create the admin account from Render's shell:

```bash
python manage.py createsuperuser
```

### Deploy the frontend to Vercel

Import the `frontend` directory as the Vercel project. Vercel detects Vite automatically.

Set this Vercel environment variable for Production, Preview, and Development as needed:

```env
VITE_API_BASE_URL=https://poietik-academy-api.onrender.com/api
```

The frontend includes [`frontend/vercel.json`](frontend/vercel.json) so direct visits to client-side routes such as `/enroll` and `/admin/login` resolve to the React application instead of returning a 404.

For local development, leave `VITE_API_BASE_URL=/api`; Vite proxies those requests to Django on `127.0.0.1:8000`.

### Paystack production settings

Set the Paystack webhook URL to:

```text
https://poietik-academy-api.onrender.com/api/payments/paystack/webhook/
```

Use live keys only in Render environment variables. Never commit Paystack keys or put the secret key in Vercel.

Before deployment:

- Set `DEBUG=False`
- Replace the local `SECRET_KEY`
- Configure `ALLOWED_HOSTS`
- Configure HTTPS and secure cookies
- Set a production database URL
- Set the Paystack secret key and callback URL
- Configure the Paystack webhook
- Configure real WhatsApp cohort invite links
- Run `python manage.py migrate`
- Build the frontend with `npm run build`

## Validation commands

Frontend:

```powershell
cd frontend
npm run lint
npm run build
```

Backend:

```powershell
cd backend
python manage.py check
python manage.py test academy
```

## Notes

- Public tuition is not hardcoded into the landing page.
- Cohort pricing is controlled by admin-managed cohort records and appears during enrollment.
- The current frontend is Vite + React rather than Next.js because that is the existing project foundation.
- The UI uses external CSS files per component/page and `react-icons` for interface icons.
