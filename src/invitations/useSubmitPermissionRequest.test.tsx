/* eslint-disable import/order */
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  userGroupInvitationsRetrieve,
  userGroupInvitationsSubmitRequest,
} from 'waldur-js-client';
import { GroupInvitationTokenStorage } from '@/core/StorageManager';
import { useModal } from '@/modal/actions';
import { router } from '@/router';

const mockRefreshCurrentUser = vi.fn();

vi.mock('@/core/StorageManager', () => ({
  GroupInvitationTokenStorage: {
    remove: vi.fn(),
    set: vi.fn(),
    get: vi.fn(),
  },
}));

vi.mock('@/user/UsersService', () => ({
  UsersService: {
    refreshCurrentUser: (...args) => mockRefreshCurrentUser(...args),
  },
}));

vi.mock('./GroupInvitationConfirmDialog', () => ({
  GroupInvitationConfirmDialog: 'GroupInvitationConfirmDialog',
}));

vi.mock('./join-organization/ProjectDetailsDialog', () => ({
  ProjectDetailsDialog: 'ProjectDetailsDialog',
}));

// Must import AFTER vi.mock calls
import { createTestWrapper } from '@/test/harness';

import { useSubmitPermissionRequest } from './useSubmitPermissionRequest';

function setupHook(token = 'test-token') {
  return renderHook(() => useSubmitPermissionRequest(token), {
    wrapper: createTestWrapper().wrapper,
  });
}

describe('useSubmitPermissionRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return submit function and isPending state', () => {
    const { result } = setupHook();

    expect(result.current.submit).toBeDefined();
    expect(typeof result.current.submit).toBe('function');
    expect(result.current.isPending).toBe(false);
  });

  it('should open GroupInvitationConfirmDialog when submit is called', () => {
    const { result } = setupHook();

    act(() => {
      result.current.submit();
    });

    expect(vi.mocked(useModal().openDialog)).toHaveBeenCalledWith(
      'GroupInvitationConfirmDialog',
      expect.objectContaining({
        resolve: expect.objectContaining({
          token: 'test-token',
          onConfirm: expect.any(Function),
          onCancel: expect.any(Function),
        }),
        backdrop: 'static',
      }),
    );
  });

  it('should clear token and redirect on cancel', () => {
    const { result } = setupHook();

    act(() => {
      result.current.submit();
    });

    // Extract onCancel from the dialog call
    const dialogCall = vi.mocked(useModal().openDialog).mock.calls[0];
    const onCancel = dialogCall[1].resolve.onCancel;

    act(() => {
      onCancel();
    });

    expect(GroupInvitationTokenStorage.remove).toHaveBeenCalled();
    expect(router.stateService.go).toHaveBeenCalledWith('profile.details');
  });

  it('should call mutation on confirm and show success for auto-approved', async () => {
    vi.mocked(userGroupInvitationsRetrieve).mockResolvedValue({
      data: { allow_custom_project_details: false },
    } as any);
    vi.mocked(userGroupInvitationsSubmitRequest).mockResolvedValue({
      data: { auto_approved: true, scope_name: 'Test Org' },
    } as any);
    mockRefreshCurrentUser.mockResolvedValue(undefined);

    const { result } = setupHook();

    act(() => {
      result.current.submit();
    });

    // Extract onConfirm
    const dialogCall = vi.mocked(useModal().openDialog).mock.calls[0];
    const onConfirm = dialogCall[1].resolve.onConfirm;

    await act(async () => {
      await onConfirm();
    });

    // Wait for mutation to complete
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(vi.mocked(userGroupInvitationsSubmitRequest)).toHaveBeenCalledWith(
      expect.objectContaining({
        path: { uuid: 'test-token' },
        body: {},
      }),
    );
  });

  it('should show duplicate error dialog for conflict errors', async () => {
    vi.mocked(userGroupInvitationsRetrieve).mockResolvedValue({
      data: { allow_custom_project_details: false },
    } as any);
    vi.mocked(userGroupInvitationsSubmitRequest).mockRejectedValue({
      message: 'User already has this role in the scope.',
    } as any);
    vi.mocked(useModal().confirm).mockResolvedValue(undefined);

    const { result } = setupHook();

    act(() => {
      result.current.submit();
    });

    const dialogCall = vi.mocked(useModal().openDialog).mock.calls[0];
    const onConfirm = dialogCall[1].resolve.onConfirm;

    await act(async () => {
      await onConfirm();
    });

    // Wait for mutation error handler
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(vi.mocked(useModal().confirm)).toHaveBeenCalledWith(
      'You already have access',
      expect.any(String),
      expect.objectContaining({
        type: 'primary',
        onlyPositiveButton: true,
      }),
    );
  });
});
