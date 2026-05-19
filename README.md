# AngularModulith

Frontend Angular standalone organizado por dominios. La regla principal es simple:
las pages no hablan con el cliente generado; hablan con adapters del dominio.

## Regla estructural

```text
generated/openapi
  Cliente tecnico generado.
  No se edita a mano.
  No se importa desde pages, state ni componentes de dominio.
  Si existe un controller generado para un endpoint, esa es la unica entrada HTTP.

domains/<domain>/api
domains/<domain>/services
  Adapters del dominio.
  Aqui se llama al cliente generado, se mapean DTOs y se usa lenguaje de producto.
  No dependen de pages ni de state.
  No inyectan HttpClient directo.

domains/<domain>/pages
  Pantallas de ruta.
  Componen UI, leen parametros, navegan y mantienen estado local razonable.
  Consumen api/services propios del dominio o state/facades cuando aportan valor.

domains/<domain>/state
  Solo existe si hay estado compartido o complejo.
  No es obligatorio para CRUDs simples.
```

Flujo esperado:

```text
pages -> state? -> api/services -> generated/openapi -> backend
pages -> api/services -> generated/openapi -> backend
```

Si una llamada necesita `HttpClient` manual, primero falta declarar ese endpoint en
OpenAPI y regenerar `generated/openapi`.

## Estructura recomendada

```text
src/app/
  core/                 # infraestructura global: auth, guards, layout, theme
  generated/openapi/    # cliente tecnico generado
  shared/ui/            # UI reutilizable y sin conocimiento de dominio
  domains/
    users/
      users.routes.ts
      pages/
      api/              # adapters del dominio users
      state/            # solo si el estado se comparte o se complica
      components/       # opcional, piezas especificas del dominio
```

`api/` es el nombre recomendado para nuevos adapters. Si un dominio existente usa
`services/` con el mismo papel, aplica la misma regla: es frontera de dominio, no
un service generado.

## Responsabilidades

### generated/openapi

Es codigo generado desde OpenAPI. Debe tratarse como infraestructura tecnica:
se regenera, no se refactoriza a mano y no define el lenguaje del frontend.

### api/services del dominio

Envuelven `generated/openapi`. Aqui viven:

- mapeo entre DTO tecnico y modelo que entiende la UI;
- nombres de metodos con intencion de producto;
- adaptacion de parametros, filtros y comandos;
- aislamiento de cambios del backend.

Ejemplo: una page deberia usar `UsersSearchApi.searchUsers(...)`, no
`UserControllerService.findUsers(...)` directamente.

Un adapter tampoco deberia usar `HttpClient` si el endpoint pertenece al backend
de la app. La solucion correcta es actualizar el contrato OpenAPI, regenerar el
cliente y envolver el controller generado.

### pages

Son componentes de ruta. Pueden tener estado local, formularios, filtros,
paginacion, loading/error y navegacion mientras sigan siendo legibles.

Si la pantalla crece mucho o el estado se comparte entre varias rutas, se extrae a
`state/`. Si solo llama a un metodo y pinta datos, no hace falta facade.

### state

Facades o stores solo cuando aportan estado real:

- datos compartidos por varias pages hijas;
- coordinacion de varias llamadas;
- estado derivado usado por un shell;
- una pantalla con demasiada orquestacion.

Evitar facades pasarela que solo delegan en un metodo de `api/`.

## Reglas comprobadas por ESLint

`npm run lint` protege los limites estructurales:

- `core/` no importa `domains/`;
- `shared/ui/` no importa `core/` ni `domains/`;
- `shared/` no importa `domains/`;
- codigo de dominio fuera de `api/` o `services/` no importa `generated/openapi`;
- `api/` y `services/` no importan `pages/` ni `state/`;
- `state/` no importa `pages/` ni `generated/openapi`.
- codigo de aplicacion no importa `HttpClient` directo; el HTTP vive en
  `generated/openapi`.

Estas reglas permiten que el cliente generado exista, pero obligan a pasar por
adapters propios antes de llegar a las pantallas.

## Criterio practico

- Empezar con `pages/` + `api/`.
- Anadir `state/` solo si hay estado compartido o complejo.
- Anadir `components/` dentro del dominio si se repite UI especifica del dominio.
- Mover a `shared/ui` solo piezas realmente reutilizables por varios dominios.
- No copiar ceremonia backend al frontend por defecto.

## Comandos

```bash
npm install
npm start
npm run lint
npm run test:ci
npm run build
npm run api:update
npm run api:generate
```

`npm run api:update` descarga el contrato del backend desde
`http://localhost:7070/v3/api-docs`, lo escribe en `openapi/backend-api.json` y
regenera `src/app/generated/openapi`. El backend debe estar arrancado.

Para usar otra URL:

```powershell
$env:OPENAPI_URL = 'http://localhost:7070/v3/api-docs'
npm run api:update
Remove-Item Env:OPENAPI_URL
```
