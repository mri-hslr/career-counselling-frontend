# project_context.md
# AI Career Counselling Platform — Master Architecture Context
 
> **Purpose:** This file serves as the single source of truth for system design, API documentation,
> architecture diagrams, sequence diagrams, deployment docs, and user guides.
> Generated from: project structure, ERD, requirements, and data flow specifications.
 
---
 
## 1. Project Overview
 
| Field | Detail |
|---|---|
| **Project Name** | AI Career Counselling Platform |
| **Domain** | EdTech / AI-assisted Career Guidance |
| **Target Users** | Students in Classes 6–12 (ages ~11–18), their Mentors, and Parents |
| **Deployment Model** | Dockerised FastAPI backend on VPS; separate frontend repository |
| **Backend Repo** | https://github.com/mri-hslr/career-counselling-backend |
| **Frontend Repo** | https://github.com/mri-hslr/career-counselling-frontend |
 
### Goal
 
A full-stack, AI-powered career counselling platform that:
 
- Guides students through structured psychometric assessments (aptitude, personality, EQ, career orientation, career interest)
- Generates AI-driven career discovery reports, top-5 career recommendations, and personalised roadmaps via LLM
- Uses RAG (Retrieval-Augmented Generation) over pgvector to ground LLM outputs in contextually relevant career data
- Connects students with domain-expert mentors for real-time chat (WebSocket), video sessions (Dyte API), and structured feedback
- Enables parents to monitor student roadmap progress and submit feedback that feeds back into roadmap regeneration
- Creates a closed feedback loop: student data → AI output → mentor/parent feedback → refined AI output
---
 
## 2. Actors & Roles
 
### 2.1 Role Definitions
 
| Role | Description | Primary Actions |
|---|---|---|
| **Student** | Core user; Classes 6–12 | Complete assessments → receive AI reports → follow roadmap → chat/session with mentors → generate parent code |
| **Mentor** | Domain expert / career professional | Accept student requests → chat → schedule sessions → submit structured feedback |
| **Parent** | Guardian/progress supervisor | Connect via student-generated code → track roadmap → submit feedback |
| **System (AI Agent)** | Automated LLM pipeline | Generate reports, recommendations, roadmaps; regenerate roadmaps on feedback trigger |
 
### 2.2 Relationship Map
 
```
Student ──(request)──► Mentor
Student ──(generates code)──► Parent
Mentor ──(feedback)──► System (triggers roadmap regen)
Parent ──(feedback)──► System (triggers roadmap regen)
System ──(AI output)──► Student
```
 
### 2.3 Role Boundaries
 
- Parents **cannot** interact directly with mentors; visibility is scoped to student-facing data only.
- Mentors **cannot** view raw parent feedback; feedback is aggregated by the backend before influencing roadmap regeneration.
- Students **own** all cross-role relationship initiation: mentor connection requests and parent code generation.
- The `parent_student_links` table (ERD) enforces the one-to-many parent↔student relationship with unique codes.
---
 
## 3. Functional Requirements
 
### 3.1 Student Features
 
| # | Feature | Notes |
|---|---|---|
| S1 | Register / Login | JWT-secured; bcrypt password hashing |
| S2 | Create & update profile | Stored across `users`, `academic_profiles`, `lifestyle_profiles`, `financial_profiles` |
| S3 | Submit academic, lifestyle, finance, interest data | Multi-table relational storage |
| S4 | Attempt psychometric tests | Five test types: aptitude, personality, EQ, career orientation, career interest |
| S5 | Generate AI career discovery report | LLM call with RAG-enriched prompt; stored in `career_discovery_reports` |
| S6 | Generate top-5 career recommendations | Derived from report + vector similarity; stored in `career_discovery_profiles` |
| S7 | Select preferred career | Persisted as user preference; input for roadmap generation |
| S8 | Generate personalised roadmap | LLM call; stored in `roadmaps` + `roadmap_phases` |
| S9 | Track roadmap progress | Phase-level progress tracked in `roadmap_phases` |
| S10 | Connect with mentors | Request stored in `mentees`; mentor accept/reject |
| S11 | Chat with mentors | WebSocket-based; persisted in `chat_messages` |
| S12 | Join mentor sessions | Dyte API room; attendance tracked in `session_attendance` |
| S13 | Generate parent connection code | Unique code stored in `users`; used by parent to link |
 
