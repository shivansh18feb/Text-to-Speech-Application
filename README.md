# Enterprise Text-to-Speech Web Application

An enterprise-grade, full-stack **Text-to-Speech (TTS) Web Application** built with a **Java 21 / Spring Boot 3** backend and a **React.js 18 / Tailwind CSS** frontend. The system converts written text and uploaded documents into clear, natural-sounding audio with real-time text analysis, audio customization, AI text optimization, persistent speech history, user favorites, JWT authentication, and administrative analytics.

---

## Table of Contents

1. [Project Title & Introduction](#1-project-title--introduction)
2. [Problem Statement](#2-problem-statement)
3. [Objectives](#3-objectives)
4. [Project Levels & Features](#4-project-levels--features)
5. [Technology Stack](#5-technology-stack)
6. [System Architecture](#6-system-architecture)
7. [Folder Structure](#7-folder-structure)
8. [Prerequisites](#8-prerequisites)
9. [Installation & Setup](#9-installation--setup)
10. [Database Setup (H2 & PostgreSQL)](#10-database-setup-h2--postgresql)
11. [TTS Provider Setup](#11-tts-provider-setup)
12. [AI Text Optimizer Setup](#12-ai-text-optimizer-setup)
13. [Cloud Audio Storage Setup](#13-cloud-audio-storage-setup)
14. [Environment Variables](#14-environment-variables)
15. [Running Locally](#15-running-locally)
16. [REST API Documentation](#16-rest-api-documentation)
17. [Authentication & Authorization](#17-authentication--authorization)
18. [Automated & Manual Testing](#18-automated--manual-testing)
19. [Postman Collection](#19-postman-collection)
20. [Security & Abuse Prevention](#20-security--abuse-prevention)
21. [Production Deployment](#21-production-deployment)
22. [Troubleshooting & FAQ](#22-troubleshooting--faq)
23. [Known Limitations](#23-known-limitations)
24. [Future Improvements](#24-future-improvements)
25. [Learning Outcomes](#25-learning-outcomes)

---

## 1. Project Title & Introduction

**Enterprise Text-to-Speech Application** converts written text and uploaded office documents into natural human speech. Designed for high accessibility, language education, and content creation, it bridges the gap between digital text and audible experiences.

---

## 2. Problem Statement

Conventional TTS software often requires complex cloud credentials, expensive API keys, lacks support for common document formats (such as PDF and Word), fails to provide persistent history, and sounds robotic without conversational phrasing optimization.

---

## 3. Objectives

* Build a production-ready application that works **100% out of the box with zero external configuration**.
* Provide multi-lingual speech synthesis across 10 global languages (English, Hindi, Gujarati, Marathi, Spanish, French, German, Italian, Japanese).
* Supply advanced audio customization (Speed, Pitch, Voice Styles).
* Support document text extraction (.txt, .pdf, .docx).
* Implement AI text refinement (summarization, grammar fix, conversational tone).
* Provide secure JWT authentication, speech history, favorites, and an administrative control panel.

---

## 4. Project Levels & Features

### LEVEL 1: Core MVP (Basic)
* **Text Input**: Live character and word counters, 2500 character ceiling, clear button, and quick language sample text inserter.
* **Language & Voice Selection**: 10 languages with dynamic voice selection and gender tagging.
* **Speech Synthesis**: Sentence-chunked natural MP3 audio synthesis.
* **Audio Player**: Play/Pause, interactive timeline seek, timestamps (`0:00 / 0:15`), volume slider, mute toggle, and speed multiplier.
* **Download Audio**: High-visibility download button for clean `.mp3` audio files.
* **Error Handling**: Friendly error banners for validation or network errors.

### LEVEL 2: User Persistence & History (Intermediate)
* **Database Persistence**: Spring Data JPA with embedded H2 file database (persists in `./data/ttsdb`) and PostgreSQL compatibility.
* **Authentication**: Spring Security 6 with stateless JWT and BCrypt password hashing.
* **User Accounts**: Self-registration, login, profile discovery (`/api/auth/me`), and seeded test accounts (`admin@tts.com` and `demo@tts.com`).
* **Speech History**: Automatic recording of all audio generations with one-click replay, redownload, and deletion.
* **Favorites System**: Save favorite voices and bookmark favorite audio syntheses.

### LEVEL 3: Enterprise AI & Document Processing (Advanced)
* **Document Parser**: Upload and extract text from `.txt`, `.pdf` (Apache PDFBox), and `.docx` (Apache POI), with in-browser editing before audio synthesis.
* **AI Text Optimizer**: Transform stiff text into natural spoken cadence, fix grammar/punctuation, summarize, or rewrite for clarity. Works offline out-of-the-box or with external LLMs (`AI_API_KEY`).
* **Audio Customizer**: Real-time control of Speaking Speed (0.5x to 2.0x), Pitch (0.5x to 1.5x), and Voice Style presets.
* **Cloud Storage Ready**: Cloud storage abstraction (`LocalStorageService` with `S3CloudStorageService` hook).
* **Rate Limiting & Abuse Prevention**: Token-bucket rate limiter returning HTTP 429 Too Many Requests if rate limits are exceeded.
* **Admin Dashboard & Analytics**: System statistics (total generations, characters converted, uptime), popular languages and voices metrics, user directory, and role administration (`ROLE_USER` <-> `ROLE_ADMIN`).

---

## 5. Technology Stack

### Frontend
* **React 18** (Functional components, hooks)
* **Vite 5** (Fast modern bundler and dev server)
* **Tailwind CSS 3** (Responsive design system)
* **Lucide React** (Modern iconography)
* **HTML5 Audio API** (Audio controls)

### Backend
* **Java 21 (LTS)**
* **Spring Boot 3.3.4**
* **Spring Security 6** (Stateless JWT authentication)
* **Spring Data JPA & Hibernate** (ORM persistence)
* **Apache PDFBox 3.0** (PDF document text extraction)
* **Apache POI 5.3** (Word DOCX document text extraction)
* **JJWT 0.12.6** (JSON Web Token generation & validation)
* **H2 Database** (Embedded zero-config storage) & **PostgreSQL Driver**
* **Apache Maven**

---

## 6. System Architecture

```
[ React 18 Single Page Application (Tailwind CSS) ]
  ├── Tabs: Synthesizer | File to Speech | AI Optimizer | History | Favorites | Admin
  └── Client: REST API Client (/frontend/src/services/api.js)
                        │
                  HTTP / JSON (Port 8080)
                        │
[ Spring Boot 3 Enterprise Backend Layer ]
  ├── Security: RateLimitingFilter (HTTP 429) -> JwtAuthenticationFilter -> SecurityConfig
  ├── Controllers: Health | Voices | Tts | Auth | History | Favorites | Files | Ai | Admin | Analytics
  ├── Services:
  │     ├── GoogleTtsService (Chunking & MP3 Concatenation)
  │     ├── DocumentExtractionService (PDFBox / Apache POI / TXT)
  │     ├── AiEnhancementService (Conversational / Grammar / Summarize)
  │     ├── AudioStorageService (Disk caching in ./generated-audio/ / S3 ready)
  │     └── AnalyticsService & AuthService
  └── Persistence: Spring Data JPA Repositories -> H2 (Local) / PostgreSQL (Prod)
```

---

## 7. Folder Structure

```
Text-to-Speech Application/
├── backend/
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/
│       ├── main/java/com/example/tts/
│       │   ├── TtsApplication.java
│       │   ├── config/WebConfig.java
│       │   ├── controller/
│       │   │   ├── AdminController.java
│       │   │   ├── AiController.java
│       │   │   ├── AnalyticsController.java
│       │   │   ├── AuthController.java
│       │   │   ├── DocumentController.java
│       │   │   ├── FavoriteController.java
│       │   │   ├── HealthController.java
│       │   │   ├── SpeechHistoryController.java
│       │   │   └── TtsController.java
│       │   ├── dto/
│       │   ├── entity/
│       │   │   ├── Favorite.java
│       │   │   ├── SpeechHistory.java
│       │   │   └── User.java
│       │   ├── exception/GlobalExceptionHandler.java
│       │   ├── repository/
│       │   ├── security/
│       │   │   ├── JwtAuthenticationFilter.java
│       │   │   ├── JwtUtils.java
│       │   │   ├── RateLimitingFilter.java
│       │   │   ├── SecurityConfig.java
│       │   │   └── UserDetailsServiceImpl.java
│       │   └── service/
│       └── test/java/com/example/tts/TtsApplicationTests.java
├── frontend/
│   ├── Dockerfile
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── components/
│       │   ├── AdminAnalyticsTab.jsx
│       │   ├── AiToolsTab.jsx
│       │   ├── AudioCustomizer.jsx
│       │   ├── AudioPlayer.jsx
│       │   ├── AuthModal.jsx
│       │   ├── DownloadButton.jsx
│       │   ├── ErrorMessage.jsx
│       │   ├── FavoritesTab.jsx
│       │   ├── FileUploadTab.jsx
│       │   ├── Footer.jsx
│       │   ├── GenerateButton.jsx
│       │   ├── Header.jsx
│       │   ├── HistoryTab.jsx
│       │   ├── LanguageSelector.jsx
│       │   ├── TextInput.jsx
│       │   └── VoiceSelector.jsx
│       └── services/api.js
├── docker-compose.yml
├── postman_collection.json
├── DATABASE.md
├── DEPLOYMENT.md
├── SCREENSHOTS.md
├── PRESENTATION.md
├── DEMO_SCRIPT.md
├── .gitignore
└── README.md
```

---

## 8. Prerequisites

* **Java JDK 21+** (`java -version`)
* **Apache Maven 3.8+** (`mvn -version`)
* **Node.js 18+ & npm 9+** (`node -v`, `npm -v`)

---

## 9. Installation & Setup

1. **Clone repository**:
   ```bash
   git clone <repo-url>
   cd "Text-to-Speech Application"
   ```
2. **Install frontend dependencies**:
   ```bash
   cd frontend
   npm install
   cd ..
   ```
3. **Verify backend builds and tests pass**:
   ```bash
   cd backend
   mvn test
   cd ..
   ```

---

## 10. Database Setup (H2 & PostgreSQL)

### Default Development Database: Embedded H2
The application defaults to an embedded, auto-reloading H2 database stored at `./data/ttsdb`.
* Web Console: `http://localhost:8080/h2-console`
* JDBC URL: `jdbc:h2:file:./data/ttsdb`
* Username: `sa` | Password: `password`

### Production Database: PostgreSQL
In `backend/src/main/resources/application.properties` or environment variables:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/ttsdb
spring.datasource.username=postgres
spring.datasource.password=your_password
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
```
Refer to [`DATABASE.md`](./DATABASE.md) for full schema and relational documentation.

---

## 11. TTS Provider Setup

* **Default Provider**: High-availability natural speech engine with sentence and punctuation chunking. Operates with **zero setup and zero API keys**.
* **Optional VoiceRSS**:
  Set environment variable `TTS_API_KEY=your_key_here` to route requests through VoiceRSS.

---

## 12. AI Text Optimizer Setup

* **Default Provider**: Built-in NLP heuristic engine performing conversational adaptation, grammar correction, summarization, and clarity rewrites. Works offline with zero credentials.
* **Optional External LLM (OpenAI / Claude / Gemini)**:
  Set environment variable `AI_API_KEY=your_api_key` and `AI_PROVIDER=openai`.

---

## 13. Cloud Audio Storage Setup

* **Default**: High-performance local caching in `./backend/generated-audio/`.
* **AWS S3 Cloud**: Set `STORAGE_TYPE=s3`, `S3_BUCKET=your_bucket_name`, and `AWS_REGION=us-east-1`.

---

## 14. Environment Variables

| Variable | Default | Purpose |
|---|---|---|
| `SERVER_PORT` | `8080` | Port for Spring Boot backend |
| `TTS_PROVIDER` | `google` | TTS synthesis provider (`google`, `voicerss`) |
| `TTS_API_KEY` | *(empty)* | Optional VoiceRSS API key |
| `AI_API_KEY` | *(empty)* | Optional external LLM API key |
| `STORAGE_TYPE` | `local` | Audio storage mode (`local` or `s3`) |
| `APP_JWT_SECRET` | *(64-char key)* | Secret key for signing JWT tokens |
| `APP_CORS_ALLOWED_ORIGINS` | `http://localhost:5173,http://localhost:3000` | Whitelisted frontend origins |

---

## 15. Running Locally

Open two terminal windows:

### Terminal 1: Backend Server (Port 8080)
```powershell
cd "backend"
mvn spring-boot:run
```

### Terminal 2: React Frontend (Port 5173)
```powershell
cd "frontend"
npm run dev
```

Navigate to: **`http://localhost:5173`**

### Default Accounts for Instant Testing:
* **Administrator**: `admin@tts.com` / `Admin@123` (Full Admin Privileges)
* **Standard User**: `demo@tts.com` / `Demo@123` (Standard Privileges)

---

## 16. REST API Documentation

### Key Endpoints

| Category | Method | Endpoint | Description | Auth Required |
|---|---|---|---|:---:|
| **Health** | `GET` | `/api/health` | Backend status & provider metrics | No |
| **Catalog** | `GET` | `/api/languages` | Supported languages & voices | No |
| **Catalog** | `GET` | `/api/voices` | Supported voices (`?language=...`) | No |
| **TTS** | `POST` | `/api/tts` | Synthesizes text into speech MP3 | No |
| **Audio** | `GET` | `/api/tts/audio/{file}` | Streams audio or downloads (`?download=true`) | No |
| **Auth** | `POST` | `/api/auth/register` | Registers a new account | No |
| **Auth** | `POST` | `/api/auth/login` | Authenticates user & returns JWT | No |
| **Auth** | `GET` | `/api/auth/me` | Returns logged-in user profile | **Yes** |
| **History** | `GET` | `/api/history` | Retrieves user speech history | No / Yes |
| **History** | `DELETE` | `/api/history/{id}` | Deletes history entry | **Yes** |
| **Favorites** | `GET` | `/api/favorites` | Returns user favorites | **Yes** |
| **Favorites** | `POST` | `/api/favorites` | Adds a voice or speech to favorites | **Yes** |
| **Favorites** | `DELETE` | `/api/favorites/{id}` | Deletes favorite bookmark | **Yes** |
| **Files** | `POST` | `/api/files/extract` | Extracts text from TXT, PDF, DOCX | No |
| **AI** | `POST` | `/api/ai/enhance` | Optimizes text (conversational/grammar/etc) | No |
| **Analytics** | `GET` | `/api/analytics` | Statistical usage overview | No |
| **Admin** | `GET` | `/api/admin/stats` | System administrator metrics | **Admin** |
| **Admin** | `GET` | `/api/admin/users` | Lists all registered accounts | **Admin** |
| **Admin** | `PUT` | `/api/admin/users/{id}/role` | Updates user role (User/Admin) | **Admin** |

---

## 17. Authentication & Authorization

* **Mechanism**: Stateless JSON Web Tokens (JWT) in standard `Authorization: Bearer <token>` header.
* **Security**: Passwords hashed with BCrypt (strength 10).
* **Roles**: `ROLE_USER` for regular users; `ROLE_ADMIN` for system management.

---

## 18. Automated & Manual Testing

### Automated Backend Tests
Run the 11 Spring Boot unit & integration tests:
```bash
cd backend
mvn test
```
**Results**: `Tests run: 11, Failures: 0, Errors: 0, Skipped: 0` (BUILD SUCCESS).

---

## 19. Postman Collection

An importable Postman collection is included in the project root:
* File: [`postman_collection.json`](./postman_collection.json)
* Import directly into Postman. Automatically handles Bearer tokens on Login!

---

## 20. Security & Abuse Prevention

1. **Rate Limiting**: In-memory token bucket rate limiter restricting abuse (30 requests/minute/IP) returning HTTP 429.
2. **Input Validation**: Backend Bean Validation on all payload structures; maximum character limit strictly enforced.
3. **Secret Protection**: API keys never sent to frontend; secrets loaded via environment variables; `.env` excluded in `.gitignore`.
4. **Path Traversal Protection**: Audio filenames strictly sanitized prior to file system reads.

---

## 21. Production Deployment

Refer to [`DEPLOYMENT.md`](./DEPLOYMENT.md) for full instructions:
* **Docker Compose**: `docker compose up -d --build`
* **Frontend**: Deployable to Vercel or Netlify.
* **Backend**: Deployable to AWS, Render, Railway, or Azure.

---

## 22. Troubleshooting & FAQ

* **Port 8080 already in use**: Start backend on alternative port:
  `mvn spring-boot:run -Dspring-boot.run.arguments="--server.port=8081"`
* **Can I upload password-protected PDFs?**: No, encrypted or password-protected PDFs are rejected with a 400 Bad Request error.
* **Where are generated audio files saved?**: In `./backend/generated-audio/` (gitignored).

---

## 23. Known Limitations

* Large PDF files (>15 MB) are restricted by file upload limits.
* Voice styles are synthesized based on punctuation cadence and pitch tuning for standard natural voices.

---

## 24. Future Improvements

* Direct AWS S3 integration for persistent multi-region cloud archiving.
* Voice cloning and emotion parameter synthesis.
* Mobile application built with React Native.

---

## 25. Learning Outcomes

This project demonstrates:
* Enterprise Spring Boot 3 & Java 21 architecture.
* Stateless JWT security with BCrypt password hashing.
* Relational database persistence with Spring Data JPA & Hibernate.
* Multimedia streaming and MP3 byte frame aggregation.
* Document parsing with Apache PDFBox (PDF) and Apache POI (Word DOCX).
* Production-grade React 18 component structure with Tailwind CSS.
