/**
 * Type-level tests for table type inference.
 *
 * These tests verify that TypeScript correctly infers types through
 * the createFetcher -> useTable -> Table column chain.
 *
 * Tests use @ts-expect-error to verify that incorrect types produce errors.
 * If the type system is working correctly, all @ts-expect-error comments
 * should suppress actual errors. If a @ts-expect-error has no error to
 * suppress, TypeScript will report "Unused '@ts-expect-error' directive".
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock all dependencies that have side effects
vi.mock('@waldur/Application', () => ({
  queryClient: {
    fetchQuery: vi.fn(),
  },
}));

vi.mock('@waldur/core/api', () => ({
  fetchResultCount: vi.fn(),
  parseNextPage: vi.fn(),
}));

// Now import the modules we want to test
import { createFetcher, SdkFunction } from './api';
import { Column, Fetcher, FetcherOptions } from './types';

// Mock SDK function types for testing
interface User {
  uuid: string;
  username: string;
  email: string;
  is_active: boolean;
}

interface Project {
  uuid: string;
  name: string;
  customer_uuid: string;
  created: string;
}

describe('Table type inference', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createFetcher type extraction', () => {
    it('extracts item type from array response', () => {
      // Simulated SDK function that returns User[]
      const usersList: SdkFunction<{ page: number }, void, User[]> = () =>
        Promise.resolve({
          data: [] as User[],
          response: new Response(),
        }) as any;

      const fetcher = createFetcher(usersList);

      // Type check: fetcher should be Fetcher<User>
      const _typeCheck: Fetcher<User> = fetcher;
      expect(_typeCheck).toBe(fetcher);
    });

    it('extracts item type from SDK function with path params', () => {
      const projectsList: SdkFunction<
        { page: number },
        { customer_uuid: string },
        Project[]
      > = () =>
        Promise.resolve({
          data: [] as Project[],
          response: new Response(),
        }) as any;

      const fetcher = createFetcher(projectsList, {
        path: { customer_uuid: 'test-uuid' },
      });

      // Type check: fetcher should be Fetcher<Project>
      const _typeCheck: Fetcher<Project> = fetcher;
      expect(_typeCheck).toBe(fetcher);
    });

    it('allows parser to transform data', () => {
      // SDK returns User[], parser can transform it
      const usersList: SdkFunction<{ page: number }, void, User[]> = () =>
        Promise.resolve({
          data: [] as User[],
          response: new Response(),
        }) as any;

      // Parser transforms the data (type is preserved from SDK function)
      const fetcher = createFetcher(usersList, {
        parser: (data) => data.filter((u) => u.is_active),
      });

      // Fetcher type matches SDK function's array item type
      const _typeCheck: Fetcher<User> = fetcher;
      expect(_typeCheck).toBe(fetcher);
    });
  });

  describe('Column type safety', () => {
    it('allows valid property access in column render', () => {
      const columns: Column<User>[] = [
        {
          title: 'Username',
          render: ({ row }) => row.username, // Valid: username exists on User
        },
        {
          title: 'Email',
          render: ({ row }) => row.email, // Valid: email exists on User
        },
        {
          title: 'Status',
          render: ({ row }) => (row.is_active ? 'Active' : 'Inactive'), // Valid
        },
      ];

      expect(columns).toHaveLength(3);
    });

    it('rejects invalid property access in column render', () => {
      const columns: Column<User>[] = [
        {
          title: 'Invalid',
          // @ts-expect-error - 'invalid_field' does not exist on User
          render: ({ row }) => row.invalid_field,
        },
      ];
      expect(columns).toBeDefined();
    });

    it('rejects property from different type', () => {
      const columns: Column<User>[] = [
        {
          title: 'Invalid',
          // @ts-expect-error - 'customer_uuid' exists on Project, not User
          render: ({ row }) => row.customer_uuid,
        },
      ];
      expect(columns).toBeDefined();
    });

    it('allows copyField with valid property', () => {
      const columns: Column<User>[] = [
        {
          title: 'Email',
          render: ({ row }) => row.email,
          copyField: (row) => row.email, // Valid
        },
      ];

      expect(columns).toHaveLength(1);
    });

    it('rejects copyField with invalid property', () => {
      const columns: Column<User>[] = [
        {
          title: 'Invalid',
          render: ({ row }) => row.email,
          // @ts-expect-error - 'nonexistent' does not exist on User
          copyField: (row) => row.nonexistent,
        },
      ];
      expect(columns).toBeDefined();
    });

    it('allows export function with valid property', () => {
      const columns: Column<User>[] = [
        {
          title: 'Status',
          render: ({ row }) => (row.is_active ? 'Yes' : 'No'),
          export: (row) => (row.is_active ? 'Active' : 'Inactive'), // Valid
        },
      ];

      expect(columns).toHaveLength(1);
    });

    it('rejects export function with invalid property', () => {
      const columns: Column<User>[] = [
        {
          title: 'Invalid',
          render: ({ row }) => row.email,
          // @ts-expect-error - 'missing_prop' does not exist on User
          export: (row) => row.missing_prop,
        },
      ];
      expect(columns).toBeDefined();
    });

    it('allows inlineFilter with valid row properties', () => {
      const columns: Column<User>[] = [
        {
          title: 'Email',
          render: ({ row }) => row.email,
          filter: 'email',
          inlineFilter: (row) => ({ email: row.email, uuid: row.uuid }), // Valid
        },
      ];

      expect(columns).toHaveLength(1);
    });

    it('rejects inlineFilter with invalid property', () => {
      const columns: Column<User>[] = [
        {
          title: 'Invalid',
          render: ({ row }) => row.email,
          filter: 'email',
          // @ts-expect-error - 'bad_prop' does not exist on User
          inlineFilter: (row) => ({ value: row.bad_prop }),
        },
      ];
      expect(columns).toBeDefined();
    });
  });

  describe('FetcherOptions type constraints', () => {
    it('parser receives correct data type', () => {
      // When SDK returns an object (not array), parser receives that object
      type ApiResponse = { items: User[]; meta: { total: number } };

      const options: FetcherOptions<void, void, User> = {
        parser: (data: ApiResponse) => data.items,
      };

      expect(options.parser).toBeDefined();
    });

    it('parser must return array', () => {
      type ApiResponse = { items: User[]; meta: { total: number } };

      const options: FetcherOptions<void, void, User> = {
        // @ts-expect-error - parser must return RowType[], not a single object
        parser: (data: ApiResponse) => data.meta,
      };
      expect(options).toBeDefined();
    });
  });

  describe('Fetcher generic preservation', () => {
    it('Fetcher preserves row type through promise', async () => {
      const fetcher: Fetcher<User> = () =>
        Promise.resolve({
          rows: [
            {
              uuid: '1',
              username: 'test',
              email: 'test@test.com',
              is_active: true,
            },
          ],
        });

      const result = await fetcher({
        tableKey: 'test',
        pageSize: 10,
        currentPage: 1,
      });

      // Type should be inferred as User[]
      const firstUser = result.rows[0];
      const username: string = firstUser.username; // Should compile
      const email: string = firstUser.email; // Should compile

      expect(username).toBe('test');
      expect(email).toBe('test@test.com');
    });

    it('rejects wrong row type assignment', () => {
      const userFetcher: Fetcher<User> = () =>
        Promise.resolve({
          rows: [
            {
              uuid: '1',
              username: 'test',
              email: 'test@test.com',
              is_active: true,
            },
          ],
        });

      // @ts-expect-error - Cannot assign Fetcher<User> to Fetcher<Project>
      const projectFetcher: Fetcher<Project> = userFetcher;
      expect(projectFetcher).toBeDefined();
    });
  });

  describe('Type inference with keys property', () => {
    it('keys property accepts valid field names', () => {
      const columns: Column<User>[] = [
        {
          title: 'Name',
          render: ({ row }) => row.username,
          keys: ['username', 'uuid'], // Valid keys
        },
      ];

      expect(columns[0].keys).toEqual(['username', 'uuid']);
    });

    it('rejects invalid keys', () => {
      const columns: Column<User>[] = [
        {
          title: 'Name',
          render: ({ row }) => row.username,
          // @ts-expect-error - 'invalid_key' is not a key of User
          keys: ['username', 'invalid_key'],
        },
      ];
      expect(columns).toBeDefined();
    });
  });

  describe('Type inference completeness', () => {
    it('validates full column definition with all typed properties', () => {
      const column: Column<User> = {
        id: 'email-column',
        title: 'Email',
        render: ({ row }) => row.email,
        copyField: (row) => row.email,
        keys: ['email', 'uuid'],
        export: (row) => row.email,
        exportTitle: 'User Email',
        inlineFilter: (row) => ({ email: row.email }),
        filter: 'email',
        orderField: 'email',
        optional: true,
      };

      expect(column.id).toBe('email-column');
    });
  });
});
