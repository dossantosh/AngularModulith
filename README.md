# AngularModulith

Frontend Angular 21 para un ERP modular. La arquitectura prioriza escalabilidad real de frontend: dominios por feature, estado localizado, componentes reutilizables cuando reducen repeticion y una UI enterprise consistente.

## Stack

- Angular 21 con standalone components.
- Angular Router con rutas lazy por dominio cuando aplica.
- Angular Signals para estado de UI/facades.
- RxJS para flujos async, formularios y HTTP.
- Angular Material para componentes funcionales y accesibles.
- Tailwind CSS para layout, spacing, responsive y composicion externa.
- Design tokens propios en `src/styles.scss` como fuente visual comun.
- Vitest + JSDOM para unit tests.
- Playwright configurado para E2E.

## Estructura actual

```text
src/app
|-- app.config.ts
|-- app.routes.ts
|-- core
|   |-- auth
|   |   |-- api
|   |   |-- bootstrap
|   |   |-- guards
|   |   |-- http
|   |   |-- permissions
|   |   `-- session
|   |-- layout
|   `-- theme
|-- domains
|   |-- auth
|   |   |-- feature-forbidden
|   |   `-- feature-login
|   |-- dashboard
|   |   `-- feature-home
|   `-- users
|       |-- application
|       |-- data-access
|       |-- features
|       |   `-- search
|       `-- users.routes.ts
`-- shared
    `-- ui
```

`src/styles.scss` define tokens globales, theme light/dark y ajustes de Angular Material. `src/tailwind.css` carga Tailwind y consume el spacing base. Tailwind no es la fuente de colores de producto.

## Responsabilidades

### core

Codigo transversal de aplicacion: autenticacion, guards, interceptores, layout principal, bootstrap y tema. `core` no debe depender de `domains`.

### shared/ui

Componentes presentacionales y reutilizables que no conocen dominios: botones, cards, page shell, command bar, text field, badges, estados y pagination bar. Un wrapper compartido se crea solo cuando aporta una API de producto, accesibilidad consistente o elimina repeticion real.

No crear wrappers triviales para cada componente de Material. Si `mat-select`, `mat-datepicker` o `mat-dialog` se usan bien una sola vez, se pueden usar directamente en la feature.

### domains

Cada dominio contiene la UI y el flujo propio del negocio. La estructura recomendada para un CRUD que crece es:

```text
domains/<domain>/
|-- data-access/
|-- application/
|-- features/
|-- ui/              # solo si hay componentes presentacionales del dominio
`-- <domain>.routes.ts
```

No crear carpetas vacias. Un dominio simple puede empezar solo con `feature-*` o `features/<screen>`.

### data-access

Adaptadores HTTP y DTOs. No maneja layout, permisos visuales ni estado de pantalla. No importa `features`.

### application

Facades o servicios de orquestacion cuando una pantalla necesita estado, paginacion, filtros, loading/error o combinacion de varios adapters. No crear una facade si la page es trivial.

### features

Pantallas route-level y containers. Componen `shared/ui`, Material y servicios `application`. No deberian llamar directamente a `data-access` si ya existe facade.

### ui dentro de dominio

Componentes presentacionales especificos del dominio. No importan facades, APIs ni pages. Se crean cuando una pantalla empieza a repetir partes visibles dentro del mismo dominio.

## UI, Material, Tailwind y tokens

- Angular Material gestiona componentes complejos: botones, inputs, tablas, dialogs, menus, select, datepicker, etc.
- Tailwind se usa para layout: `grid`, `flex`, `gap`, `px`, `py`, responsive y composicion alrededor de componentes.
- No usar Tailwind para pelear contra estilos internos de Material en `mat-button`, `mat-form-field`, `mat-card` o `mat-table`.
- Los colores, surfaces, texto, bordes, radius, sombras y estados light/dark viven en `src/styles.scss`.
- Los componentes propios usan tokens como `--color-text`, `--color-surface`, `--color-border` y clases globales pequeñas como `app-text`, `app-border`, `app-surface`.

## Patron CRUD recomendado

Para un listado enterprise:

