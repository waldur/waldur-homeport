import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useRequestToAccessOrganization } from './submission';

const mockUserGroupInvitationsRetrieve = vi.fn();
const mockUserGroupInvitationsSubmitRequest = vi.fn();
const mockOpenDialog = vi.fn();
const mockConfirm = vi.fn();
const mockGetCurrentUser = vi.fn();
const mockRefreshCurrentUser = vi.fn();
const mockGroupInvitationTokenGet = vi.fn();
const mockGroupInvitationTokenRemove = vi.fn();

vi.mock('waldur-js-client', () => ({
  userGroupInvitationsRetrieve: (...args) =>
    mockUserGroupInvitationsRetrieve(...args),
  userGroupInvitationsSubmitRequest: (...args) =>
    mockUserGroupInvitationsSubmitRequest(...args),
}));

vi.mock('@/modal/actions', () => ({
  useModal: () => ({
    openDialog: mockOpenDialog,
    confirm: mockConfirm,
  }),
}));

vi.mock('@/user/UsersService', () => ({
  UsersService: {
    getCurrentUser: (...args) => mockGetCurrentUser(...args),
    refreshCurrentUser: (...args) => mockRefreshCurrentUser(...args),
  },
}));

vi.mock('@/core/StorageManager', () => ({
  GroupInvitationTokenStorage: {
    get: (...args) => mockGroupInvitationTokenGet(...args),
    remove: (...args) => mockGroupInvitationTokenRemove(...args),
  },
}));

vi.mock('@/i18n', () => ({
  translate: (key: string) => key,
  formatJsxTemplate: (str: string) => str,
}));

vi.mock('@/core/ErrorMessageFormatter', () => ({
  format: (err: any) => err?.response?.data || 'Error',
}));

vi.mock('@/table/utils', () => ({
  renderFieldOrDash: (val: string) => val,
}));

