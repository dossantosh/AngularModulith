import type { GeneratorConfig } from 'ng-openapi';

const config: GeneratorConfig = {
  input: 'openapi/backend-api.json',
  output: 'src/app/generated/openapi',
  options: {
    dateType: 'string',
    enumStyle: 'union',
    generateEnumBasedOnDescription: false,
    generateServices: true,
    responseTypeMapping: {
      '*/*': 'json',
    },
  },
};

export default config;
