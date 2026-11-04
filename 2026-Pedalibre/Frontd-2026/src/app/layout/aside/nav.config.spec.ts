import { describe, expect, it } from 'vitest';
import { navigationItems } from './nav.config';

describe('navigationItems', () => {
  it('makes role, resource and grant management available for permission-based filtering', () => {
    const adminItems = navigationItems.filter((item) => item.path.startsWith('/admin/'));

    expect(adminItems.map((item) => item.path)).toEqual([
      '/admin/users',
      '/admin/roles',
      '/admin/resources',
      '/admin/grants',
    ]);
    expect(adminItems.every((item) => item.permission?.startsWith('GET /api/'))).toBe(true);
  });
});
