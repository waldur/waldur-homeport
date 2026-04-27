import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the router module before importing filters
vi.mock('@/router', () => ({
  router: {
    urlService: {
      search: vi.fn(() => ({})),
      url: vi.fn(),
      // 1. Mock the new path() method
      path: vi.fn(() => '/test/'),
    },
  },
}));

// Import after mocking
import { router } from '@/router';

import { getQueryParams, syncFiltersToURL, getInitialValues } from './filters';

describe('filters', () => {
  beforeEach(() => {
    // Reset URL state before each test
    vi.clearAllMocks();
    // Reset window.location (search is still used, pathname is kept for realistic environment)
    Object.defineProperty(window, 'location', {
      value: {
        search: '',
        pathname: '/test/',
      },
      writable: true,
    });
    // Reset router mocks
    vi.mocked(router.urlService.url).mockClear();
    vi.mocked(router.urlService.path).mockReturnValue('/test/');
  });

  describe('compactFilterValue (via syncFiltersToURL)', () => {
    it('stores string values directly', () => {
      syncFiltersToURL({ name: 'test' });

      expect(router.urlService.url).toHaveBeenCalled();
      const call = vi.mocked(router.urlService.url).mock.calls[0];
      expect(call[0]).toContain('name=test');
    });

    it('stores object with uuid in compact format', () => {
      syncFiltersToURL({
        organization: { uuid: 'abc-123', name: 'My Org' },
      });

      expect(router.urlService.url).toHaveBeenCalled();
      const call = vi.mocked(router.urlService.url).mock.calls[0];
      // Should be uuid::name format
      expect(call[0]).toContain('organization=abc-123%3A%3AMy+Org');
    });

    it('stores object with uuid and title in compact format', () => {
      syncFiltersToURL({
        project: { uuid: 'proj-456', title: 'Project Title' },
      });

      expect(router.urlService.url).toHaveBeenCalled();
      const call = vi.mocked(router.urlService.url).mock.calls[0];
      expect(call[0]).toContain('project=proj-456%3A%3AProject+Title');
    });

    it('stores true boolean values', () => {
      syncFiltersToURL({ active: true });

      expect(router.urlService.url).toHaveBeenCalled();
      const call = vi.mocked(router.urlService.url).mock.calls[0];
      expect(call[0]).toContain('active=true');
    });

    it('removes false boolean values from URL (falsy)', () => {
      Object.defineProperty(window, 'location', {
        value: {
          search: '?archived=true',
          pathname: '/test/',
        },
        writable: true,
      });

      syncFiltersToURL({ archived: false });

      expect(router.urlService.url).toHaveBeenCalled();
      const call = vi.mocked(router.urlService.url).mock.calls[0];
      // false is falsy, so it removes the param
      expect(call[0]).not.toContain('archived=');
    });

    it('stores arrays with compact uuid::name format', () => {
      syncFiltersToURL({
        tags: [
          { uuid: 'tag-1', name: 'Tag One' },
          { uuid: 'tag-2', name: 'Tag Two' },
        ],
      });

      expect(router.urlService.url).toHaveBeenCalled();
      const call = vi.mocked(router.urlService.url).mock.calls[0];
      // Array should be JSON with compact values
      expect(call[0]).toContain('tags=');
    });

    it('removes null/undefined values from URL', () => {
      // First set a value
      Object.defineProperty(window, 'location', {
        value: {
          search: '?name=old',
          pathname: '/test/',
        },
        writable: true,
      });

      syncFiltersToURL({ name: null });

      expect(router.urlService.url).toHaveBeenCalled();
      const call = vi.mocked(router.urlService.url).mock.calls[0];
      expect(call[0]).not.toContain('name=');
    });
  });

  describe('expandFilterValue (via getQueryParams)', () => {
    it('expands compact uuid::name format to object', () => {
      vi.mocked(router.urlService.search).mockReturnValue({
        organization: '550e8400-e29b-41d4-a716-446655440000::My Org',
      });

      const params = getQueryParams();

      expect(params.organization).toEqual({
        uuid: '550e8400-e29b-41d4-a716-446655440000',
        name: 'My Org',
      });
    });

    it('expands plain UUID to object with uuid only', () => {
      vi.mocked(router.urlService.search).mockReturnValue({
        project: '550e8400-e29b-41d4-a716-446655440000',
      });

      const params = getQueryParams();

      expect(params.project).toEqual({
        uuid: '550e8400-e29b-41d4-a716-446655440000',
      });
    });

    it('expands UUID without dashes', () => {
      vi.mocked(router.urlService.search).mockReturnValue({
        item: '550e8400e29b41d4a716446655440000',
      });

      const params = getQueryParams();

      expect(params.item).toEqual({
        uuid: '550e8400e29b41d4a716446655440000',
      });
    });

    it('returns string values as-is when not UUID', () => {
      vi.mocked(router.urlService.search).mockReturnValue({
        name: 'test-value',
      });

      const params = getQueryParams();

      expect(params.name).toBe('test-value');
    });

    it('parses JSON encoded arrays', () => {
      vi.mocked(router.urlService.search).mockReturnValue({
        tags: '["tag1","tag2"]',
      });

      const params = getQueryParams();

      expect(params.tags).toEqual(['tag1', 'tag2']);
    });

    it('expands arrays with compact uuid::name values', () => {
      vi.mocked(router.urlService.search).mockReturnValue({
        items:
          '["550e8400-e29b-41d4-a716-446655440001::Name One","550e8400-e29b-41d4-a716-446655440002::Name Two"]',
      });

      const params = getQueryParams();

      expect(params.items).toEqual([
        { uuid: '550e8400-e29b-41d4-a716-446655440001', name: 'Name One' },
        { uuid: '550e8400-e29b-41d4-a716-446655440002', name: 'Name Two' },
      ]);
    });

    it('handles empty name in uuid:: format', () => {
      vi.mocked(router.urlService.search).mockReturnValue({
        organization: '550e8400-e29b-41d4-a716-446655440000::',
      });

      const params = getQueryParams();

      expect(params.organization).toEqual({
        uuid: '550e8400-e29b-41d4-a716-446655440000',
      });
    });

    it('returns empty object when no params', () => {
      vi.mocked(router.urlService.search).mockReturnValue({});

      const params = getQueryParams();

      expect(params).toEqual({});
    });

    it('handles URL encoded values', () => {
      vi.mocked(router.urlService.search).mockReturnValue({
        organization: '550e8400-e29b-41d4-a716-446655440000::My%20Organization',
      });

      const params = getQueryParams();

      expect(params.organization).toEqual({
        uuid: '550e8400-e29b-41d4-a716-446655440000',
        name: 'My Organization',
      });
    });
  });

  describe('getInitialValues', () => {
    it('returns URL params when present', () => {
      vi.mocked(router.urlService.search).mockReturnValue({
        name: 'from-url',
      });

      const values = getInitialValues({ name: 'default' });

      expect(values).toEqual({ name: 'from-url' });
    });

    it('returns initialValues when no URL params', () => {
      vi.mocked(router.urlService.search).mockReturnValue({});

      const values = getInitialValues({ name: 'default', active: true });

      expect(values).toEqual({ name: 'default', active: true });
    });

    it('filters out empty array values', () => {
      vi.mocked(router.urlService.search).mockReturnValue({
        name: 'test',
        tags: [],
      });

      const values = getInitialValues();

      expect(values).toEqual({ name: 'test' });
    });

    it('returns undefined when no params and no initialValues', () => {
      vi.mocked(router.urlService.search).mockReturnValue({});

      const values = getInitialValues();

      expect(values).toBeUndefined();
    });
  });

  describe('syncFiltersToURL', () => {
    it('does nothing when form is null', () => {
      syncFiltersToURL(null);

      expect(router.urlService.url).not.toHaveBeenCalled();
    });

    it('does nothing when form is empty object', () => {
      syncFiltersToURL({});

      expect(router.urlService.url).not.toHaveBeenCalled();
    });

    it('preserves existing URL params', () => {
      Object.defineProperty(window, 'location', {
        value: {
          search: '?existing=value',
          pathname: '/test/',
        },
        writable: true,
      });

      syncFiltersToURL({ newParam: 'new' });

      expect(router.urlService.url).toHaveBeenCalled();
      const call = vi.mocked(router.urlService.url).mock.calls[0];
      expect(call[0]).toContain('existing=value');
      expect(call[0]).toContain('newParam=new');
    });

    it('updates existing URL params', () => {
      Object.defineProperty(window, 'location', {
        value: {
          search: '?name=old',
          pathname: '/test/',
        },
        writable: true,
      });

      syncFiltersToURL({ name: 'new' });

      expect(router.urlService.url).toHaveBeenCalled();
      const call = vi.mocked(router.urlService.url).mock.calls[0];
      expect(call[0]).toContain('name=new');
      expect(call[0]).not.toContain('name=old');
    });

    // Validates that the fix for the double-prefix bug is functioning
    it('appends query to the router path instead of window.location.pathname', () => {
      // Simulate the bug scenario where window.location includes the base path
      Object.defineProperty(window, 'location', {
        value: {
          search: '',
          pathname: '/19388/profile/', // Browser's absolute path
        },
        writable: true,
      });
      // Simulate the router's internal relative path
      vi.mocked(router.urlService.path).mockReturnValue('/profile/');

      syncFiltersToURL({ filter: 'active' });

      const call = vi.mocked(router.urlService.url).mock.calls[0];
      // Expect it to use '/profile/' from the router, averting '/19388/19388/profile/'
      expect(call[0]).toBe('/profile/?filter=active');
    });
  });

  describe('UUID pattern matching', () => {
    it('recognizes standard UUID format', () => {
      vi.mocked(router.urlService.search).mockReturnValue({
        id: '123e4567-e89b-12d3-a456-426614174000',
      });

      const params = getQueryParams();

      expect(params.id).toEqual({
        uuid: '123e4567-e89b-12d3-a456-426614174000',
      });
    });

    it('recognizes UUID without dashes', () => {
      vi.mocked(router.urlService.search).mockReturnValue({
        id: '123e4567e89b12d3a456426614174000',
      });

      const params = getQueryParams();

      expect(params.id).toEqual({
        uuid: '123e4567e89b12d3a456426614174000',
      });
    });

    it('does not treat short strings as UUID', () => {
      vi.mocked(router.urlService.search).mockReturnValue({
        name: 'abc-123',
      });

      const params = getQueryParams();

      expect(params.name).toBe('abc-123');
    });

    it('does not treat regular words as UUID', () => {
      vi.mocked(router.urlService.search).mockReturnValue({
        status: 'active',
      });

      const params = getQueryParams();

      expect(params.status).toBe('active');
    });
  });
});