1. Crear una feature route en `domains/<domain>/features/<screen>`.
2. Usar `app-page` para el marco de pantalla.
3. Usar `app-command-bar` para filtros y acciones compactas.
4. Usar controles Material o wrappers existentes (`app-text-field`) con Reactive Forms.
5. Mantener filtros, paginacion, loading/error/empty en una facade si la pantalla deja de ser trivial.
6. Renderizar tablas con Angular Material (`mat-table`) y Tailwind solo para overflow/layout externo.
7. Usar `app-loading-state`, `app-error-state`, `app-empty-state`, `app-status-badge` y `app-pagination-bar` para consistencia.

No crear un form-engine o schema-table hasta que existan varios CRUDs con repeticion demostrada.

## Estado y reactividad

- Preferir estado local en la page o facade del dominio.
- Usar signals para estado de UI consultado por templates.
- Usar RxJS para HTTP, debounce, formularios y cancelacion de flujos async.
- Evitar estado global salvo sesion/auth, theme o necesidades realmente transversales.
- No introducir NgRx/SignalStore por defecto.

Guia interna:

- Signals: estado sincronico de UI, sesion/permisos/theme, flags de pantalla y valores derivados con `computed()`.
- RxJS: HTTP, guards, `valueChanges`, debounce, cancelacion con `switchMap`, inicializadores y streams externos.
- Facades: exponen signals para lectura desde UI y pueden usar RxJS internamente para asincronia. Evitar `Subscription` manual en flujos repetibles; modelar comandos privados con `Subject` + `switchMap` cuando la ultima accion debe ganar.
- Componentes: un `subscribe()` puntual para login/logout/navegacion es aceptable, pero debe usar `takeUntilDestroyed()` si el componente puede destruirse antes de que termine.
- `effect()`: usarlo para renderizado o integracion visual, como directivas estructurales. No usarlo para fetch, navegacion o reglas de negocio salvo justificacion clara.
- Interop: usar `toSignal()`/`toObservable()` solo en fronteras claras entre estado UI y streams async; no convertir por reflejo.
- Inputs/outputs: componentes nuevos de `shared/ui` usan `input()`/`output()`. Componentes existentes se migran cuando se toquen por una razon real.

## Boundaries de ESLint

Las reglas actuales protegen limites reales:

- `core` no importa `domains`.
- `shared/ui` no importa `core` ni `domains`.
- `shared` no importa `domains`.
- `features` no accede directo a `data-access` cuando existe `application`.
- `application` no importa pages/features.
- `data-access` no importa application/features.

Si aparece una nueva capa real, ajustar reglas despues de crear uso real, no antes.

## Auth y autorizacion

La app usa autenticacion basada en cookies y CSRF. El backend es la autoridad de seguridad. El frontend usa scopes/capabilities para UX: ocultar rutas, menus, botones o acciones.

Endpoints esperados:

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/auth/csrf`

Usar `AuthFacade`, `authGuard`, `scopeGuard` y `appHasScope` para permisos de UI. No confiar en la UI como seguridad final.

Politica de cache de sesion:

- `loadSession()` puede cachear `GET /api/auth/me` para no repetir la misma carga de sesion.
- La cache debe invalidarse en login exitoso, logout y fallo de carga de sesion.
- Si mas adelante se agrega manejo global de `401/403`, debe limpiar sesion/cache en el mismo sentido.
- La sesion global vive en `AuthSessionStore`; las features leen permisos via `AuthFacade`, no desde HTTP directo.

## Comandos

```bash
npm install
npm start
npm run lint
npm test
npm run test:run
npm run build
npm run e2e
```

`npm run e2e` requiere specs Playwright. Si no hay specs, el comando puede fallar por falta de tests, no por la aplicacion.

## Reglas de no sobreingenieria

- No copiar DDD backend 1:1 al frontend.
- No crear carpetas vacias para parecer enterprise.
- No crear facades, stores, engines o adapters sin repeticion real.
- No introducir Nx, NgRx, microfrontends, SSR o librerias nuevas sin evidencia fuerte.
- No envolver Material si usar Material directo es mas claro.
- Mantener componentes pequenos y APIs explicitas.
