# Database Schema Documentation

## Overview
The Text-to-Speech Application uses **Spring Data JPA** with an embedded **H2** file-based database for immediate zero-config development (`./data/ttsdb`), fully compatible with **PostgreSQL** in production environments.

---

## 1. Entity Relationship Diagram (ERD)

```
       +-------------------------+
       |          users          |
       +-------------------------+
       | PK  id (BIGINT)         |
       |     name (VARCHAR)      |
       | UQ  email (VARCHAR)     |
       |     password (VARCHAR)  |
       |     role (VARCHAR)      |
       |     createdAt (DATETIME)|
       +------------+------------+
                    |
       +------------+------------+
       |                         |
       | 1:N                     | 1:N
       v                         v
+-------------------------+  +--------------------------+
|     speech_history      |  |        favorites         |
+-------------------------+  +--------------------------+
| PK  id (BIGINT)         |  | PK  id (BIGINT)          |
| FK  user_id (BIGINT,opt)|  | FK  user_id (BIGINT,req) |
|     text (TEXT)         |  |     targetType (VARCHAR) |
|     language (VARCHAR)  |  |     referenceId(VARCHAR) |
|     voice (VARCHAR)     |  |     title (VARCHAR)      |
|     speed (DOUBLE)      |  |     metadataJson (TEXT)  |
|     pitch (DOUBLE)      |  |     createdAt (DATETIME) |
|     voiceStyle (VARCHAR)|  +--------------------------+
|     audioUrl (VARCHAR)  |
|     audioSizeBytes (BIG)|
|     characterCount (INT)|
|     wordCount (INT)     |
|     createdAt (DATETIME)|
+-------------------------+
```

---

## 2. Table Specifications

### Table: `users`
Stores registered user accounts and administrative privileges.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGINT` | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `name` | `VARCHAR(255)` | NOT NULL | Full name of the user |
| `email` | `VARCHAR(255)` | NOT NULL, UNIQUE | User login email address |
| `password` | `VARCHAR(255)` | NOT NULL | BCrypt password hash |
| `role` | `VARCHAR(50)` | NOT NULL | Security authority (`ROLE_USER`, `ROLE_ADMIN`) |
| `created_at` | `TIMESTAMP` | NOT NULL | Timestamp of account registration |

**Default Seeded Accounts**:
- `admin@tts.com` / `Admin@123` (Role: `ROLE_ADMIN`)
- `demo@tts.com` / `Demo@123` (Role: `ROLE_USER`)

---

### Table: `speech_history`
Stores audio generation records for replay, audit, analytics, and redownload.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGINT` | PRIMARY KEY, AUTO_INCREMENT | History entry ID |
| `user_id` | `BIGINT` | FOREIGN KEY (`users.id`), NULLABLE | Owner of speech (null if guest) |
| `text` | `TEXT` | NOT NULL | Synthesized input text |
| `language` | `VARCHAR(20)` | NOT NULL | Language tag (e.g., `en-US`, `hi-IN`) |
| `voice` | `VARCHAR(60)` | NOT NULL | Voice model identifier |
| `speed` | `DOUBLE` | DEFAULT 1.0 | Speaking rate multiplier |
| `pitch` | `DOUBLE` | DEFAULT 1.0 | Voice pitch multiplier |
| `voice_style` | `VARCHAR(50)` | DEFAULT 'Standard' | Style (`Standard`, `Cheerful`, etc.) |
| `audio_url` | `VARCHAR(255)` | NOT NULL | Relative path to MP3 stream |
| `audio_size_bytes` | `BIGINT` | NULLABLE | Size of generated audio payload |
| `character_count` | `INT` | NULLABLE | Total characters in source text |
| `word_count` | `INT` | NULLABLE | Total word count |
| `created_at` | `TIMESTAMP` | NOT NULL | Synthesis generation timestamp |

---

### Table: `favorites`
Stores user-bookmarked voices and favorite generated audio items.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `BIGINT` | PRIMARY KEY, AUTO_INCREMENT | Favorite entry ID |
| `user_id` | `BIGINT` | FOREIGN KEY (`users.id`), NOT NULL | Owner user reference |
| `target_type` | `VARCHAR(30)` | NOT NULL | `VOICE` or `SPEECH` |
| `reference_id` | `VARCHAR(100)` | NOT NULL | Voice ID or speech history ID |
| `title` | `VARCHAR(255)` | NOT NULL | Friendly bookmark title |
| `metadata_json` | `TEXT` | NULLABLE | JSON payload with voice/audio details |
| `created_at` | `TIMESTAMP` | NOT NULL | Timestamp bookmark created |

---

## 3. Switching to PostgreSQL (Production Setup)

To use PostgreSQL instead of the default H2 database:

1. In `application.properties` (or via environment variables):
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/ttsdb
spring.datasource.username=postgres
spring.datasource.password=your_db_password
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update
```
2. Or pass standard environment variables:
```bash
SPRING_DATASOURCE_URL=jdbc:postgresql://your-db-host:5432/ttsdb
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=your_password
```