### 3.2 Mentor Features
 
| # | Feature | Notes |
|---|---|---|
| M1 | Register / Login | Role-flagged JWT |
| M2 | Create mentor profile | Stored in `mentors`; includes expertise, bio |
| M3 | Accept / Reject student requests | Updates `mentees` relationship record |
| M4 | Chat with students | WebSocket; persisted in `chat_messages` |
| M5 | Schedule mentoring sessions | Stored in `mentor_availability`; session records created |
| M6 | Submit mentor feedback | Stored in `mentor_feedback`; triggers potential roadmap regen |
 
### 3.3 Parent Features
 
| # | Feature | Notes |
|---|---|---|
| P1 | Connect with student via unique code | Validates code; creates `parent_student_links` record |
| P2 | Track roadmap progress | Read-only view of `roadmaps` + `roadmap_phases` |
| P3 | Submit feedback | Stored in `parent_feedback`; used in roadmap regeneration prompt |
| P4 | View student progress analytics | Derived from `student_insights`, roadmap phase completion data |
 
### 3.4 AI System Features
 
| # | Feature | Trigger |
|---|---|---|
| A1 | Career discovery report generation | Student completes all psychometric tests |
| A2 | Career recommendation generation | Post-report; top-5 ranked by LLM + vector similarity |
| A3 | Personalised roadmap generation | Student selects a preferred career |
| A4 | Roadmap regeneration | Mentor or parent submits feedback post-roadmap |
| A5 | RAG-based contextual retrieval | Every LLM call; embeddings queried from pgvector (`langchain_pg_embedding`) |
 
---
 
## 4. Non-Functional Requirements
 
| Category | Requirement | Rationale |
|---|---|---|
| **Security** | JWT expiry + bcrypt hashing | Stateless auth; secure password storage |
| **Security** | Role-based access control | Prevents cross-role data leakage |
| **Performance** | pgvector for semantic retrieval | Avoids external vector DB; co-located with relational data |
| **Performance** | CPU-optimised torch | `--extra-index-url pytorch whl/cpu` avoids GPU overhead on VPS |
| **Reliability** | PostgreSQL ACID transactions | Psychometric responses, roadmap progress, and relationships need strong consistency |
| **Scalability** | Docker + docker-compose | Allows horizontal replication or service split in future |
| **Scalability** | LLM via external API (DeepSeek/Groq) | Offloads inference compute; no on-prem GPU required |
| **Maintainability** | SQLAlchemy ORM | Schema changes manageable without raw SQL everywhere |
| **Observability** | `dbcheck.py`, `test.py` scripts | Manual health-check tooling (no APM stack confirmed) |
| **Latency** | WebSocket for chat | Avoids HTTP polling overhead for real-time messaging |
| **Compliance** | Student data sensitivity | _Assumption:_ Data handling should comply with applicable regional student privacy laws (e.g., DPDP Act, India) |
 
---
 
## 5. System Workflows
 
### 5.1 Student Onboarding & Assessment Workflow
 
```
Register → Login → Create Profile (academic/lifestyle/finance/interest)
  → Attempt Psychometric Tests (5 types)
    → aptitude → personality → EQ → career orientation → career interest
  → All tests complete?
    YES → Trigger AI Pipeline (A1 → A2)
    NO  → Resume later (responses persisted per-test)
```
 
### 5.2 AI Career Discovery Workflow
 
```
[Backend receives "generate report" trigger]
  1. Fetch student profile data from PostgreSQL
  2. Fetch psychometric responses from PostgreSQL
  3. Generate embedding from student data via sentence-transformers
  4. Query pgvector (langchain_pg_embedding) for top-k similar career contexts
  5. Construct structured prompt: profile + test results + retrieved contexts
  6. Send prompt to DeepSeek/Groq LLM via LangChain
  7. Parse LLM response → career discovery report
  8. Store report in `career_discovery_reports`
  9. Extract top-5 career recommendations → store in `career_discovery_profiles`
```
 
### 5.3 Roadmap Generation Workflow
 
```
Student selects preferred career
  → Backend fetches career details + student profile
  → RAG retrieval for career-specific roadmap contexts
  → Structured prompt sent to LLM
  → LLM returns phase-based roadmap
  → Store roadmap in `roadmaps`
  → Store individual phases in `roadmap_phases`
  → Student tracks phase completion over time
```
 
