# AngularModulith

A **feature‑modular Angular application** designed to pair with the **SpringFirstModulith** backend (session‑based auth + multi‑datasource _view_ routing).

This repository demonstrates a **frontend modulith** approach: strong boundaries between **core infrastructure**, **shared primitives**, **layout**, and **feature modules**, with **lazy loading at the route level**.

The goal mirrors the backend philosophy: **scale by structure, not by fragmentation**.

---

## 📖 Table of Contents

- [📌 Project Overview](#-project-overview)
- [✨ Features](#-features)
  - [🔐 Auth & Security](#-auth--security)
  - [🧩 Frontend Modulith Structure](#-frontend-modulith-structure)
  - [🧪 Testing](#-testing)
- [🗂️ Project Structure](#️-project-structure)
- [🛠️ Tech Stack](#️-tech-stack)
- [⚙️ Configuration](#️-configuration)
  - [Proxy to Backend (Dev)](#proxy-to-backend-dev)
  - [Nginx Reverse Proxy (Docker)](#nginx-reverse-proxy-docker)
- [🚀 Getting Started](#-getting-started)
- [🐳 Docker Setup](#-docker-setup)
- [📡 Backend Contract](#-backend-contract)
- [🧭 Adding a New Feature Module](#-adding-a-new-feature-module)
- [👤 Author](#-author)

---

## 📌 Project Overview

**AngularModulith** is an **Angular 21** application structured around **feature‑level bounded contexts**.

High‑level layering:

- **core** → cross‑cutting infrastructure (auth, guards, interceptors, error handling)
- **shared** → pure, domain‑agnostic primitives (DTOs, helpers)
- **layout** → reusable UI shell and components
- **features** → the _only_ place where business pages and routes live

This prevents:

- a single growing `app.module.ts`
- feature‑to‑feature coupling
- security rules leaking into UI code

---

## ✨ Features

### 🔐 Auth & Security

- **Session‑based authentication** (cookies, not JWT)
- CSRF bootstrap via backend cookie endpoint
- Route protection via guards:
  - `authGuard` → authenticated access
  - `authorityGuard('MODULE_X')` → module/permission access
- Authority‑aware UI rendering via `HasAuthorityDirective`

Expected backend endpoints:

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET  /api/auth/me`
- `GET  /api/auth/csrf`

Login supports backend datasource routing:

```ts
export interface LoginRequest {
  username: string;
  password: string;
  dataSource: 'prod' | 'historic';
}
```

This maps directly to the **prod / historic datasource routing** in SpringFirstModulith.

---

### 🧩 Frontend Modulith Structure

- Feature modules are **lazy loaded**
- Guards are applied at the **routing boundary**
- Features do not import other features
- UI primitives live in `layout/components`, not in features

This keeps features thin, replaceable, and independently evolvable.

---

### 🧪 Testing

- **Unit tests**: Vitest + JSDOM
- **E2E tests**: Playwright
- Test setup mirrors real session‑based auth behavior

---

## 🗂️ Project Structure

```
src/app
├── core
│   ├── auth
│   │   ├── directives
│   │   ├── guards
│   │   ├── interceptors
│   │   └── auth.service.ts
│   └── errors
│       ├── api-error.model.ts
│       └── app-error.model.ts
│
├── shared
│   └── keyset-page.dto.ts
│
├── layout
│   └── components
│       ├── main
│       |   ├── footer.cmponent.ts
│       |   ├── header.component.ts
│       |   └── main-layout.component.ts
│       ├── button.component.ts
│       ├── card.component.ts
│       ├── input.component.ts
│       ├── page.component.ts
│       └── ui-nav-link.component.ts
│
└── features
    ├── index
    ├── login
    └── users
        ├── data-access
        ├── models
        ├── pages
        └── users.routes.ts
```

Routing entry point: `src/app/app.routes.ts`

- Public route: `/login`
- Authenticated shell: `MainLayoutComponent`
- Lazy features mounted under the shell

---

## 🛠️ Tech Stack

| Tech           | Purpose                     |
| -------------- | --------------------------- |
| Angular 21     | App framework               |
| Angular Router | Routing + lazy loading      |
| RxJS           | Reactive state + HTTP flows |
| Vitest + JSDOM | Unit testing                |
| Playwright     | End-to-end testing          |
| TailwindCSS    | Styling                     |
| TypeScript     | Language                    |
| Nginx          | Production reverse proxy    |

---

## ⚙️ Configuration

### Proxy to Backend (Dev)

In development, the Angular dev server proxies API calls.

`proxy.conf.json`:

```json
{
  "/api/": {
    "target": "http://localhost:7070/api/",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug",
    "pathRewrite": { "^/api/": "" }
  }
}
```

This avoids CORS and keeps frontend code backend‑agnostic.

---

### Nginx Reverse Proxy (Docker)

In Docker, API routing is handled by **Nginx**, not Angular.

`nginx.conf`:

```nginx
server {
  listen 80;

  root /usr/share/nginx/html;
  index index.html;

  location /api/ {
    proxy_pass http://backend:7070/api/;
    proxy_http_version 1.1;

    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

This setup:

- Preserves session cookies
- Supports CSRF
- Works behind reverse proxies

---

## 🚀 Getting Started

### Prerequisites

- Node.js + npm
- Running **SpringFirstModulith** backend on `http://localhost:7070`

### Install

```bash
npm install
```

### Run (Dev)

```bash
npm start
```

Frontend:

- http://localhost:4200

---

## 🐳 Docker Setup

This repository includes Docker Compose files for production‑like runs.

Relevant files:

```
docker/modulithApp/
├── docker-compose.yml
├── docker-compose.dev.yml
└── 01-create-historic-db.sql
```

### docker-compose.yml

```yaml
services:
  db:
    image: postgres:17
    environment:
      POSTGRES_DB: SpringFirstModulithDB
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: Sb202582
    ports:
      - '5432:5432'
    volumes:
      - db_data:/var/lib/postgresql/data
      - ./01-create-historic-db.sql:/docker-entrypoint-initdb.d/01-create-historic-db.sql:ro

  backend:
    #image: ghcr.io/dossantosh/springfirstmodulith:main
    image: ghcr.io/dossantosh/springfirstmodulith:flywayImplementation
    environment:
      #SPRING_SESSION_JDBC_INITIALIZE_SCHEMA: never
      DB_HOST: db
      DB_PORT: 5432
      DB_NAME: SpringFirstModulithDB
      DB_HIST_NAME: SpringFirstModulithDBHistoric
      DB_USER: postgres
      DB_PASSWORD: Sb202582
  SERVER_PORT: 7070
    ports:
      - '7070:7070'
    depends_on:
      - db

  frontend:
    image: ghcr.io/dossantosh/angularmodulith:main
    #image: ghcr.io/dossantosh/angularmodulith:Database-Runtime-Routing
    ports:
      - '4200:80'
    depends_on:
      - backend

volumes:
  db_data:
```

### docker-compose.dev.yml

```yaml
services:
  backend:
    build:
      context: ../../SpringFirstModulith
    image: springfirstmodulith:dev

  frontend:
    build:
      context: ../../AngularModulith
    image: angularmodulith:dev
```

### Init script for historic DB

**docker/initdb/01-create-historic-db.sql**

```sql
-- Create historic DB (only if it doesn't exist)
SELECT 'CREATE DATABASE "SpringFirstModulithDBHistoric"'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'SpringFirstModulithDBHistoric')\gexec
```

Run everything:

```sh
docker compose up --build
```

Run in dev

```sh
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
```

Stop containers:

```sh
docker compose down
```

Reset volumes:

```sh
docker compose down -v
```

- Nginx serves Angular
- Backend is reverse‑proxied under `/api`
- Sessions and CSRF work end‑to‑end

---

## 📡 Backend Contract

This frontend assumes the backend:

- Uses **Spring Session (JDBC)**
- Relies on **cookies**, not JWT
- Exposes APIs under `/api`
- Supports CSRF bootstrap
- Returns authorities from `/api/auth/me`

Without the backend running, protected routes will return `401`.

---

## 🧭 Adding a New Feature Module

1️⃣ Create a feature folder:

```
src/app/features/<feature-name>/
```

2️⃣ Add routes:

```
<feature-name>.routes.ts
```

3️⃣ Lazy‑load in `app.routes.ts`:

```ts
{
  path: 'my-feature',
  loadChildren: () =>
    import('./features/my-feature/my-feature.routes')
      .then(m => m.MY_FEATURE_ROUTES),
}
```

4️⃣ Protect if needed:

```ts
canActivate: [authorityGuard('MODULE_SOMETHING')];
```

This enforces **explicit dependencies and clean boundaries**.

---

## 👤 Author

Sebastián Dos Santos
