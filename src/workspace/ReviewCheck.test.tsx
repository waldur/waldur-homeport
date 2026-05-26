import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockProjectPermissionsReviewsList = vi.fn();
const mockCustomerPermissionsReviewsList = vi.fn();
const mockIsFeatureVisible = vi.fn();
const mockHasPermission = vi.fn();
const mockOpenDialog = vi.fn();
const mockUseUser = vi.fn();
const mockUseCustomer = vi.fn();
const mockUseProject = vi.fn();

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
  useModal: () => ({
    openDialog: mockOpenDialog,
  }),
}));

vi.mock('@/core/lazyComponent', () => ({
  lazyComponent: (fn) => fn,
}));

vi.mock('@/core/PendingMembershipReviewDialog', () => ({
  PendingMembershipReviewDialog: 'PendingMembershipReviewDialog',
}));

vi.mock('@/workspace/hooks', () => ({
  useUser: () => mockUseUser(),
  useCustomer: () => mockUseCustomer(),
  useProject: () => mockUseProject(),
}));

import { PermissionEnum } from '@/permissions/enums';

import { useReviewCheck } from './ReviewCheck';

describe('useReviewCheck', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUser.mockReturnValue({ is_staff: false, uuid: 'user-123' });
    mockUseCustomer.mockReturnValue(null);
    mockUseProject.mockReturnValue(null);
  });

  describe('project pending reviews', () => {
    const mockProject = { uuid: 'project-123' };

    it('should not check reviews when feature is disabled', async () => {
      mockIsFeatureVisible.mockReturnValue(false);
      mockUseProject.mockReturnValue(mockProject);

      renderHook(() => useReviewCheck());

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockProjectPermissionsReviewsList).not.toHaveBeenCalled();
    });

    it('should not check reviews when user is staff', async () => {
      mockIsFeatureVisible.mockReturnValue(true);
      mockUseUser.mockReturnValue({ is_staff: true, uuid: 'user-123' });
      mockUseProject.mockReturnValue(mockProject);
      mockHasPermission.mockReturnValue(true);

      renderHook(() => useReviewCheck());

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockProjectPermissionsReviewsList).not.toHaveBeenCalled();
    });

    it('should not check reviews when user lacks permission', async () => {
      mockIsFeatureVisible.mockReturnValue(true);
      mockUseProject.mockReturnValue(mockProject);
      mockHasPermission.mockReturnValue(false);

      renderHook(() => useReviewCheck());

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockProjectPermissionsReviewsList).not.toHaveBeenCalled();
    });

    it('should check permission with correct parameters', async () => {
      mockIsFeatureVisible.mockReturnValue(true);
      mockUseProject.mockReturnValue(mockProject);
      mockHasPermission.mockReturnValue(false);

      renderHook(() => useReviewCheck());

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
      mockUseProject.mockReturnValue(mockProject);
      mockHasPermission.mockReturnValue(true);
      mockProjectPermissionsReviewsList.mockResolvedValue({ data: [] });

      renderHook(() => useReviewCheck());

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
      mockUseProject.mockReturnValue(mockProject);
      mockHasPermission.mockReturnValue(true);
      mockProjectPermissionsReviewsList.mockResolvedValue({
        data: [{ uuid: 'review-123' }],
      });

      renderHook(() => useReviewCheck());

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockOpenDialog).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          resolve: { reviewId: 'review-123', scope: 'project' },
          size: 'xl',
        }),
      );
    });

    it('should not open modal when no pending review exists', async () => {
      mockIsFeatureVisible.mockReturnValue(true);
      mockUseProject.mockReturnValue(mockProject);
      mockHasPermission.mockReturnValue(true);
      mockProjectPermissionsReviewsList.mockResolvedValue({ data: [] });

      renderHook(() => useReviewCheck());

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockOpenDialog).not.toHaveBeenCalled();
    });

    it('should silently handle API errors', async () => {
      mockIsFeatureVisible.mockReturnValue(true);
      mockUseProject.mockReturnValue(mockProject);
      mockHasPermission.mockReturnValue(true);
      mockProjectPermissionsReviewsList.mockRejectedValue(
        new Error('API Error'),
      );

      // Should not throw
      expect(() => {
        renderHook(() => useReviewCheck());
      }).not.toThrow();

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockOpenDialog).not.toHaveBeenCalled();
    });
  });

  describe('customer pending reviews', () => {
    const mockCustomer = { uuid: 'customer-123' };

    it('should not check reviews when feature is disabled', async () => {
      mockIsFeatureVisible.mockReturnValue(false);
      mockUseCustomer.mockReturnValue(mockCustomer);

      renderHook(() => useReviewCheck());

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockCustomerPermissionsReviewsList).not.toHaveBeenCalled();
    });

    it('should not check reviews when user is not owner', async () => {
      mockIsFeatureVisible.mockReturnValue(true);
      mockUseCustomer.mockReturnValue(mockCustomer);
      mockUseUser.mockReturnValue({
        uuid: 'user-123',
        permissions: [],
      });

      renderHook(() => useReviewCheck());

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockCustomerPermissionsReviewsList).not.toHaveBeenCalled();
    });

    it('should fetch pending reviews when user is owner', async () => {
      mockIsFeatureVisible.mockReturnValue(true);
      mockUseCustomer.mockReturnValue(mockCustomer);
      mockUseUser.mockReturnValue({
        uuid: 'user-123',
        permissions: [
          {
            scope_type: 'customer',
            scope_uuid: 'customer-123',
            role_name: 'CUSTOMER.OWNER',
          },
        ],
      });
      mockCustomerPermissionsReviewsList.mockResolvedValue({ data: [] });

      renderHook(() => useReviewCheck());

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
      mockUseCustomer.mockReturnValue(mockCustomer);
      mockUseUser.mockReturnValue({
        uuid: 'user-123',
        permissions: [
          {
            scope_type: 'customer',
            scope_uuid: 'customer-123',
            role_name: 'CUSTOMER.OWNER',
          },
        ],
      });
      mockCustomerPermissionsReviewsList.mockResolvedValue({
        data: [{ uuid: 'review-456' }],
      });

      renderHook(() => useReviewCheck());

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockOpenDialog).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          resolve: { reviewId: 'review-456', scope: 'customer' },
          size: 'xl',
        }),
      );
    });

    it('should silently handle API errors', async () => {
      mockIsFeatureVisible.mockReturnValue(true);
      mockUseCustomer.mockReturnValue(mockCustomer);
      mockUseUser.mockReturnValue({
        uuid: 'user-123',
        permissions: [
          {
            scope_type: 'customer',
            scope_uuid: 'customer-123',
            role_name: 'CUSTOMER.OWNER',
          },
        ],
      });
      mockCustomerPermissionsReviewsList.mockRejectedValue(
        new Error('API Error'),
      );

      expect(() => {
        renderHook(() => useReviewCheck());
      }).not.toThrow();

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockOpenDialog).not.toHaveBeenCalled();
    });
  });

  describe('request cancellation', () => {
    it('should cancel previous project review request when navigating to new project', async () => {
      mockIsFeatureVisible.mockReturnValue(true);
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

      mockUseProject.mockReturnValue({ uuid: 'project-A' });

      const { rerender } = renderHook(() => useReviewCheck());

      // Quickly change to Project B
      mockUseProject.mockReturnValue({ uuid: 'project-B' });
      rerender();

      // Wait for Project B's request to complete
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Now resolve Project A's request (should be ignored due to abort)
      resolveFirst({ data: [{ uuid: 'review-A' }] });
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Should only show modal for Project B, not Project A
      expect(mockOpenDialog).toHaveBeenCalledTimes(1);
      expect(mockOpenDialog).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          resolve: { reviewId: 'review-B', scope: 'project' },
        }),
      );
    });

    it('should cancel previous customer review request when navigating to new customer', async () => {
      mockIsFeatureVisible.mockReturnValue(true);
      mockUseUser.mockReturnValue({
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

      mockUseCustomer.mockReturnValue({ uuid: 'customer-A' });

      const { rerender } = renderHook(() => useReviewCheck());

      // Quickly change to Customer B
      mockUseCustomer.mockReturnValue({ uuid: 'customer-B' });
      rerender();

      // Wait for Customer B's request to complete
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Now resolve Customer A's request (should be ignored due to abort)
      resolveFirst({ data: [{ uuid: 'review-A' }] });
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Should only show modal for Customer B, not Customer A
      expect(mockOpenDialog).toHaveBeenCalledTimes(1);
      expect(mockOpenDialog).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          resolve: { reviewId: 'review-B', scope: 'customer' },
        }),
      );
    });
  });
});
