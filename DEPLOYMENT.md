# Deployment Guide

This document provides production deployment instructions for the **Text-to-Speech Application**.

---

## 1. Quick Local Deployment with Docker Compose

Run the entire application (Backend + Frontend) in isolated Docker containers:

```bash
docker compose up -d --build
```
- Frontend available at: `http://localhost:3000`
- Backend REST API available at: `http://localhost:8080`

To stop:
```bash
docker compose down
```

---

## 2. Frontend Deployment (Vercel / Netlify)

The React frontend can be deployed to Vercel or Netlify with zero configuration:

1. **Build Command**: `npm run build`
2. **Output Directory**: `dist`
3. **Environment Variable / Proxy**:
   - Set `VITE_API_BASE_URL` to your production backend URL (e.g., `https://api.your-domain.com`).

---

## 3. Backend Deployment (Render / Railway / AWS / Azure)

### Option A: Railway / Render (Easiest Cloud PaaS)
1. Link your Git repository.
2. Select the `backend` root directory.
3. Build Command: `mvn clean package -DskipTests`
4. Start Command: `java -jar target/tts-backend-0.0.1-SNAPSHOT.jar`
5. Configure Environment Variables:
   - `SERVER_PORT`: `8080` (or `$PORT`)
   - `TTS_PROVIDER`: `google`
   - `APP_CORS_ALLOWED_ORIGINS`: `https://your-frontend.vercel.app`
   - `APP_JWT_SECRET`: `your_secure_64_character_hex_key`

### Option B: AWS Elastic Beanstalk or ECS / Docker
1. Build the Docker container using `backend/Dockerfile`.
2. Push image to Amazon ECR:
   ```bash
   aws ecr get-login-password | docker login ...
   docker tag tts-backend:latest ...
   docker push ...
   ```
3. Deploy ECS task definition referencing the container.
4. Mount an EFS volume or configure AWS S3 for audio storage (`STORAGE_TYPE=s3`, `S3_BUCKET=my-bucket`).

---

## 4. Production Security Checklist

- [x] Configure HTTPS/TLS certificates (via Cloudflare, AWS ACM, or Let's Encrypt).
- [x] Rotate the default `app.jwt.secret` key to a production secret.
- [x] Change the default password for `admin@tts.com`.
- [x] Whitelist only your production frontend domain in `app.cors.allowed-origins`.
- [x] Monitor disk usage in `./generated-audio` or connect to AWS S3 bucket.
