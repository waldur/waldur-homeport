import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  userGroupInvitationsRetrieve,
  userGroupInvitationsSubmitRequest,
} from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { router } from '@/router';
import { createTestWrapper } from '@/test/harness';

import { useRequestToAccessOrganization } from './submission';

const mockGetCurrentUser = vi.fn();
const mockRefreshCurrentUser = vi.fn();
const mockGroupInvitationTokenGet = vi.fn();
const mockGroupInvitationTokenRemove = vi.fn();

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

vi.mock('@/core/ErrorMessageFormatter', () => ({
  format: (err: any) => err?.response?.data || 'Error',
}));

vi.mock('./ProjectDetailsDialog', () => ({
  ProjectDetailsDialog: 'ProjectDetailsDialog',
}));

function setupHook() {
  return renderHook(() => useRequestToAccessOrganization(), {
    wrapper: createTestWrapper().wrapper,
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
    vi.mocked(userGroupInvitationsRetrieve).mockResolvedValue({
      data: {
        uuid: 'invitation-123',
        allow_custom_project_details: false,
        scope_name: 'Test Org',
      },
    } as any);
    vi.mocked(userGroupInvitationsSubmitRequest).mockResolvedValue({
      data: {
        auto_approved: false,
        scope_name: 'Test Org',
      },
    } as any);
  });

  describe('checkAndRequest', () => {
    it('should not do anything if there is no group token', async () => {
      mockGroupInvitationTokenGet.mockReturnValue(null);

      const { result } = setupHook();

      await act(async () => {
        await result.current.checkAndRequest();
      });

      expect(mockGetCurrentUser).not.toHaveBeenCalled();
      expect(
        vi.mocked(userGroupInvitationsSubmitRequest),
      ).not.toHaveBeenCalled();
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

      expect(
        vi.mocked(userGroupInvitationsSubmitRequest),
      ).not.toHaveBeenCalled();
    });

    it('should call request if token exists and TOS is accepted', async () => {
      mockGroupInvitationTokenGet.mockReturnValue('group-token-123');

      const { result } = setupHook();

      await act(async () => {
        await result.current.checkAndRequest();
      });

      expect(vi.mocked(userGroupInvitationsSubmitRequest)).toHaveBeenCalledWith(
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

      expect(vi.mocked(userGroupInvitationsRetrieve)).toHaveBeenCalledWith({
        path: { uuid: 'group-token-123' },
      });
      expect(vi.mocked(userGroupInvitationsSubmitRequest)).toHaveBeenCalled();
    });

    it('should open ProjectDetailsDialog if allow_custom_project_details is true', async () => {
      vi.mocked(userGroupInvitationsRetrieve).mockResolvedValue({
        data: {
          uuid: 'invitation-123',
          allow_custom_project_details: true,
          scope_name: 'Test Org',
        },
      } as any);

      vi.mocked(useModal().openDialog).mockImplementation(
        (_component, options) => {
          // simulate submit
          options.resolve.onSubmit({ project_name: 'My Project' });
        },
      );

      const { result } = setupHook();

      await act(async () => {
        await result.current.request('group-token-123');
      });

      expect(vi.mocked(useModal().openDialog)).toHaveBeenCalledWith(
        'ProjectDetailsDialog',
        expect.anything(),
      );
      expect(vi.mocked(userGroupInvitationsSubmitRequest)).toHaveBeenCalledWith(
        {
          path: { uuid: 'invitation-123' },
          body: { project_name: 'My Project' },
        },
      );
    });

    it('should show success dialog and refresh user if auto-approved', async () => {
      vi.mocked(userGroupInvitationsSubmitRequest).mockResolvedValue({
        data: {
          auto_approved: true,
          scope_name: 'Test Org',
        },
      } as any);

      const { result } = setupHook();

      await act(async () => {
        await result.current.request({
          uuid: 'invitation-123',
          allow_custom_project_details: false,
        } as any);
      });

      expect(mockRefreshCurrentUser).toHaveBeenCalled();
      expect(vi.mocked(useModal().confirm)).toHaveBeenCalledWith(
        'You have successfully joined Test Org',
        expect.any(String),
        expect.objectContaining({ type: 'success' }),
      );
      expect(mockGroupInvitationTokenRemove).toHaveBeenCalled();
    });

    it('should show success dialog (not auto-approved) and not refresh user', async () => {
      vi.mocked(userGroupInvitationsSubmitRequest).mockResolvedValue({
        data: {
          auto_approved: false,
          scope_name: 'Test Org',
        },
      } as any);

      const { result } = setupHook();

      await act(async () => {
        await result.current.request({
          uuid: 'invitation-123',
          allow_custom_project_details: false,
        } as any);
      });

      expect(mockRefreshCurrentUser).not.toHaveBeenCalled();
      expect(vi.mocked(useModal().confirm)).toHaveBeenCalledWith(
        'Request has been sent for approval',
        expect.anything(),
        expect.objectContaining({ type: 'success' }),
      );
      expect(mockGroupInvitationTokenRemove).toHaveBeenCalled();
    });

    it('should show duplicate error dialog on conflict error', async () => {
      vi.mocked(userGroupInvitationsSubmitRequest).mockRejectedValue({
        response: { data: 'User already exists' },
      } as any);

      const { result } = setupHook();

      await act(async () => {
        await result.current.request({
          uuid: 'invitation-123',
          allow_custom_project_details: false,
        } as any);
      });

      expect(vi.mocked(useModal().confirm)).toHaveBeenCalledWith(
        'You already have access',
        expect.any(String),
        expect.objectContaining({ type: 'primary' }),
      );
      expect(mockGroupInvitationTokenRemove).toHaveBeenCalled();
    });

    it('should show restricted error dialog on other errors', async () => {
      vi.mocked(userGroupInvitationsSubmitRequest).mockRejectedValue({
        response: { data: 'Some other error' },
      } as any);

      const { result } = setupHook();

      await act(async () => {
        await result.current.request({
          uuid: 'invitation-123',
          allow_custom_project_details: false,
        } as any);
      });

      expect(vi.mocked(useModal().confirm)).toHaveBeenCalledWith(
        'Access restricted',
        expect.any(Object), // React Node formatted message
        expect.objectContaining({ type: 'danger' }),
      );
      expect(mockGroupInvitationTokenRemove).toHaveBeenCalled();
    });

    it('should remove stale token and resolve false when retrieval fails', async () => {
      vi.mocked(userGroupInvitationsRetrieve).mockRejectedValue({
        response: { data: 'Not found' },
      } as any);

      const { result } = setupHook();

      let handled: boolean;
      await act(async () => {
        handled = await result.current.request('stale-token');
      });

      expect(handled).toBe(false);
      expect(mockGroupInvitationTokenRemove).toHaveBeenCalled();
      expect(
        vi.mocked(userGroupInvitationsSubmitRequest),
      ).not.toHaveBeenCalled();
      expect(vi.mocked(router.stateService.go)).not.toHaveBeenCalled();
    });
  });

  describe('navigation after submission', () => {
    it('should navigate to the created project when auto-approved with a project', async () => {
      vi.mocked(userGroupInvitationsSubmitRequest).mockResolvedValue({
        data: {
          auto_approved: true,
          scope_name: 'Test Org',
          scope_uuid: 'scope-1',
          project_uuid: 'project-1',
        },
      } as any);

      const { result } = setupHook();

      let handled: boolean;
      await act(async () => {
        handled = await result.current.request({
          uuid: 'invitation-123',
          allow_custom_project_details: false,
        } as any);
      });

      expect(handled).toBe(true);
      expect(vi.mocked(router.stateService.go)).toHaveBeenCalledWith(
        'project.dashboard',
        { uuid: 'project-1' },
      );
    });

    it('should navigate to the organization when auto-approved without a project', async () => {
      vi.mocked(userGroupInvitationsSubmitRequest).mockResolvedValue({
        data: {
          auto_approved: true,
          scope_name: 'Test Org',
          scope_uuid: 'scope-1',
        },
      } as any);

      const { result } = setupHook();

      let handled: boolean;
      await act(async () => {
        handled = await result.current.request({
          uuid: 'invitation-123',
          allow_custom_project_details: false,
        } as any);
      });

      expect(handled).toBe(true);
      expect(vi.mocked(router.stateService.go)).toHaveBeenCalledWith(
        'organization.dashboard',
        { uuid: 'scope-1' },
      );
    });

    it('should navigate to permission requests when pending approval', async () => {
      vi.mocked(userGroupInvitationsSubmitRequest).mockResolvedValue({
        data: {
          auto_approved: false,
          scope_name: 'Test Org',
          scope_uuid: 'scope-1',
        },
      } as any);

      const { result } = setupHook();

      let handled: boolean;
      await act(async () => {
        handled = await result.current.request({
          uuid: 'invitation-123',
          allow_custom_project_details: false,
        } as any);
      });

      expect(handled).toBe(true);
      expect(vi.mocked(router.stateService.go)).toHaveBeenCalledWith(
        'profile.permission-requests',
        undefined,
      );
    });

    it('should not navigate and resolve false on submission error', async () => {
      vi.mocked(userGroupInvitationsSubmitRequest).mockRejectedValue({
        response: { data: 'Some other error' },
      } as any);

      const { result } = setupHook();

      let handled: boolean;
      await act(async () => {
        handled = await result.current.request({
          uuid: 'invitation-123',
          allow_custom_project_details: false,
        } as any);
      });

      expect(handled).toBe(false);
      expect(vi.mocked(router.stateService.go)).not.toHaveBeenCalled();
    });

    it('should not navigate and resolve false when project details dialog is cancelled', async () => {
      vi.mocked(userGroupInvitationsRetrieve).mockResolvedValue({
        data: {
          uuid: 'invitation-123',
          allow_custom_project_details: true,
          scope_name: 'Test Org',
        },
      } as any);

      vi.mocked(useModal().openDialog).mockImplementation(
        (_component, options) => {
          options.resolve.onCancel();
        },
      );

      const { result } = setupHook();

      let handled: boolean;
      await act(async () => {
        handled = await result.current.request('group-token-123');
      });

      expect(handled).toBe(false);
      expect(mockGroupInvitationTokenRemove).toHaveBeenCalled();
      expect(
        vi.mocked(userGroupInvitationsSubmitRequest),
      ).not.toHaveBeenCalled();
      expect(vi.mocked(router.stateService.go)).not.toHaveBeenCalled();
    });
  });
});