### 5.4 Roadmap Regeneration Workflow (Feedback Loop)
 
```
Mentor submits feedback → stored in `mentor_feedback`
Parent submits feedback → stored in `parent_feedback`
  → Backend aggregates both feedback records
  → Re-queries RAG for updated contexts
  → Constructs regeneration prompt: original roadmap + feedback summary + new contexts
  → LLM generates revised roadmap
  → Overwrites or versions existing roadmap in `roadmaps` + `roadmap_phases`
```
 
### 5.5 Mentor Connection Workflow
 
```
Student sends mentor request → `mentees` record created (status: pending)
Mentor views pending requests → accepts or rejects
  ACCEPT → `mentees.status` = accepted → chat + session access unlocked
  REJECT → `mentees.status` = rejected → student notified
```
 
### 5.6 Parent Linking Workflow
 
```
Student generates unique parent code → stored in `users.parent_code` (assumption on column name)
Parent registers/logs in → enters code
  → Backend validates code → creates `parent_student_links` record
  → Parent gains read access to student's roadmap + progress analytics
```
 
### 5.7 Real-Time Chat Workflow
 
```
Student/Mentor authenticates → WebSocket handshake (ws.py)
  → Message sent → persisted in `chat_messages`
  → Broadcast to recipient via active WebSocket connection
  → If recipient offline → message queued in DB; delivered on reconnect (assumption)
```
 
### 5.8 Mentor Session Workflow
 
```
Mentor sets availability → stored in `mentor_availability`
Student views available slots → books session
  → Session record created
  → Dyte API call → meeting room created → room link returned
  → Both parties join Dyte room
  → Attendance tracked in `session_attendance`
  → Post-session → mentor submits feedback via `mentor_feedback`
```
 
---
 
## 6. Tech Stack Overview
 
### 6.1 Backend
 
| Layer | Technology | Why |
|---|---|---|
| Web Framework | **FastAPI** | Async-first, automatic OpenAPI docs, Pydantic validation, WebSocket support built-in |
| ORM | **SQLAlchemy** | Declarative model definitions; migration-friendly; integrates with pgvector |
| Server | **Uvicorn** (standard) | ASGI server; required for FastAPI async + WebSocket |
| Validation | **Pydantic** + `email-validator` | Request/response schema enforcement; prevents malformed data reaching DB |
| HTTP Client | **httpx** | Async HTTP calls to external APIs (DeepSeek, Groq, Dyte) |
 
### 6.2 Database
 
| Component | Technology | Why |
|---|---|---|
| Primary DB | **PostgreSQL** | ACID compliance for relational student/mentor/roadmap data |
| Vector Extension | **pgvector** | Stores and queries embeddings within the same Postgres instance; avoids external vector DB |
| Driver | **psycopg2-binary** | SQLAlchemy-compatible Postgres adapter |
 
### 6.3 AI Stack
 
| Component | Technology | Why |
|---|---|---|
| LLM Orchestration | **LangChain** (`langchain-core`, `langchain-community`, `langchain-openai`) | Abstracts prompt chaining, RAG pipelines, LLM provider switching |
| Embedding Model | **sentence-transformers** via `langchain-huggingface` | Local CPU-based embedding; no external embedding API cost |
| Inference Runtime | **PyTorch (CPU)** | Required by sentence-transformers; CPU wheel used to avoid GPU dependency |
| LLM Provider 1 | **DeepSeek API** | Primary or fallback LLM for report/roadmap generation |
| LLM Provider 2 | **Groq API** | Fast inference alternative; switchable via LangChain abstraction |
 
### 6.4 Authentication & Security
 
| Component | Technology | Why |
|---|---|---|
| Token Auth | **JWT** (`python-jose[cryptography]`) | Stateless; scalable; encodes role claims |
| Password Hashing | **bcrypt** | Industry-standard adaptive hashing; resistant to brute force |
 
### 6.5 Realtime & Video
 
| Component | Technology | Why |
|---|---|---|
| Chat | **FastAPI WebSockets** (`websockets` lib) | Native ASGI WebSocket; no additional broker needed at current scale |
| Video Sessions | **Dyte API** | Managed WebRTC; avoids building video infrastructure |
 
### 6.6 Deployment
 
