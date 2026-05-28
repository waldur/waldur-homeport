/* eslint-disable import/order */
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  projectPermissionsReviewsList,
  customerPermissionsReviewsList,
} from 'waldur-js-client';
import { useModal } from '@/modal/actions';
import { useUser, useCustomer, useProject } from '@/workspace/hooks';

const mockIsFeatureVisible = vi.fn();
const mockHasPermission = vi.fn();

vi.mock('@/features/connect', () => ({
  isFeatureVisible: (...args) => mockIsFeatureVisible(...args),
}));

vi.mock('@/permissions/hasPermission', () => ({
  hasPermission: (...args) => mockHasPermission(...args),
}));

vi.mock('@/core/lazyComponent', () => ({
  lazyComponent: (fn) => fn,
}));

vi.mock('@/core/PendingMembershipReviewDialog', () => ({
  PendingMembershipReviewDialog: 'PendingMembershipReviewDialog',
}));

import { PermissionEnum } from '@/permissions/enums';

import { useReviewCheck } from './ReviewCheck';

describe('useReviewCheck', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUser).mockReturnValue({
      is_staff: false,
      uuid: 'user-123',
    } as any);
    vi.mocked(useCustomer).mockReturnValue(null);
    vi.mocked(useProject).mockReturnValue(null);
  });

  describe('project pending reviews', () => {
    const mockProject = { uuid: 'project-123' };

    it('should not check reviews when feature is disabled', async () => {
      mockIsFeatureVisible.mockReturnValue(false);
      vi.mocked(useProject).mockReturnValue(mockProject as any);

      renderHook(() => useReviewCheck());

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(vi.mocked(projectPermissionsReviewsList)).not.toHaveBeenCalled();
    });

    it('should not check reviews when user is staff', async () => {
      mockIsFeatureVisible.mockReturnValue(true);
      vi.mocked(useUser).mockReturnValue({
        is_staff: true,
        uuid: 'user-123',
      } as any);
      vi.mocked(useProject).mockReturnValue(mockProject as any);
      mockHasPermission.mockReturnValue(true);

      renderHook(() => useReviewCheck());

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(vi.mocked(projectPermissionsReviewsList)).not.toHaveBeenCalled();
    });

    it('should not check reviews when user lacks permission', async () => {
      mockIsFeatureVisible.mockReturnValue(true);
      vi.mocked(useProject).mockReturnValue(mockProject as any);
      mockHasPermission.mockReturnValue(false);

      renderHook(() => useReviewCheck());

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(vi.mocked(projectPermissionsReviewsList)).not.toHaveBeenCalled();
    });

    it('should check permission with correct parameters', async () => {
      mockIsFeatureVisible.mockReturnValue(true);
      vi.mocked(useProject).mockReturnValue(mockProject as any);
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
      vi.mocked(useProject).mockReturnValue(mockProject as any);
      mockHasPermission.mockReturnValue(true);
      vi.mocked(projectPermissionsReviewsList).mockResolvedValue({
        data: [],
      } as any);

      renderHook(() => useReviewCheck());

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(vi.mocked(projectPermissionsReviewsList)).toHaveBeenCalledWith(
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
      vi.mocked(useProject).mockReturnValue(mockProject as any);
      mockHasPermission.mockReturnValue(true);
      vi.mocked(projectPermissionsReviewsList).mockResolvedValue({
        data: [{ uuid: 'review-123' }],
      } as any);

      renderHook(() => useReviewCheck());

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(useModal().openDialog).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          resolve: { reviewId: 'review-123', scope: 'project' },
          size: 'xl',
        }),
      );
    });

    it('should not open modal when no pending review exists', async () => {
      mockIsFeatureVisible.mockReturnValue(true);
      vi.mocked(useProject).mockReturnValue(mockProject as any);
      mockHasPermission.mockReturnValue(true);
      vi.mocked(projectPermissionsReviewsList).mockResolvedValue({
        data: [],
      } as any);

      renderHook(() => useReviewCheck());

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(useModal().openDialog).not.toHaveBeenCalled();
    });

    it('should silently handle API errors', async () => {
      mockIsFeatureVisible.mockReturnValue(true);
      vi.mocked(useProject).mockReturnValue(mockProject as any);
      mockHasPermission.mockReturnValue(true);
      vi.mocked(projectPermissionsReviewsList).mockRejectedValue(
        new Error('API Error'),
      );

      // Should not throw
      expect(() => {
        renderHook(() => useReviewCheck());
      }).not.toThrow();

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(useModal().openDialog).not.toHaveBeenCalled();
    });
  });

  describe('customer pending reviews', () => {
    const mockCustomer = { uuid: 'customer-123' };

    it('should not check reviews when feature is disabled', async () => {
      mockIsFeatureVisible.mockReturnValue(false);
      vi.mocked(useCustomer).mockReturnValue(mockCustomer as any);

      renderHook(() => useReviewCheck());

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(vi.mocked(customerPermissionsReviewsList)).not.toHaveBeenCalled();
    });

    it('should not check reviews when user is not owner', async () => {
      mockIsFeatureVisible.mockReturnValue(true);
      vi.mocked(useCustomer).mockReturnValue(mockCustomer as any);
      vi.mocked(useUser).mockReturnValue({
        uuid: 'user-123',
        permissions: [],
      } as any);

      renderHook(() => useReviewCheck());

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(vi.mocked(customerPermissionsReviewsList)).not.toHaveBeenCalled();
    });

    it('should fetch pending reviews when user is owner', async () => {
      mockIsFeatureVisible.mockReturnValue(true);
      vi.mocked(useCustomer).mockReturnValue(mockCustomer as any);
      vi.mocked(useUser).mockReturnValue({
        uuid: 'user-123',
        permissions: [
          {
            scope_type: 'customer',
            scope_uuid: 'customer-123',
            role_name: 'CUSTOMER.OWNER',
          },
        ],
      } as any);
      vi.mocked(customerPermissionsReviewsList).mockResolvedValue({
        data: [],
      } as any);

      renderHook(() => useReviewCheck());

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(vi.mocked(customerPermissionsReviewsList)).toHaveBeenCalledWith(
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
      vi.mocked(useCustomer).mockReturnValue(mockCustomer as any);
      vi.mocked(useUser).mockReturnValue({
        uuid: 'user-123',
        permissions: [
          {
            scope_type: 'customer',
            scope_uuid: 'customer-123',
            role_name: 'CUSTOMER.OWNER',
          },
        ],
      } as any);
      vi.mocked(customerPermissionsReviewsList).mockResolvedValue({
        data: [{ uuid: 'review-456' }],
      } as any);

      renderHook(() => useReviewCheck());

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(useModal().openDialog).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          resolve: { reviewId: 'review-456', scope: 'customer' },
          size: 'xl',
        }),
      );
    });

    it('should silently handle API errors', async () => {
      mockIsFeatureVisible.mockReturnValue(true);
      vi.mocked(useCustomer).mockReturnValue(mockCustomer as any);
      vi.mocked(useUser).mockReturnValue({
        uuid: 'user-123',
        permissions: [
          {
            scope_type: 'customer',
            scope_uuid: 'customer-123',
            role_name: 'CUSTOMER.OWNER',
          },
        ],
      } as any);
      vi.mocked(customerPermissionsReviewsList).mockRejectedValue(
        new Error('API Error'),
      );

      expect(() => {
        renderHook(() => useReviewCheck());
      }).not.toThrow();

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(useModal().openDialog).not.toHaveBeenCalled();
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
      }) as any;
      // Second request resolves immediately
      vi.mocked(projectPermissionsReviewsList)
        .mockReturnValueOnce(firstPromise)
        .mockResolvedValueOnce({ data: [{ uuid: 'review-B' }] } as any);

      vi.mocked(useProject).mockReturnValue({ uuid: 'project-A' } as any);

      const { rerender } = renderHook(() => useReviewCheck());

      // Quickly change to Project B
      vi.mocked(useProject).mockReturnValue({ uuid: 'project-B' } as any);
      rerender();

      // Wait for Project B's request to complete
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Now resolve Project A's request (should be ignored due to abort)
      resolveFirst({ data: [{ uuid: 'review-A' }] });
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Should only show modal for Project B, not Project A
      expect(useModal().openDialog).toHaveBeenCalledTimes(1);
      expect(useModal().openDialog).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          resolve: { reviewId: 'review-B', scope: 'project' },
        }),
      );
    });

    it('should cancel previous customer review request when navigating to new customer', async () => {
      mockIsFeatureVisible.mockReturnValue(true);
      vi.mocked(useUser).mockReturnValue({
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
      } as any);

      // First request will be slow
      let resolveFirst: (value: any) => void;
      const firstPromise = new Promise((resolve) => {
        resolveFirst = resolve;
      }) as any;
      // Second request resolves immediately
      vi.mocked(customerPermissionsReviewsList)
        .mockReturnValueOnce(firstPromise)
        .mockResolvedValueOnce({ data: [{ uuid: 'review-B' }] } as any);

      vi.mocked(useCustomer).mockReturnValue({ uuid: 'customer-A' } as any);

      const { rerender } = renderHook(() => useReviewCheck());

      // Quickly change to Customer B
      vi.mocked(useCustomer).mockReturnValue({ uuid: 'customer-B' } as any);
      rerender();

      // Wait for Customer B's request to complete
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Now resolve Customer A's request (should be ignored due to abort)
      resolveFirst({ data: [{ uuid: 'review-A' }] });
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Should only show modal for Customer B, not Customer A
      expect(useModal().openDialog).toHaveBeenCalledTimes(1);
      expect(useModal().openDialog).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          resolve: { reviewId: 'review-B', scope: 'customer' },
        }),
      );
    });
  });
});
