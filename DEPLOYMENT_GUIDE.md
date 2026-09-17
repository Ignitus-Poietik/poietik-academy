# Poietik Academy - Deployment Guide (Vercel + Render + Neon DB)

This guide walks you through deploying the **Frontend to Vercel**, the **Backend to Render**, and connecting the **PostgreSQL Database on Neon**.

---

## 1. Neon Database Setup (PostgreSQL)

1. Go to [Neon Console](https://console.neon.tech/) and sign in or create an account.
2. Click **Create Project**:
   - **Project name**: `poietik-academy-db`
   - **Region**: Choose the region closest to your users or Render service (e.g. `Frankfurt (eu-central-1)` or `Ohio (us-east-2)`).
3. Once created, go to the **Dashboard** and find your **Connection Details**:
   - Select **Connection string** (Direct or Pooled — both are supported).
   - Copy the string. It looks like:
     ```text
     postgresql://neondb_owner:npg_xxxxxx@ep-xxxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
     ```
   - Keep this `DATABASE_URL` ready for Step 2.

---

## 2. Render Backend Setup (Django API)

You can deploy on Render in two ways: **Blueprint (render.yaml)** or **Manual Web Service**.

### Option A: Via Blueprint (Recommended)

1. Push your repository to GitHub / GitLab.
2. Go to [Render Dashboard](https://dashboard.render.com/) -> **Blueprints** -> **New Blueprint Instance**.
3. Connect your repository. Render will automatically detect [`render.yaml`](file:///d:/academy_project/render.yaml).
4. Fill in the required environment variables prompted by Render:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string.
   - `FRONTEND_URL`: Your Vercel frontend URL (e.g. `https://poietik-academy.vercel.app`).
   - `PAYSTACK_SECRET_KEY`: `sk_test_f0a8b2ee5dc0776e8629b4bb5a81b5cab6173ca5` (or live key).
   - `PAYSTACK_PUBLIC_KEY`: `pk_test_f6de2516f0f131877c2e4f6e4c0fce3f9d85d5ff` (or live key).
   - `PAYSTACK_CALLBACK_URL`: `https://<your-vercel-app>.vercel.app/enrollment/success`
5. Click **Apply**. Render will build and deploy:
   - It will run `python manage.py migrate`
   - It will automatically execute `python manage.py setup_initial_data` (creates superuser `saint-poietik` and initial active cohort).

### Option B: Manual Web Service

1. Go to **Render Dashboard** -> **New +** -> **Web Service**.
2. Connect your Git repository.
3. Configure the settings:
   - **Name**: `poietik-academy-api`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `./build.sh` (or `pip install -r requirements.txt && python manage.py collectstatic --no-input`)
   - **Start Command**: `gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --timeout 120`
   - **Health Check Path**: `/api/health/`
4. In the **Environment Variables** tab, add:
   | Key | Value | Notes |
   |---|---|---|
   | `PYTHON_VERSION` | `3.12.8` | Recommended Python version |
   | `DEBUG` | `False` | Production mode |
   | `SECRET_KEY` | _(Click "Generate" on Render)_ | Django production secret key |
   | `DATABASE_URL` | `postgresql://...` | Your Neon DB connection string |
   | `FRONTEND_URL` | `https://your-frontend.vercel.app` | Your Vercel domain |
   | `ALLOWED_HOSTS` | `poietik-academy-api.onrender.com` | Your Render domain (optional, automatically included) |
   | `PAYSTACK_SECRET_KEY` | `sk_test_...` | Paystack Secret Key |
   | `PAYSTACK_PUBLIC_KEY` | `pk_test_...` | Paystack Public Key |
   | `PAYSTACK_CALLBACK_URL` | `https://your-frontend.vercel.app/enrollment/success` | Success redirect |
   | `ADMIN_USERNAME` | `saint-poietik` | Admin username |
   | `ADMIN_PASSWORD` | `poietikacademyi$thebestinwEb£duc8tion` | Admin password |
   | `ADMIN_EMAIL` | `ignituspoietik@gmail.com` | Admin contact email |
   | `WHATSAPP_GROUP_URL` | `https://chat.whatsapp.com/EQCSUbUfF555mJtbhk5uoT` | Gated cohort community |
5. Click **Deploy Web Service**.
6. Copy your Render service URL (e.g. `https://poietik-academy-api.onrender.com`).

---

## 3. Vercel Frontend Setup (React + Vite)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New...** -> **Project**.
2. Import your GitHub repository.
3. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click "Edit" and choose `frontend` (or leave default root; root [`vercel.json`](file:///d:/academy_project/vercel.json) handles both).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. In **Environment Variables**, add:
   | Key | Value |
   |---|---|
   | `VITE_API_BASE_URL` | `https://<your-render-service>.onrender.com/api` |
   _(Note: include `/api` at the end and do not put a trailing slash)_
5. Click **Deploy**.
6. Once deployed, note your Vercel URL (e.g. `https://poietik-academy.vercel.app`).
   - If this is different from what you set in Render's `FRONTEND_URL` and `PAYSTACK_CALLBACK_URL`, update those two variables in your Render Dashboard!

---

## 4. Paystack Webhook Configuration

1. Log into your [Paystack Dashboard](https://dashboard.paystack.com/#/settings/developer).
2. Go to **Settings** -> **API Keys & Webhooks**.
3. Under **Live Webhook URL** (or **Test Webhook URL** for testing):
   - Set URL to: `https://<your-render-service>.onrender.com/api/payments/paystack/webhook/`
4. Click **Save Changes**.

---

## 5. Verifying Deployment

1. **Health Check**: Visit `https://<your-render-service>.onrender.com/api/health/`. It should return `{"status": "ok"}`.
2. **Public Cohorts**: Visit `https://<your-frontend>.vercel.app/`. The active cohort should load immediately.
3. **Admin Sign-in**: Visit `https://<your-frontend>.vercel.app/admin/login`:
   - Username: `saint-poietik`
   - Password: `poietikacademyi$thebestinwEb£duc8tion`
4. **Enrollment Test**: Go to `/enroll`, test student registration with Paystack test cards or MoMo. After payment verification, the gated WhatsApp group button will appear and redirect to your WhatsApp group link.
