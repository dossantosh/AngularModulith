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
    ignores: ['**/dist', '**/out-tsc', '**/node_modules'],
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
          message: 'core/ must stay app-level and must not depend on feature/domain internals.',
        },
      ]),
    },
  },
  {
    files: ['src/app/domains/**/feature-*/**/*.ts', 'src/app/domains/**/features/**/*.ts'],
    ignores: ['**/*.spec.ts'],
    rules: {
      'no-restricted-imports': restrictedImports([
        {
          group: ['../data-access', '../data-access/*'],
          message: 'Feature code should reach remote data through application services or facades, not data-access directly.',
        },
        {
          group: ['../state', '../state/*'],
          message: 'Feature code should depend on application-facing APIs instead of store internals.',
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
            '../feature-*',
            '../feature-*/*',
            '../features',
            '../features/*',
            '../features/**',
            '../ui',
            '../ui/*',
            '../routing',
            '../routing/*',
          ],
          message: 'Application services should not depend on feature, UI or routing internals.',
        },
      ]),
    },
  },
  {
    files: ['src/app/domains/**/domain/**/*.ts'],
    ignores: ['**/*.spec.ts'],
    rules: {
      'no-restricted-imports': restrictedImports([
        {
          group: [
            '../application',
            '../application/*',
            '../data-access',
            '../data-access/*',
            '../feature-*',
            '../feature-*/*',
            '../features',
            '../features/*',
            '../features/**',
            '../routing',
            '../routing/*',
            '../state',
            '../state/*',
            '../ui',
            '../ui/*',
          ],
          message: 'Domain models must stay free of Angular, UI, state, routing and data-access dependencies.',
        },
        {
          group: ['@angular/*'],
          message: 'Domain models should remain free of Angular framework dependencies.',
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
            '../feature-*',
            '../feature-*/*',
            '../features',
            '../features/*',
            '../features/**',
            '../routing',
            '../routing/*',
            '../ui',
            '../ui/*',
          ],
          message: 'Data-access should not depend on feature, routing or UI layers.',
        },
      ]),
    },
  },
  {
    files: ['src/app/domains/**/ui/**/*.ts'],
    ignores: ['**/*.spec.ts'],
    rules: {
      'no-restricted-imports': restrictedImports([
        {
          group: [
            '../application',
            '../application/*',
            '../data-access',
            '../data-access/*',
            '../domain',
            '../domain/*',
            '../feature-*',
            '../feature-*/*',
            '../features',
            '../features/*',
            '../features/**',
            '../routing',
            '../routing/*',
            '../state',
            '../state/*',
          ],
          message: 'UI components should stay presentational and avoid domain internals.',
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
