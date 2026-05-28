import { renderHook } from '@testing-library/react';
import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useModal } from '@/modal/actions';
import { createTestWrapper } from '@/test/harness';

import { useInvitationCheck } from './InvitationCheck';

const mockIsAuthenticated = vi.fn();
const mockGetCurrentUser = vi.fn();
const mockMandatoryFieldsMissing = vi.fn();
const mockInvitationTokenGet = vi.fn();
const mockInvitationTokenRemove = vi.fn();
const mockGroupInvitationTokenGet = vi.fn();
const mockCheckAndRequest = vi.fn();
const mockUrlServicePath = vi.fn();

let mockState: any = { name: 'profile.details', data: {} };

vi.mock('@/auth/AuthService', () => ({
  isAuthenticated: (...args) => mockIsAuthenticated(...args),
}));

vi.mock('@/core/StorageManager', () => ({
  InvitationTokenStorage: {
    get: (...args) => mockInvitationTokenGet(...args),
    set: vi.fn(),
    remove: (...args) => mockInvitationTokenRemove(...args),
  },
  GroupInvitationTokenStorage: {
    get: (...args) => mockGroupInvitationTokenGet(...args),
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

vi.mock('@/user/UsersService', () => ({
  UsersService: {
    getCurrentUser: (...args) => mockGetCurrentUser(...args),
    mandatoryFieldsMissing: (...args) => mockMandatoryFieldsMissing(...args),
    refreshCurrentUser: vi.fn().mockResolvedValue(undefined),
  },
  getCurrentUser: vi.fn().mockResolvedValue({ uuid: 'user-1' }),
}));

vi.mock('./InvitationConfirmDialog', () => ({
  InvitationConfirmDialog: 'InvitationConfirmDialog',
}));

vi.mock('./join-organization/submission', () => ({
  useRequestToAccessOrganization: () => ({
    checkAndRequest: mockCheckAndRequest,
  }),
}));

function setupHook() {
  return renderHook(() => useInvitationCheck(), {
    wrapper: createTestWrapper().wrapper,
  });
}

describe('useInvitationCheck', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState = { name: 'profile.details', data: {} };
    vi.mocked(useCurrentStateAndParams).mockImplementation(() => ({
      state: mockState,
      params: {},
    }));
    vi.mocked(useRouter).mockReturnValue({
      stateService: { go: vi.fn() },
      urlService: { path: mockUrlServicePath },
    } as any);
    mockUrlServicePath.mockReturnValue('/profile/details');
    mockIsAuthenticated.mockReturnValue(true);
    mockGetCurrentUser.mockResolvedValue({
      is_staff: false,
      is_support: false,
      agreement_date: '2024-01-01',
    });
    mockMandatoryFieldsMissing.mockReturnValue(false);
    mockInvitationTokenGet.mockReturnValue(null);
    mockGroupInvitationTokenGet.mockReturnValue(null);
  });

  it('should not do anything when user is not authenticated', async () => {
    mockIsAuthenticated.mockReturnValue(false);

    setupHook();

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(mockGetCurrentUser).not.toHaveBeenCalled();
    expect(useModal().openDialog).not.toHaveBeenCalled();
  });

  it('should not do anything when state has skipAuth', async () => {
    mockState = { name: 'some-state', data: { skipAuth: true } };

    setupHook();

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(mockGetCurrentUser).not.toHaveBeenCalled();
  });

  it('should open invitation dialog when token exists', async () => {
    mockInvitationTokenGet.mockReturnValue('inv-token-123');

    setupHook();

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(useModal().openDialog).toHaveBeenCalledWith(
      'InvitationConfirmDialog',
      expect.objectContaining({
        resolve: expect.objectContaining({
          token: 'inv-token-123',
          onConfirm: expect.any(Function),
          onCancel: expect.any(Function),
        }),
        backdrop: 'static',
      }),
    );
  });

  it('should not open invitation dialog when mandatory fields are missing', async () => {
    mockInvitationTokenGet.mockReturnValue('inv-token-123');
    mockMandatoryFieldsMissing.mockReturnValue(true);

    setupHook();

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(useModal().openDialog).not.toHaveBeenCalled();
  });

  it('should not open invitation dialog on group invitation route', async () => {
    mockInvitationTokenGet.mockReturnValue('inv-token-123');
    mockUrlServicePath.mockReturnValue('/user-group-invitations/some-token');

    setupHook();

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(useModal().openDialog).not.toHaveBeenCalled();
  });

  it('should call checkAndRequest on initial load', async () => {
    setupHook();

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(mockCheckAndRequest).toHaveBeenCalled();
  });

  it('should not call checkAndRequest on user-group-invitation route', async () => {
    mockState = { name: 'user-group-invitation', data: {} };

    setupHook();

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(mockCheckAndRequest).not.toHaveBeenCalled();
  });

  it('should only call checkAndRequest once (initial load only)', async () => {
    const { rerender } = setupHook();

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(mockCheckAndRequest).toHaveBeenCalledTimes(1);

    // Simulate navigation to new state
    mockState = { name: 'organization.dashboard', data: {} };
    rerender();

    await new Promise((resolve) => setTimeout(resolve, 10));

    // Should still only be 1 call (initial load only)
    expect(mockCheckAndRequest).toHaveBeenCalledTimes(1);
  });
});
