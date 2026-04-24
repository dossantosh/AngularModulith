import nx from '@nx/eslint-plugin';

const internalLayerBoundaryRule = (patterns) => [
  'error',
  {
    patterns,
  },
];

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist', '**/out-tsc'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.cts', '**/*.mts', '**/*.js', '**/*.jsx', '**/*.cjs', '**/*.mjs'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          banTransitiveDependencies: true,
          depConstraints: [
            {
              sourceTag: 'scope:app',
              onlyDependOnLibsWithTags: ['scope:auth', 'scope:dashboard', 'scope:shared', 'scope:shell', 'scope:users'],
            },
            {
              sourceTag: 'scope:auth',
              onlyDependOnLibsWithTags: ['scope:auth', 'scope:shared'],
            },
            {
              sourceTag: 'scope:dashboard',
              onlyDependOnLibsWithTags: ['scope:auth', 'scope:dashboard', 'scope:shared'],
            },
            {
              sourceTag: 'scope:shell',
              onlyDependOnLibsWithTags: ['scope:auth', 'scope:shared', 'scope:shell'],
            },
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
            {
              sourceTag: 'scope:users',
              onlyDependOnLibsWithTags: ['scope:shared', 'scope:users'],
            },
          ],
          enforceBuildableLibDependency: false,
        },
      ],
    },
  },
  ...nx.configs['flat/angular'],
  ...nx.configs['flat/angular-template'],
  {
    files: ['**/*.ts'],
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
    files: ['**/*.html'],
    rules: {},
  },
  {
    files: ['src/app/**/feature-*/**/*.ts'],
    ignores: ['**/*.spec.ts'],
    rules: {
      'no-restricted-imports': internalLayerBoundaryRule([
        {
          group: ['../data-access', '../data-access/*'],
          message: 'Feature code should reach remote data through application services or facades, not data-access directly.',
        },
        {
          group: ['../domain', '../domain/*'],
          message: 'Feature code should consume application-facing models instead of domain internals directly.',
        },
        {
          group: ['../state', '../state/*'],
          message: 'Feature code should only depend on explicit screen state through application APIs.',
        },
      ]),
    },
  },
  {
    files: ['src/app/**/application/**/*.ts'],
    ignores: ['**/*.spec.ts'],
    rules: {
      'no-restricted-imports': internalLayerBoundaryRule([
        {
          group: ['../feature-*', '../feature-*/*'],
          message: 'Application services should not depend on feature components or pages.',
        },
        {
          group: ['../ui', '../ui/*'],
          message: 'Application services should stay independent from presentational UI internals.',
        },
        {
          group: ['../routing', '../routing/*'],
          message: 'Routing adapters should stay outside application services.',
        },
      ]),
    },
  },
  {
    files: ['src/app/**/domain/**/*.ts'],
    ignores: ['**/*.spec.ts'],
    rules: {
      'no-restricted-imports': internalLayerBoundaryRule([
        {
          group: ['../application', '../application/*', '../data-access', '../data-access/*', '../feature-*', '../feature-*/*', '../routing', '../routing/*', '../state', '../state/*', '../ui', '../ui/*'],
          message: 'Domain models must not depend on higher-level application, UI, routing, data-access or state layers.',
        },
        {
          group: ['@angular/*'],
          message: 'Domain models should remain free of Angular framework dependencies.',
        },
      ]),
    },
  },
  {
    files: ['src/app/**/data-access/**/*.ts'],
    ignores: ['**/*.spec.ts'],
    rules: {
      'no-restricted-imports': internalLayerBoundaryRule([
        {
          group: ['../application', '../application/*', '../feature-*', '../feature-*/*', '../routing', '../routing/*', '../state', '../state/*', '../ui', '../ui/*'],
          message: 'Data-access should not depend on application orchestration, routing, state or UI layers.',
        },
      ]),
    },
  },
  {
    files: ['src/app/**/state/**/*.ts'],
    ignores: ['**/*.spec.ts'],
    rules: {
      'no-restricted-imports': internalLayerBoundaryRule([
        {
          group: ['../application', '../application/*', '../data-access', '../data-access/*', '../feature-*', '../feature-*/*', '../routing', '../routing/*', '../ui', '../ui/*'],
          message: 'State stores should stay focused on flow/session state, not depend on application, remote data, routing or UI layers.',
        },
      ]),
    },
  },
  {
    files: ['src/app/**/ui/**/*.ts'],
    ignores: ['**/*.spec.ts'],
    rules: {
      'no-restricted-imports': internalLayerBoundaryRule([
        {
          group: ['../application', '../application/*', '../data-access', '../data-access/*', '../domain', '../domain/*', '../feature-*', '../feature-*/*', '../routing', '../routing/*', '../state', '../state/*'],
          message: 'UI components should stay presentational and avoid reaching into feature, application, domain, routing, data-access or state internals.',
        },
      ]),
    },
  },
  {
    files: ['src/app/**/routing/**/*.ts'],
    ignores: ['**/*.spec.ts'],
    rules: {
      'no-restricted-imports': internalLayerBoundaryRule([
        {
          group: ['../data-access', '../data-access/*', '../feature-*', '../feature-*/*', '../state', '../state/*', '../ui', '../ui/*'],
          message: 'Routing adapters should depend on application-facing APIs, not feature, UI, state or data-access internals.',
        },
      ]),
    },
  },
];