| Component | Technology | Why |
|---|---|---|
| Containerisation | **Docker** | Environment consistency; reproducible builds |
| Orchestration | **docker-compose** | Multi-service local + VPS deployment (backend + postgres at minimum) |
| Hosting | **VPS** | Direct control; cost-effective for early stage |
 
---
 
## 7. Authentication Flow
 
```
POST /auth/register
  → Validate input (Pydantic)
  → Hash password with bcrypt
  → Store user in `users` table with role flag (student/mentor/parent)
  → Return JWT token
 
POST /auth/login
  → Fetch user by email
  → Verify bcrypt hash
  → Generate JWT: { user_id, role, exp }
  → Return JWT
 
Protected Endpoint Request:
  → Extract Bearer token from Authorization header
  → Decode JWT via python-jose (core/security.py)
  → Validate exp, signature
  → Inject user context into route handler
  → Role-based access enforced at route level
```
 
**Key design decisions:**
- `core/security.py` centralises token creation and verification
- Role is encoded in the JWT payload to avoid a DB lookup on every request
- No refresh token mechanism confirmed; _recommendation:_ add refresh tokens for production
---
 
## 8. AI & RAG Pipeline
 
### 8.1 Pipeline Architecture
 
```
┌─────────────────────────────────────────────────────────────┐
│                    AI PIPELINE (core/vector_db.py)          │
│                                                             │
│  Student Data ──► Embedding Model ──► pgvector store        │
│  (profile +        (sentence-          (langchain_pg_       │
│   test results)     transformers)       embedding table)    │
│                                              │              │
│                                         Similarity          │
│                                          Search             │
│                                              │              │
│  Student Data + Retrieved Contexts ──► Prompt Builder       │
│                                              │              │
│                                         LangChain           │
│                                         Chain               │
│                                              │              │
│                                    DeepSeek / Groq API      │
│                                              │              │
│                              Parsed Response (Report /      │
│                               Recommendations / Roadmap)    │
│                                              │              │
│                                         PostgreSQL          │
└─────────────────────────────────────────────────────────────┘
```
 
### 8.2 Embedding Generation
 
- **Model:** `sentence-transformers` (specific model: _assumption_ — likely `all-MiniLM-L6-v2` or similar)
- **Trigger:** When student submits psychometric data OR when career content is bulk-uploaded (`scripts/bulk_upload.py`)
- **Storage:** `langchain_pg_embedding` table (managed by `langchain-community` PGVector integration)
- **Managed by:** `core/vector_db.py`
### 8.3 RAG Retrieval
 
- Query vector = embedding of current student's profile/test summary
- Similarity search against `langchain_pg_embedding` returns top-k career/context documents
- Retrieved documents injected into LangChain prompt template as context
- WHY pgvector over Pinecone/Weaviate: co-location with relational DB eliminates network hop; simpler ops on VPS
### 8.4 LLM Prompt Structure (inferred)
 
```
SYSTEM: You are a career counselling expert...
CONTEXT: [RAG-retrieved career documents]
STUDENT PROFILE:
  - Academic: [data from academic_profiles]
  - Lifestyle: [data from lifestyle_profiles]
  - Financial: [data from financial_profiles]
  - Psychometric Scores: [aggregated from test results]
TASK: Generate [report | top-5 recommendations | roadmap]
OUTPUT FORMAT: [structured JSON or markdown]
```
 
### 8.5 LLM Provider Strategy
 
- LangChain abstraction layer allows switching between DeepSeek and Groq without changing business logic
- `langchain-openai` package used likely because DeepSeek exposes an OpenAI-compatible API endpoint
- Groq provides ultra-low latency inference; suitable for roadmap generation where speed matters
### 8.6 Feedback-Driven Regeneration
 
```
Existing roadmap + mentor_feedback + parent_feedback
  → Aggregated into regeneration prompt
  → RAG re-queried with updated student context
  → LLM generates revised roadmap
  → New roadmap overwrites or versions previous in DB
```
 
_Recommendation:_ Version roadmaps (add `version` integer column) to allow history tracking.
 
---
 
## 9. Database Overview
 
### 9.1 Core Table Groups (from ERD)
 
#### Users & Auth
| Table | Purpose |
|---|---|
| `users` | Central user record; email, password hash, role, parent_code |
 
#### Student Profile Data
| Table | Purpose |
|---|---|
| `academic_profiles` | Academic scores, subjects, learning style |
| `lifestyle_profiles` | Study hours, hobbies, daily routine, consistency |
| `financial_profiles` | Financial background; influences career path feasibility |
| `aspiration_profiles` | Career aspirations, preferred environments |
 
