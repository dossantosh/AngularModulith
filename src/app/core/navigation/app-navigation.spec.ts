import {
  buildNavigationTree,
  getNavigationTarget,
  isNavigationNodeActive,
  resolveActiveNavigation,
} from './app-navigation';

import { type AppNavNode } from '../../shared/ui';

describe('app navigation', () => {
  it('builds a shared navigation tree from the backend session navigation', () => {
    const tree = buildNavigationTree([
      {
        key: 'systems',
        label: 'Sistemas',
        icon: 'settings',
        items: [
          {
            key: 'users',
            label: 'Usuarios',
            icon: 'group',
            route: '/users/search',
          },
        ],
      },
    ]);

    expect(tree).toHaveLength(2);
    expect(tree[0]).toMatchObject({ key: 'dashboard', route: '/', exact: true });
    expect(tree[1]).toMatchObject({
      key: 'systems',
      route: '/users/search',
      children: [{ key: 'users', route: '/users/search', matchRoute: '/users' }],
    });
  });

  it('keeps backend search links active for detail routes in the same section', () => {
    const tree = buildNavigationTree([
      {
        key: 'systems',
        label: 'Sistemas',
        icon: 'settings',
        items: [
          {
            key: 'users',
            label: 'Usuarios',
            icon: 'group',
            route: '/users/search',
          },
        ],
      },
    ]);

    const active = resolveActiveNavigation(tree, '/users/7/personal-data/edit');

    expect(active.primary?.key).toBe('systems');
    expect(active.secondary?.key).toBe('users');
  });

  it('resolves the active primary, secondary, and tertiary nodes from the current URL', () => {
    const tree: readonly AppNavNode[] = [
      {
        key: 'styles',
        label: 'Styles',
        icon: 'palette',
        route: '/styles',
        children: [
          {
            key: 'elevation',
            label: 'Elevation',
            route: '/styles/elevation',
            children: [
              {
                key: 'overview',
                label: 'Overview',
                route: '/styles/elevation/overview',
                exact: true,
              },
              {
                key: 'tokens',
                label: 'Tokens',
                route: '/styles/elevation/tokens',
                exact: true,
              },
            ],
          },
        ],
      },
    ];

    const active = resolveActiveNavigation(tree, '/styles/elevation/overview?density=0');

    expect(active.primary?.key).toBe('styles');
    expect(active.secondary?.key).toBe('elevation');
    expect(active.tertiary?.key).toBe('overview');
    expect(active.path.map((item) => item.key)).toEqual(['styles', 'elevation', 'overview']);
  });

  it('matches root navigation only when exact is true and the URL is root', () => {
    const tree = buildNavigationTree();

    expect(resolveActiveNavigation(tree, '/').primary?.key).toBe('dashboard');
    expect(resolveActiveNavigation(tree, '/users/search').primary?.key).toBeUndefined();
  });

  it('detects active ancestor nodes and resolves the first enabled navigation target', () => {
    const node: AppNavNode = {
      key: 'develop',
      label: 'Develop',
      children: [
        {
          key: 'disabled',
          label: 'Disabled',
          route: '/develop/disabled',
          disabled: true,
        },
        {
          key: 'guides',
          label: 'Guides',
          route: '/develop/guides',
        },
      ],
    };

    expect(isNavigationNodeActive(node, '/develop/guides/install')).toBe(true);
    expect(getNavigationTarget(node)).toBe('/develop/guides');
  });
});
