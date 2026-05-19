import eslint from '@eslint/js';
import angular from 'angular-eslint';
import tseslint from 'typescript-eslint';

const restrictedImports = (patterns) => [
  'error',
  {
    patterns,
  },
];

const noDirectHttpClient = [
  'error',
  {
    selector:
      "ImportDeclaration[source.value='@angular/common/http'] ImportSpecifier[imported.name='HttpClient']",
    message:
      'Backend access must go through generated OpenAPI controllers wrapped by core/domain api adapters.',
  },
];

export default tseslint.config(
  {
    ignores: ['**/dist', '**/out-tsc', '**/node_modules', 'src/app/generated/openapi/**'],
  },
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: ['app', 'ui'],
          style: 'kebab-case',
        },
      ],
    },
  },
  {
    files: ['src/app/**/*.ts'],
    ignores: ['**/*.spec.ts', 'src/app/generated/openapi/**'],
    rules: {
      'no-restricted-syntax': noDirectHttpClient,
    },
  },
  {
    files: ['src/app/core/**/*.ts'],
    ignores: ['**/*.spec.ts'],
    rules: {
      'no-restricted-imports': restrictedImports([
        {
          group: ['**/domains/**'],
          message: 'core/ is app-level infrastructure and must not depend on domain internals.',
        },
      ]),
    },
  },
  {
    files: ['src/app/shared/ui/**/*.ts'],
    ignores: ['**/*.spec.ts'],
    rules: {
      'no-restricted-imports': restrictedImports([
        {
          group: ['**/domains/**', '**/core/**'],
          message: 'shared/ui must stay presentational and domain-agnostic.',
        },
      ]),
    },
  },
  {
    files: ['src/app/domains/**/*.ts'],
    ignores: [
      '**/*.spec.ts',
      'src/app/domains/**/api/**/*.ts',
      'src/app/domains/**/services/**/*.ts',
    ],
    rules: {
      'no-restricted-imports': restrictedImports([
        {
          group: ['**/generated/openapi', '**/generated/openapi/**'],
          message:
            'Domain code must reach generated OpenAPI clients through its own api/ adapters.',
        },
      ]),
    },
  },
  {
    files: ['src/app/domains/**/api/**/*.ts', 'src/app/domains/**/services/**/*.ts'],
    ignores: ['**/*.spec.ts'],
    rules: {
      'no-restricted-imports': restrictedImports([
        {
          group: ['**/pages', '**/pages/**', '**/state', '**/state/**'],
          message: 'Domain api/services adapters must not depend on pages or state.',
        },
      ]),
    },
  },
  {
    files: ['src/app/domains/**/state/**/*.ts'],
    ignores: ['**/*.spec.ts'],
    rules: {
      'no-restricted-imports': restrictedImports([
        {
          group: ['**/pages', '**/pages/**', '**/generated/openapi', '**/generated/openapi/**'],
          message:
            'Domain state can use domain api/ adapters, but must not depend on pages or generated clients.',
        },
      ]),
    },
  },
  {
    files: ['src/app/shared/**/*.ts'],
    ignores: ['**/*.spec.ts'],
    rules: {
      'no-restricted-imports': restrictedImports([
        {
          group: ['**/domains/**'],
          message: 'shared/ must stay domain-agnostic.',
        },
      ]),
    },
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
    rules: {},
  },
);