#### Psychometric Assessment
| Table | Purpose |
|---|---|
| `psychometric_profiles` | Aggregated scores per test type per student |
| `psychometric_questions` | Question bank (general) |
| `personality_question_bank` | Personality-specific questions |
| `career_interest` | Career interest test responses |
| `career_strength` | Strength identification responses |
| `personality_strength` | Personality dimension scores |
| `results` | Per-question answers; links user to question + response |
| `coaching_tasks` | Task-level items (assumption: post-assessment tasks) |
| `coaching_tools` | Tools/resources mapped to coaching tasks |
| `user_skills` | Skills identified through assessment |
 
#### AI Outputs
| Table | Purpose |
|---|---|
| `career_discovery_reports` | Full LLM-generated career discovery report |
| `career_discovery_profiles` | Top-5 career recommendations with scores |
| `roadmaps` | Master roadmap record per student per career |
| `roadmap_phases` | Individual phase records; completion tracked here |
| `student_insights` | AI-derived insights about student profile |
| `langchain_pg_embedding` | pgvector table; stores document embeddings for RAG |
 
#### Mentorship
| Table | Purpose |
|---|---|
| `mentors` | Mentor profile; expertise, bio, availability flag |
| `mentees` | Student-mentor relationship; status (pending/accepted/rejected) |
| `mentor_availability` | Time slots set by mentor |
| `session_attendance` | Records session join/completion per student |
| `mentor_feedback` | Structured feedback submitted by mentor post-session |
| `student_feedback` | Student feedback on sessions |
| `chat_messages` | Persisted chat messages between student and mentor |
 
#### Parent Linkage
| Table | Purpose |
|---|---|
| `parent_student_links` | Maps parent user to student via unique code |
| `parent_feedback` | Feedback submitted by parent; used in roadmap regen |
 
#### Free-Time & Lifestyle
| Table | Purpose |
|---|---|
| `free_time_activity` | Student free-time activities; input to lifestyle profiling |
| `reading_collections` | Books/resources read; informs interest profiling |
 
### 9.2 Key Relationships
 
```
users ──1:1──► academic_profiles
users ──1:1──► lifestyle_profiles
users ──1:1──► financial_profiles
users ──1:1──► aspiration_profiles
users ──1:1──► psychometric_profiles
users ──1:N──► results
users ──1:N──► roadmaps
users ──1:N──► mentees (as student)
users ──1:N──► mentees (as mentor, via mentors table)
users ──1:N──► chat_messages
users ──1:N──► parent_student_links (as parent)
users ──1:1──► career_discovery_reports
roadmaps ──1:N──► roadmap_phases
mentees ──1:N──► session_attendance
mentees ──1:N──► mentor_feedback
```
 
### 9.3 pgvector Integration
 