vi.mock('./ProjectDetailsDialog', () => ({
  ProjectDetailsDialog: 'ProjectDetailsDialog',
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

function setupHook() {
  return renderHook(() => useRequestToAccessOrganization(), {
    wrapper: createWrapper(),
  });
}

describe('useRequestToAccessOrganization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue({
      is_staff: false,
      is_support: false,
      agreement_date: '2024-01-01',
    });
    mockUserGroupInvitationsRetrieve.mockResolvedValue({
      data: {
        uuid: 'invitation-123',
        allow_custom_project_details: false,
        scope_name: 'Test Org',
      },
    });
    mockUserGroupInvitationsSubmitRequest.mockResolvedValue({
      data: {
        auto_approved: false,
        scope_name: 'Test Org',
      },
    });
  });

  describe('checkAndRequest', () => {
    it('should not do anything if there is no group token', async () => {
      mockGroupInvitationTokenGet.mockReturnValue(null);

      const { result } = setupHook();

      await act(async () => {
        await result.current.checkAndRequest();
      });

      expect(mockGetCurrentUser).not.toHaveBeenCalled();
      expect(mockUserGroupInvitationsSubmitRequest).not.toHaveBeenCalled();
    });

    it('should not call request if user has not accepted TOS', async () => {
      mockGroupInvitationTokenGet.mockReturnValue('group-token-123');
      mockGetCurrentUser.mockResolvedValue({
        is_staff: false,
        is_support: false,
        agreement_date: null,
      });

      const { result } = setupHook();

      await act(async () => {
        await result.current.checkAndRequest();
      });

      expect(mockUserGroupInvitationsSubmitRequest).not.toHaveBeenCalled();
    });

    it('should call request if token exists and TOS is accepted', async () => {
      mockGroupInvitationTokenGet.mockReturnValue('group-token-123');

      const { result } = setupHook();

      await act(async () => {
        await result.current.checkAndRequest();
      });

      expect(mockUserGroupInvitationsSubmitRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          path: { uuid: 'invitation-123' },
        }),
      );
    });
  });

  describe('request', () => {
    it('should retrieve invitation if uuid is provided', async () => {
      const { result } = setupHook();

      await act(async () => {
        await result.current.request('group-token-123');
      });

      expect(mockUserGroupInvitationsRetrieve).toHaveBeenCalledWith({
        path: { uuid: 'group-token-123' },
      });
      expect(mockUserGroupInvitationsSubmitRequest).toHaveBeenCalled();
    });

    it('should open ProjectDetailsDialog if allow_custom_project_details is true', async () => {
      mockUserGroupInvitationsRetrieve.mockResolvedValue({
        data: {
          uuid: 'invitation-123',
          allow_custom_project_details: true,
          scope_name: 'Test Org',
        },
      });

      mockOpenDialog.mockImplementation((_component, options) => {
        // simulate submit
        options.resolve.onSubmit({ project_name: 'My Project' });
      });

      const { result } = setupHook();

      await act(async () => {
        await result.current.request('group-token-123');
      });

      expect(mockOpenDialog).toHaveBeenCalledWith(
        'ProjectDetailsDialog',
        expect.anything(),
      );
      expect(mockUserGroupInvitationsSubmitRequest).toHaveBeenCalledWith({
        path: { uuid: 'invitation-123' },
        body: { project_name: 'My Project' },
      });
    });

    it('should show success dialog and refresh user if auto-approved', async () => {
      mockUserGroupInvitationsSubmitRequest.mockResolvedValue({
        data: {
          auto_approved: true,
          scope_name: 'Test Org',
        },
      });

      const { result } = setupHook();

      await act(async () => {
        await result.current.request({
          uuid: 'invitation-123',
          allow_custom_project_details: false,
        } as any);
      });

      expect(mockRefreshCurrentUser).toHaveBeenCalled();
      expect(mockConfirm).toHaveBeenCalledWith(
        'You have successfully joined {organization}',
        expect.any(String),
        expect.objectContaining({ type: 'success' }),
      );
      expect(mockGroupInvitationTokenRemove).toHaveBeenCalled();
    });

    it('should show success dialog (not auto-approved) and not refresh user', async () => {
      mockUserGroupInvitationsSubmitRequest.mockResolvedValue({
        data: {
          auto_approved: false,
          scope_name: 'Test Org',
        },
      });

      const { result } = setupHook();

      await act(async () => {
        await result.current.request({
          uuid: 'invitation-123',
          allow_custom_project_details: false,
        } as any);
      });

      expect(mockRefreshCurrentUser).not.toHaveBeenCalled();
      expect(mockConfirm).toHaveBeenCalledWith(
        'Request has been sent for approval',
        expect.any(String),
        expect.objectContaining({ type: 'success' }),
      );
      expect(mockGroupInvitationTokenRemove).toHaveBeenCalled();
    });

    it('should show duplicate error dialog on conflict error', async () => {
      mockUserGroupInvitationsSubmitRequest.mockRejectedValue({
        response: { data: 'User already exists' },
      });

      const { result } = setupHook();

      await act(async () => {
        await result.current.request({
          uuid: 'invitation-123',
          allow_custom_project_details: false,
        } as any);
      });

      expect(mockConfirm).toHaveBeenCalledWith(
        'You already have access',
        expect.any(String),
        expect.objectContaining({ type: 'primary' }),
      );
      expect(mockGroupInvitationTokenRemove).toHaveBeenCalled();
    });

    it('should show restricted error dialog on other errors', async () => {
      mockUserGroupInvitationsSubmitRequest.mockRejectedValue({
        response: { data: 'Some other error' },
      });

      const { result } = setupHook();

      await act(async () => {
        await result.current.request({
          uuid: 'invitation-123',
          allow_custom_project_details: false,
        } as any);
      });

      expect(mockConfirm).toHaveBeenCalledWith(
        'Access restricted',
        expect.any(Object), // React Node formatted message
        expect.objectContaining({ type: 'danger' }),
      );
      expect(mockGroupInvitationTokenRemove).toHaveBeenCalled();
    });
  });
});
