import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const DEFAULT_OPENAPI_URL = 'http://localhost:7070/v3/api-docs';
const DEFAULT_OUTPUT_PATH = 'openapi/backend-api.json';

const openApiUrl = process.env.OPENAPI_URL ?? DEFAULT_OPENAPI_URL;
const outputPath = resolve(process.cwd(), process.env.OPENAPI_OUT ?? DEFAULT_OUTPUT_PATH);

try {
  const response = await fetch(openApiUrl, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`GET ${openApiUrl} returned ${response.status} ${response.statusText}`);
  }

  const body = await response.text();
  const spec = parseOpenApi(body, openApiUrl);

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(spec, null, 2)}\n`, 'utf8');

  console.log(`[openapi] Downloaded ${openApiUrl}`);
  console.log(`[openapi] Wrote ${outputPath}`);
} catch (error) {
  console.error(`[openapi] ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}

function parseOpenApi(body, source) {
  let spec;

  try {
    spec = JSON.parse(body);
  } catch (error) {
    throw new Error(`GET ${source} did not return valid JSON`);
  }

  if (!spec || typeof spec !== 'object' || typeof spec.openapi !== 'string') {
    throw new Error(`GET ${source} did not return an OpenAPI document`);
  }

  return spec;
}
