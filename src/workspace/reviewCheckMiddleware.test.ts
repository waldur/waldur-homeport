import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockProjectPermissionsReviewsList = vi.fn();
const mockCustomerPermissionsReviewsList = vi.fn();
const mockIsFeatureVisible = vi.fn();
const mockHasPermission = vi.fn();
const mockOpenModalDialog = vi.fn();

vi.mock('waldur-js-client', () => ({
  projectPermissionsReviewsList: (...args) =>
    mockProjectPermissionsReviewsList(...args),
  customerPermissionsReviewsList: (...args) =>
    mockCustomerPermissionsReviewsList(...args),
}));

vi.mock('@/features/connect', () => ({
  isFeatureVisible: (...args) => mockIsFeatureVisible(...args),
}));

vi.mock('@/permissions/hasPermission', () => ({
  hasPermission: (...args) => mockHasPermission(...args),
}));

vi.mock('@/modal/actions', () => ({
  openModalDialog: (...args) => mockOpenModalDialog(...args),
}));

vi.mock('@/core/lazyComponent', () => ({
  lazyComponent: (fn) => fn,
}));

vi.mock('@/core/PendingMembershipReviewDialog', () => ({
  PendingMembershipReviewDialog: 'PendingMembershipReviewDialog',
}));

import { PermissionEnum } from '@/permissions/enums';

import { SET_CURRENT_PROJECT, SET_CURRENT_CUSTOMER } from './constants';
import { reviewCheckMiddleware } from './reviewCheckMiddleware';

