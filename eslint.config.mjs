import eslint from '@eslint/js';
import angular from 'angular-eslint';
import tseslint from 'typescript-eslint';

const restrictedImports = (patterns) => [
  'error',
  {
    patterns,
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
    files: ['src/app/domains/**/features/**/*.ts', 'src/app/domains/**/feature-*/**/*.ts'],
    ignores: ['**/*.spec.ts'],
    rules: {
      'no-restricted-imports': restrictedImports([
        {
          group: ['../data-access', '../data-access/*', '../../data-access', '../../data-access/*'],
          message:
            'Feature code should reach remote data through application services or facades, not data-access directly.',
        },
      ]),
    },
  },
  {
    files: ['src/app/domains/**/application/**/*.ts'],
    ignores: ['**/*.spec.ts'],
    rules: {
      'no-restricted-imports': restrictedImports([
        {
          group: [
            '../features',
            '../features/*',
            '../features/**',
            '../../features',
            '../../features/*',
            '../../features/**',
            '../feature-*',
            '../feature-*/*',
            '../../feature-*',
            '../../feature-*/*',
          ],
          message: 'Application services should orchestrate state/data and must not depend on pages.',
        },
      ]),
    },
  },
  {
    files: ['src/app/domains/**/data-access/**/*.ts'],
    ignores: ['**/*.spec.ts'],
    rules: {
      'no-restricted-imports': restrictedImports([
        {
          group: [
            '../application',
            '../application/*',
            '../../application',
            '../../application/*',
            '../features',
            '../features/*',
            '../features/**',
            '../../features',
            '../../features/*',
            '../../features/**',
            '../feature-*',
            '../feature-*/*',
            '../../feature-*',
            '../../feature-*/*',
          ],
          message: 'Data-access should stay an adapter layer and must not depend on app orchestration or pages.',
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