- Extension: `pgvector` enabled on PostgreSQL instance
- Table: `langchain_pg_embedding` (auto-managed by LangChain's `PGVector` store)
- Index: HNSW or IVFFlat (recommendation: HNSW for better recall at query time)
- Query type: Cosine similarity search for top-k document retrieval
---
 
## 10. API Architecture Overview
 
### 10.1 Structure
 
```
main.py                    → FastAPI app entry; router registration; CORS; startup events
router/
  psychometrics.py         → Psychometric test endpoints
schemas/
  user.py                  → User request/response models
  assessments.py           → Test submission models
  ai.py                    → AI generation request/response models
  compass.py               → Roadmap + career compass schemas
  reports.py               → Report response schemas
models/
  users.py                 → SQLAlchemy User model
  assessments.py           → SQLAlchemy Assessment models
  careers.py               → SQLAlchemy Career models
  roadmaps.py              → SQLAlchemy Roadmap + Phase models
  mentorship.py            → SQLAlchemy Mentor/Mentee models
  compass.py               → SQLAlchemy Compass/Insight models
core/
  database.py              → DB session factory; engine config
  security.py              → JWT encode/decode; bcrypt wrappers
  vector_db.py             → PGVector store initialisation; embedding functions
```
 
### 10.2 Inferred API Route Groups
 
| Group | Prefix | Key Endpoints |
|---|---|---|
| Auth | `/auth` | `POST /register`, `POST /login` |
| Student Profile | `/profile` | `POST /academic`, `POST /lifestyle`, `POST /financial`, `POST /aspiration` |
| Assessments | `/assessments` | `GET /questions/{type}`, `POST /submit/{type}`, `GET /results/{user_id}` |
| AI Generation | `/ai` | `POST /report/generate`, `POST /careers/recommend`, `POST /roadmap/generate`, `POST /roadmap/regenerate` |
| Roadmap | `/roadmap` | `GET /{roadmap_id}`, `PATCH /phase/{phase_id}/complete` |
| Mentorship | `/mentor` | `GET /list`, `POST /request`, `PATCH /request/{id}/status`, `GET /sessions` |
| Chat | `/chat` | `GET /history/{mentee_id}` (REST); real-time via WebSocket |
| Sessions | `/sessions` | `GET /availability/{mentor_id}`, `POST /book`, `POST /feedback` |
| Parent | `/parent` | `POST /connect`, `GET /progress/{student_id}`, `POST /feedback` |
| WebSocket | `/ws` | `WS /ws/{user_id}` (ws.py) |
 
### 10.3 Design Patterns
 
- **Pydantic schemas** separate from **SQLAlchemy models** — clean boundary between DB layer and API layer
- **Dependency injection** via FastAPI `Depends()` for DB sessions and current-user extraction
- Single router file confirmed (`router/psychometrics.py`); _assumption:_ other routes defined inline in `main.py` or not yet modularised
_Recommendation:_ Modularise all route groups into `router/` subdirectory as codebase grows.
 
---
 
## 11. Realtime Communication Overview
 
### 11.1 WebSocket Chat (ws.py)
 
```
Client connects: WS /ws/{user_id}
  → Auth token validated on handshake
  → Connection registered in active connection map (in-memory dict)
 
Message sent by Student/Mentor:
  → Received by ws.py handler
  → Persisted to `chat_messages` (PostgreSQL)
  → Target user looked up in connection map
    → Online: message pushed directly
    → Offline: stored in DB; delivered on reconnect
 
Connection closed:
  → Removed from active connection map
```
 
**Limitation:** In-memory connection map does not persist across worker restarts. With multiple Uvicorn workers, WebSocket connections must be pinned to the same worker (sticky sessions) or an external pub/sub (Redis) must be introduced.
 
_Recommendation:_ For production multi-worker deployment, add Redis as a WebSocket message broker.
 
### 11.2 Video Sessions (Dyte API)
 
```
Mentor schedules session → availability stored in `mentor_availability`
Student books session slot
  → Backend calls Dyte API (via httpx) → creates meeting room
  → Returns Dyte meeting link/token to both parties
Both parties open Dyte room in browser/app
Session ends → attendance recorded in `session_attendance`
Post-session → mentor submits feedback form
```
 
- Dyte handles all WebRTC signalling, media servers, and recording
- No self-hosted video infrastructure required
- Backend only manages room creation and attendance tracking
---
 
## 12. Deployment Overview
 
### 12.1 Stack
 
```
VPS (Linux)
  └── Docker Engine
        └── docker-compose.yml
              ├── Service: backend
              │     Image: FastAPI + Uvicorn
              │     Mounts: .env, requirements.txt
              │     Port: 8000
              └── Service: postgres
                    Image: postgres + pgvector
                    Volumes: persistent DB volume
                    Port: 5432 (internal only)
```
 
### 12.2 Startup Sequence
 
```
docker-compose up
  → postgres starts + pgvector extension enabled
  → backend starts → waits for postgres healthcheck
  → init_db.py runs → SQLAlchemy creates tables from models
  → populate.py runs → seeds question banks / career data
  → Uvicorn starts → FastAPI app ready on :8000
```
 
### 12.3 Environment Configuration
 
Managed via `python-dotenv` + `.env` file (not committed to repo):
```
DATABASE_URL=postgresql://...
SECRET_KEY=...
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=...
DEEPSEEK_API_KEY=...
GROQ_API_KEY=...
DYTE_API_KEY=...
DYTE_ORG_ID=...
```
 
### 12.4 Scaling Considerations
 
| Concern | Current State | Recommendation |
|---|---|---|
| Horizontal backend scaling | Single container | Add Nginx reverse proxy + multiple Uvicorn workers |
| WebSocket multi-worker | In-memory map breaks | Add Redis pub/sub |
| DB connection pooling | SQLAlchemy default | Configure `pool_size` + `max_overflow` |
| LLM call latency | Synchronous (assumption) | Make LLM calls async via `httpx` + `asyncio` |
| Static file serving | Not confirmed | Add Nginx or CDN for frontend assets |
 
---
 
## 13. Architecture Overview
 
### 13.1 High-Level System Diagram
 
```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                               │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐     │
│   │   Student UI  │  │  Mentor UI   │  │     Parent UI        │     │
│   └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘     │
└──────────┼─────────────────┼─────────────────────┼─────────────────┘
           │  REST / WS      │  REST / WS           │  REST
           ▼                 ▼                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        FASTAPI BACKEND                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌─────────────┐   │
│  │ Auth Layer │  │ API Routes │  │ WS Handler │  │ AI Pipeline │   │
│  │ (security) │  │ (routers)  │  │  (ws.py)   │  │ (vector_db) │   │
│  └────────────┘  └─────┬──────┘  └─────┬──────┘  └──────┬──────┘   │
└────────────────────────┼───────────────┼─────────────────┼──────────┘
                         │               │                 │
           ┌─────────────▼───────────────▼─────┐     ┌────▼──────────┐
           │         PostgreSQL + pgvector      │     │  External APIs │
           │  ┌─────────────┐  ┌─────────────┐ │     │  ┌──────────┐ │
           │  │  Relational │  │  pgvector   │ │     │  │ DeepSeek │ │
           │  │   Tables    │  │ Embeddings  │ │     │  │  / Groq  │ │
           │  └─────────────┘  └─────────────┘ │     │  ├──────────┤ │
           └────────────────────────────────────┘     │  │   Dyte   │ │
                                                      │  └──────────┘ │
                                                      └───────────────┘
```
 
### 13.2 Data Flow Summary
 
```
[1] Student inputs → REST API → PostgreSQL (relational tables)
[2] Trigger AI → sentence-transformers → pgvector embedding stored
[3] RAG query → pgvector similarity search → top-k docs returned
[4] LangChain prompt = student data + RAG contexts
[5] LangChain → DeepSeek/Groq API → LLM response
[6] Parsed response → stored in PostgreSQL (reports/roadmaps)
[7] Real-time chat → WebSocket → PostgreSQL (chat_messages)
[8] Video → Dyte API → managed WebRTC room
[9] Feedback → PostgreSQL → triggers roadmap regeneration (loop back to step 3)
```
 
---
 
## 14. Core Components
 
| Component | File(s) | Responsibility |
|---|---|---|
| **App Entry** | `main.py` | FastAPI app init, router registration, CORS, startup hooks |
| **DB Engine** | `core/database.py` | SQLAlchemy engine + session factory |
| **Auth** | `core/security.py` | JWT generation/validation, bcrypt hashing |
| **Vector DB** | `core/vector_db.py` | PGVector store init, embedding function, similarity search |
| **Models** | `models/*.py` | SQLAlchemy ORM table definitions (6 files covering all domains) |
| **Schemas** | `schemas/*.py` | Pydantic request/response models for API validation |
| **Routers** | `router/psychometrics.py` | Psychometric test endpoints (likely more routes in main.py) |
| **WebSocket** | `ws.py` | Real-time chat connection management |
| **DB Init** | `init_db.py` | Creates all tables on startup via SQLAlchemy `create_all` |
| **Data Seed** | `populate.py` | Seeds question banks, career data |
| **Scraper** | `scripts/scrape_indiabix.py` | Scrapes aptitude questions from IndiaBix for question bank |
| **Bulk Upload** | `scripts/bulk_upload.py` | Bulk ingests career documents; generates + stores embeddings |
| **Migration** | `vps_migration.sql` | Manual SQL migration script for VPS DB |
 
---
 
## 15. Bottlenecks & Tradeoffs
 
### 15.1 pgvector vs Dedicated Vector DB
 
| | pgvector (current) | Pinecone / Weaviate |
|---|---|---|
| **Ops complexity** | Low — same Postgres instance | High — separate service |
| **Query speed** | Good for < 1M vectors | Better at massive scale |
| **Cost** | No extra cost | Paid tiers |
| **Consistency** | ACID with relational data | Eventual |
| **Verdict** | ✅ Correct choice for current scale | Consider at 1M+ vectors |
 
### 15.2 LLM Latency
 
- Report and roadmap generation are LLM calls that may take 5–30 seconds
- **Risk:** Synchronous HTTP calls will block the request thread
- **Mitigation (recommendation):** Make LLM calls background tasks via FastAPI `BackgroundTasks` or Celery; return a job ID immediately; poll for completion
### 15.3 WebSocket Scalability
 
- In-memory connection map in `ws.py` breaks with multiple Uvicorn workers
- **Risk:** Messages lost when recipient is connected to a different worker
- **Mitigation (recommendation):** Redis Pub/Sub as message broker between workers
### 15.4 CPU-based Embeddings
 
- `sentence-transformers` on CPU is acceptable for low concurrency
- **Risk:** Embedding generation becomes a bottleneck under concurrent AI requests
- **Mitigation:** Cache embeddings aggressively; only regenerate when student profile changes significantly
### 15.5 Single-Container Deployment
 
- docker-compose on one VPS is a single point of failure
- **Risk:** DB and backend on same host; no failover
- **Mitigation (recommendation):** Separate DB to managed Postgres (e.g., Supabase, RDS) for reliability
### 15.6 Question Bank Dependency
 
- `scrape_indiabix.py` indicates aptitude questions are scraped from IndiaBix
- **Risk:** External site structure changes break the scraper; potential ToS/copyright issue
- **Mitigation (recommendation):** Build or license a proprietary question bank
### 15.7 LLM Provider Lock-in
 
- LangChain abstraction partially mitigates this
- Both DeepSeek and Groq are used — provider redundancy exists at design level
- **Recommendation:** Implement a provider fallback chain in `core/vector_db.py` or a dedicated `llm_client.py`
---
 
## 16. Final Architecture Summary
 
The AI Career Counselling Platform is a **monolithic FastAPI backend** with a clear internal separation of concerns across auth, ORM models, Pydantic schemas, AI pipeline, and real-time communication.
 
### Architectural Pillars
 
1. **Relational-first storage:** PostgreSQL handles all transactional data with strong consistency — assessments, roadmaps, mentorship relationships, feedback. This is the correct choice for a domain where data integrity (student progress, mentor agreements) is critical.
2. **Co-located vector search:** pgvector extends PostgreSQL to handle semantic retrieval without a separate vector database. This keeps the infrastructure minimal and the data model unified — a practical tradeoff that scales well to tens of thousands of students.
3. **LangChain-orchestrated RAG:** The AI pipeline is not a raw LLM call — it is a structured RAG pipeline where student-specific context is retrieved from pgvector, combined with structured profile data, and sent as an enriched prompt to the LLM. This grounds LLM outputs in domain-specific data and reduces hallucination.
4. **Dual LLM provider strategy:** DeepSeek and Groq are both integrated via LangChain's provider abstraction. This enables cost/latency optimisation and provides a fallback path without refactoring business logic.
5. **Closed feedback loop:** The system is designed for iterative improvement. Mentor and parent feedback are not passive records — they are structured inputs to roadmap regeneration, making the platform genuinely adaptive to each student's real-world constraints.
6. **Real-time via WebSocket, video via Dyte:** Chat is handled natively by FastAPI WebSockets (appropriate for current scale). Video conferencing is fully delegated to Dyte API, avoiding the operational burden of WebRTC infrastructure.
7. **Docker-compose VPS deployment:** Simple, reproducible, cost-effective for an early-stage product. The architecture does not over-engineer deployment — Kubernetes or managed container platforms can be introduced as user scale demands it.
### What to Build Next (Prioritised Recommendations)
 
| Priority | Recommendation | Reason |
|---|---|---|
| High | Async LLM calls with job polling | Prevents request timeouts on AI generation |
| High | Modularise all routes into `router/` | Maintainability as team grows |
| Medium | Redis for WebSocket broker | Required before multi-worker deployment |
| Medium | Roadmap versioning (version column) | Enables history tracking and rollback |
| Medium | Refresh token support | Required for production-grade auth |
| Low | APM / logging (e.g., Sentry, structlog) | Observability currently manual |
| Low | Migrate DB to managed Postgres | Eliminates DB as single point of failure |
 
---
 
*Document generated from: project structure, ERD schema, requirements specification, and tech stack analysis.*
*Sections marked (assumption) are inferred from available data and should be verified against actual implementation.*
