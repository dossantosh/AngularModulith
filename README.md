# AngularModulith

AngularModulith is an Angular 21 frontend for the SpringFirstModulith backend. The app uses a lightweight modulith structure: code is grouped by domain, shared UI primitives stay domain-agnostic, and route-level boundaries keep features isolated without extra architectural layers.

## Tech Stack

- Angular 21 with standalone components
- Angular Router with lazy routes
- RxJS and Angular signals
- Vitest + JSDOM for unit tests
- Playwright for E2E tests
- TailwindCSS for app styling
- Angular Material available for isolated Material-based UI where it is useful

## Project Structure

```text
src/app
|-- app.config.ts
|-- app.routes.ts
|-- domains
|   |-- auth
|   |   |-- application
|   |   |-- data-access
|   |   |-- directives
|   |   |-- domain
|   |   |-- feature-forbidden
|   |   |-- feature-login
|   |   |-- routing
|   |   `-- state
|   |-- dashboard
|   |-- shell
|   `-- users
`-- shared
    `-- ui
```

The intended dependency direction is:

```text
feature/page -> application facade -> data-access
feature/page -> domain constants/models
shell -> auth facade
shared/ui -> no domain dependencies
```

Avoid adding facades, stores, use-cases, factories, or adapters by default. Add a layer only when it removes real complexity from more than one place.

## Auth And Authorization

The app uses session-based authentication with cookies. The backend remains the security authority. The frontend only uses backend-calculated scopes and capabilities to improve UX by hiding routes, menus, buttons, and actions.

Expected backend endpoints:

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/auth/csrf`

Known frontend scopes live in:

```text
src/app/domains/auth/domain/auth-scopes.ts
```

Use `AuthFacade` for permission checks:

```ts
auth.hasScope('users:read');
auth.hasAnyScope(['users:create', 'users:update']);
auth.hasAllScopes(['users:read']);
auth.can('users', 'read');
```

Protect routes with `scopeGuard` and route data:

```ts
{
  path: 'users',
  canActivate: [scopeGuard],
  data: { requiredScopes: [AUTH_SCOPES.users.read] },
}
```

Hide UI with the structural directive:

```html
<button *appHasScope="scopes.users.create">Crear usuario</button>
```

## Adding A Domain

1. Create `src/app/domains/<domain-name>/`.
2. Add `feature-*` pages/components for route-level UI.
3. Add `data-access` only for HTTP or persistence adapters.
4. Add an `application` facade only when the page needs orchestration or state.
5. Add domain constants/models in `domain` when they are shared inside that domain.
6. Lazy-load the domain from `src/app/app.routes.ts` when it has child routes.
7. Keep reusable, domain-agnostic UI in `src/app/shared/ui`.

## Commands

```bash
npm install
npm start
npm run test:run
npm run lint
npm run build
```

## Backend Contract

`GET /api/auth/me` should return the authenticated user, selected datasource, roles if needed for display/admin screens, effective scopes, and semantic capabilities. Roles and technical authorities are not used by the frontend for authorization decisions.

When adding a new permission:

1. Add and enforce the backend scope first.
2. Expose the effective scope and derived capability through `/api/auth/me`.
3. Mirror the stable frontend scope in `AUTH_SCOPES`.
4. Use `scopeGuard`, `appHasScope`, or `AuthFacade` checks only for UX visibility.

## Docker Notes

The production image is expected to be served behind Nginx with `/api` proxied to the backend. Sessions and CSRF depend on the browser receiving and sending the backend cookies correctly.

## Author

Sebastian Dos Santos