describe('reviewCheckMiddleware', () => {
  const mockStore = {
    getState: vi.fn(),
    dispatch: vi.fn(),
  };
  const mockNext = vi.fn((action) => action);

  beforeEach(() => {
    vi.clearAllMocks();
    mockNext.mockImplementation((action) => action);
  });

  describe('SET_CURRENT_PROJECT action', () => {
    const projectAction = {
      type: SET_CURRENT_PROJECT,
      payload: {
        project: { uuid: 'project-123' },
      },
    };

    it('should pass action to next middleware', () => {
      mockIsFeatureVisible.mockReturnValue(false);

      const middleware = reviewCheckMiddleware(mockStore)(mockNext);
      const result = middleware(projectAction);

      expect(mockNext).toHaveBeenCalledWith(projectAction);
      expect(result).toBe(projectAction);
    });

    it('should not check reviews when feature is disabled', async () => {
      mockIsFeatureVisible.mockReturnValue(false);

      const middleware = reviewCheckMiddleware(mockStore)(mockNext);
      middleware(projectAction);

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockProjectPermissionsReviewsList).not.toHaveBeenCalled();
    });

    it('should not check reviews when user is staff', async () => {
      mockIsFeatureVisible.mockReturnValue(true);
      mockStore.getState.mockReturnValue({
        workspace: {
          user: { is_staff: true, uuid: 'user-123' },
        },
      });
      mockHasPermission.mockReturnValue(true);

      const middleware = reviewCheckMiddleware(mockStore)(mockNext);
      middleware(projectAction);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockProjectPermissionsReviewsList).not.toHaveBeenCalled();
    });

    it('should not check reviews when user lacks permission', async () => {
      mockIsFeatureVisible.mockReturnValue(true);
      mockStore.getState.mockReturnValue({
        workspace: {
          user: { is_staff: false, uuid: 'user-123' },
        },
      });
      mockHasPermission.mockReturnValue(false);

      const middleware = reviewCheckMiddleware(mockStore)(mockNext);
      middleware(projectAction);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockProjectPermissionsReviewsList).not.toHaveBeenCalled();
    });

    it('should check permission with correct parameters', async () => {
      mockIsFeatureVisible.mockReturnValue(true);
      mockStore.getState.mockReturnValue({
        workspace: {
          user: { is_staff: false, uuid: 'user-123' },
        },
      });
      mockHasPermission.mockReturnValue(false);

      const middleware = reviewCheckMiddleware(mockStore)(mockNext);
      middleware(projectAction);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockHasPermission).toHaveBeenCalledWith(
        { is_staff: false, uuid: 'user-123' },
        {
          permission: PermissionEnum.REVIEW_PROJECT_MEMBERSHIP,
          projectId: 'project-123',
        },
      );
    });

    it('should fetch pending reviews when user has permission', async () => {
      mockIsFeatureVisible.mockReturnValue(true);
      mockStore.getState.mockReturnValue({
        workspace: {
          user: { is_staff: false, uuid: 'user-123' },
        },
      });
      mockHasPermission.mockReturnValue(true);
      mockProjectPermissionsReviewsList.mockResolvedValue({ data: [] });

      const middleware = reviewCheckMiddleware(mockStore)(mockNext);
      middleware(projectAction);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockProjectPermissionsReviewsList).toHaveBeenCalledWith(
        expect.objectContaining({
          query: {
            project_uuid: 'project-123',
            is_pending: true,
          },
        }),
      );
    });

    it('should open modal when pending review exists', async () => {
      mockIsFeatureVisible.mockReturnValue(true);
      mockStore.getState.mockReturnValue({
        workspace: {
          user: { is_staff: false, uuid: 'user-123' },
        },
      });
      mockHasPermission.mockReturnValue(true);
      mockProjectPermissionsReviewsList.mockResolvedValue({
        data: [{ uuid: 'review-123' }],
      });
      mockOpenModalDialog.mockReturnValue({ type: 'OPEN_MODAL' });

      const middleware = reviewCheckMiddleware(mockStore)(mockNext);
      middleware(projectAction);

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockStore.dispatch).toHaveBeenCalled();
      expect(mockOpenModalDialog).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          resolve: { reviewId: 'review-123', scope: 'project' },
          size: 'xl',
        }),
      );
    });

    it('should not open modal when no pending review exists', async () => {
      mockIsFeatureVisible.mockReturnValue(true);
      mockStore.getState.mockReturnValue({
        workspace: {
          user: { is_staff: false, uuid: 'user-123' },
        },
      });
      mockHasPermission.mockReturnValue(true);
      mockProjectPermissionsReviewsList.mockResolvedValue({ data: [] });

      const middleware = reviewCheckMiddleware(mockStore)(mockNext);
      middleware(projectAction);

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockStore.dispatch).not.toHaveBeenCalled();
    });

    it('should silently handle API errors', async () => {
      mockIsFeatureVisible.mockReturnValue(true);
      mockStore.getState.mockReturnValue({
        workspace: {
          user: { is_staff: false, uuid: 'user-123' },
        },
      });
      mockHasPermission.mockReturnValue(true);
      mockProjectPermissionsReviewsList.mockRejectedValue(
        new Error('API Error'),
      );

      const middleware = reviewCheckMiddleware(mockStore)(mockNext);

      // Should not throw
      expect(() => middleware(projectAction)).not.toThrow();

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockStore.dispatch).not.toHaveBeenCalled();
    });
  });

  describe('SET_CURRENT_CUSTOMER action', () => {
    const customerAction = {
      type: SET_CURRENT_CUSTOMER,
      payload: {
        customer: { uuid: 'customer-123' },
      },
    };

    it('should pass action to next middleware', () => {
      mockIsFeatureVisible.mockReturnValue(false);

      const middleware = reviewCheckMiddleware(mockStore)(mockNext);
      const result = middleware(customerAction);

      expect(mockNext).toHaveBeenCalledWith(customerAction);
      expect(result).toBe(customerAction);
    });

    it('should not check reviews when feature is disabled', async () => {
      mockIsFeatureVisible.mockReturnValue(false);

      const middleware = reviewCheckMiddleware(mockStore)(mockNext);
      middleware(customerAction);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockCustomerPermissionsReviewsList).not.toHaveBeenCalled();
    });

    it('should not check reviews when user is not owner', async () => {
      mockIsFeatureVisible.mockReturnValue(true);
      mockStore.getState.mockReturnValue({
        workspace: {
          user: {
            uuid: 'user-123',
            permissions: [],
          },
        },
      });

      const middleware = reviewCheckMiddleware(mockStore)(mockNext);
      middleware(customerAction);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockCustomerPermissionsReviewsList).not.toHaveBeenCalled();
    });

    it('should fetch pending reviews when user is owner', async () => {
      mockIsFeatureVisible.mockReturnValue(true);
      mockStore.getState.mockReturnValue({
        workspace: {
          user: {
            uuid: 'user-123',
            permissions: [
              {
                scope_type: 'customer',
                scope_uuid: 'customer-123',
                role_name: 'CUSTOMER.OWNER',
              },
            ],
          },
        },
      });
      mockCustomerPermissionsReviewsList.mockResolvedValue({ data: [] });

      const middleware = reviewCheckMiddleware(mockStore)(mockNext);
      middleware(customerAction);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockCustomerPermissionsReviewsList).toHaveBeenCalledWith(
        expect.objectContaining({
          query: {
            customer_uuid: 'customer-123',
            is_pending: true,
          },
        }),
      );
    });

    it('should open modal when pending review exists', async () => {
      mockIsFeatureVisible.mockReturnValue(true);
      mockStore.getState.mockReturnValue({
        workspace: {
          user: {
            uuid: 'user-123',
            permissions: [
              {
                scope_type: 'customer',
                scope_uuid: 'customer-123',
                role_name: 'CUSTOMER.OWNER',
              },
            ],
          },
        },
      });
      mockCustomerPermissionsReviewsList.mockResolvedValue({
        data: [{ uuid: 'review-456' }],
      });
      mockOpenModalDialog.mockReturnValue({ type: 'OPEN_MODAL' });

      const middleware = reviewCheckMiddleware(mockStore)(mockNext);
      middleware(customerAction);

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockStore.dispatch).toHaveBeenCalled();
      expect(mockOpenModalDialog).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          resolve: { reviewId: 'review-456', scope: 'customer' },
          size: 'xl',
        }),
      );
    });

    it('should silently handle API errors', async () => {
      mockIsFeatureVisible.mockReturnValue(true);
      mockStore.getState.mockReturnValue({
        workspace: {
          user: {
            uuid: 'user-123',
            permissions: [
              {
                scope_type: 'customer',
                scope_uuid: 'customer-123',
                role_name: 'CUSTOMER.OWNER',
              },
            ],
          },
        },
      });
      mockCustomerPermissionsReviewsList.mockRejectedValue(
        new Error('API Error'),
      );

      const middleware = reviewCheckMiddleware(mockStore)(mockNext);

      expect(() => middleware(customerAction)).not.toThrow();

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockStore.dispatch).not.toHaveBeenCalled();
    });
  });

  describe('other actions', () => {
    it('should pass through unrelated actions without side effects', async () => {
      const otherAction = { type: 'SOME_OTHER_ACTION', payload: {} };

      const middleware = reviewCheckMiddleware(mockStore)(mockNext);
      const result = middleware(otherAction);

      expect(mockNext).toHaveBeenCalledWith(otherAction);
      expect(result).toBe(otherAction);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockProjectPermissionsReviewsList).not.toHaveBeenCalled();
      expect(mockCustomerPermissionsReviewsList).not.toHaveBeenCalled();
    });
  });

  describe('request cancellation', () => {
    it('should cancel previous project review request when navigating to new project', async () => {
      mockIsFeatureVisible.mockReturnValue(true);
      mockStore.getState.mockReturnValue({
        workspace: {
          user: { is_staff: false, uuid: 'user-123' },
        },
      });
      mockHasPermission.mockReturnValue(true);

      // First request will be slow
      let resolveFirst: (value: any) => void;
      const firstPromise = new Promise((resolve) => {
        resolveFirst = resolve;
      });
      // Second request resolves immediately
      mockProjectPermissionsReviewsList
        .mockReturnValueOnce(firstPromise)
        .mockResolvedValueOnce({ data: [{ uuid: 'review-B' }] });
      mockOpenModalDialog.mockReturnValue({ type: 'OPEN_MODAL' });

      const projectActionA = {
        type: SET_CURRENT_PROJECT,
        payload: { project: { uuid: 'project-A' } },
      };
      const projectActionB = {
        type: SET_CURRENT_PROJECT,
        payload: { project: { uuid: 'project-B' } },
      };

      const middleware = reviewCheckMiddleware(mockStore)(mockNext);

      // Navigate to Project A
      middleware(projectActionA);

      // Quickly navigate to Project B
      middleware(projectActionB);

      // Wait for Project B's request to complete
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Now resolve Project A's request (should be ignored due to abort)
      resolveFirst({ data: [{ uuid: 'review-A' }] });
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Should only show modal for Project B, not Project A
      expect(mockOpenModalDialog).toHaveBeenCalledTimes(1);
      expect(mockOpenModalDialog).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          resolve: { reviewId: 'review-B', scope: 'project' },
        }),
      );
    });

    it('should cancel previous customer review request when navigating to new customer', async () => {
      mockIsFeatureVisible.mockReturnValue(true);
      mockStore.getState.mockReturnValue({
        workspace: {
          user: {
            uuid: 'user-123',
            permissions: [
              {
                scope_type: 'customer',
                scope_uuid: 'customer-A',
                role_name: 'CUSTOMER.OWNER',
              },
              {
                scope_type: 'customer',
                scope_uuid: 'customer-B',
                role_name: 'CUSTOMER.OWNER',
              },
            ],
          },
        },
      });

      // First request will be slow
      let resolveFirst: (value: any) => void;
      const firstPromise = new Promise((resolve) => {
        resolveFirst = resolve;
      });
      // Second request resolves immediately
      mockCustomerPermissionsReviewsList
        .mockReturnValueOnce(firstPromise)
        .mockResolvedValueOnce({ data: [{ uuid: 'review-B' }] });
      mockOpenModalDialog.mockReturnValue({ type: 'OPEN_MODAL' });

      const customerActionA = {
        type: SET_CURRENT_CUSTOMER,
        payload: { customer: { uuid: 'customer-A' } },
      };
      const customerActionB = {
        type: SET_CURRENT_CUSTOMER,
        payload: { customer: { uuid: 'customer-B' } },
      };

      const middleware = reviewCheckMiddleware(mockStore)(mockNext);

      // Navigate to Customer A
      middleware(customerActionA);

      // Quickly navigate to Customer B
      middleware(customerActionB);

      // Wait for Customer B's request to complete
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Now resolve Customer A's request (should be ignored due to abort)
      resolveFirst({ data: [{ uuid: 'review-A' }] });
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Should only show modal for Customer B, not Customer A
      expect(mockOpenModalDialog).toHaveBeenCalledTimes(1);
      expect(mockOpenModalDialog).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          resolve: { reviewId: 'review-B', scope: 'customer' },
        }),
      );
    });
  });
});
