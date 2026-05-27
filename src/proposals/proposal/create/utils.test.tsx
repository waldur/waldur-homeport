import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  Proposal,
  proposalProposalsApprove,
  proposalProposalsReject,
} from 'waldur-js-client';

import * as workspaceHooks from '@/workspace/hooks';

import { useProposalDecisionActions } from './utils';
vi.mock('@/workspace/hooks');

const mockConfirm = vi.fn();

vi.mock('waldur-js-client');
vi.mock('@/modal/actions', () => ({
  useModal: () => ({ confirm: mockConfirm, closeDialog: vi.fn() }),
}));

const mockShowSuccess = vi.fn();
const mockShowErrorResponse = vi.fn();

vi.mock('@/store/notify', () => ({
  useNotify: () => ({
    showSuccess: mockShowSuccess,
    showErrorResponse: mockShowErrorResponse,
  }),
}));

vi.mock('@/i18n', () => ({
  translate: (key: string, context?: any) => {
    if (context) {
      return key.replace(/\{(\w+)\}/g, (match, prop) => context[prop] || match);
    }
    return key;
  },
}));

describe('useProposalDecisionActions', () => {
  const mockProposal: Proposal = {
    uuid: 'test-proposal-uuid',
    name: 'Test Proposal',
    state: 'submitted' as const,
    call_uuid: 'test-call-uuid',
  } as Proposal;

  const mockUser = {
    uuid: 'test-user-uuid',
    is_staff: true,
    permissions: [],
  };

  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(workspaceHooks.useUser).mockReturnValue(mockUser as any);

    mockConfirm.mockResolvedValue({ input: undefined });
    vi.mocked(proposalProposalsApprove).mockResolvedValue({} as any);
    vi.mocked(proposalProposalsReject).mockResolvedValue({} as any);
  });

  const renderUseProposalDecisionActions = (proposal = mockProposal) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    return renderHook(() => useProposalDecisionActions(proposal, mockRefetch), {
      wrapper,
    });
  };

  describe('canPerformDecisionActions', () => {
    it('should return true when proposal state is valid and user has permission', () => {
      const { result } = renderUseProposalDecisionActions();
      expect(result.current.canPerformDecisionActions).toBe(true);
    });

    it('should return false when proposal state is invalid', () => {
      const invalidProposal = { ...mockProposal, state: 'accepted' as const };
      const { result } = renderUseProposalDecisionActions(invalidProposal);
      expect(result.current.canPerformDecisionActions).toBe(false);
    });

    it('should allow actions for in_review state', () => {
      const reviewProposal = { ...mockProposal, state: 'in_review' as const };
      const { result } = renderUseProposalDecisionActions(reviewProposal);
      expect(result.current.canPerformDecisionActions).toBe(true);
    });
  });

  describe('handleApproveProposal', () => {
    it('should show confirmation dialog with correct message', async () => {
      const { result } = renderUseProposalDecisionActions();

      result.current.handleApproveProposal();

      await waitFor(() => {
        expect(mockConfirm).toHaveBeenCalledWith(
          'Confirmation',
          'Are you sure you want to approve the proposal Test Proposal in state submitted?',
          undefined,
        );
      });
    });

    it('should call API and show success message on approval', async () => {
      const { result } = renderUseProposalDecisionActions();

      result.current.handleApproveProposal();

      await waitFor(() => {
        expect(proposalProposalsApprove).toHaveBeenCalledWith({
          path: { uuid: mockProposal.uuid },
        });
      });
      expect(mockShowSuccess).toHaveBeenCalledWith(
        'Proposal has been approved.',
      );
      expect(mockRefetch).toHaveBeenCalled();
    });

    it('should handle API error and show error message', async () => {
      const error = new Error('API Error');
      vi.mocked(proposalProposalsApprove).mockRejectedValue(error);

      const { result } = renderUseProposalDecisionActions();

      result.current.handleApproveProposal();

      await waitFor(() => {
        expect(mockShowErrorResponse).toHaveBeenCalledWith(
          error,
          'Unable to approve the proposal.',
        );
      });
      expect(mockRefetch).not.toHaveBeenCalled();
    });
  });

  describe('handleRejectProposal', () => {
    it('should show confirmation dialog with input field', async () => {
      const { result } = renderUseProposalDecisionActions();

      result.current.handleRejectProposal();

      await waitFor(() => {
        expect(mockConfirm).toHaveBeenCalledWith(
          'Confirmation',
          'Are you sure you want to reject the proposal: Test Proposal?',
          {
            showInput: true,
            inputLabel: 'Rejection reason',
            inputPlaceholder: 'Enter reason for rejection',
            inputRequired: true,
          },
        );
      });
    });

    it('should call API with rejection reason and show success message', async () => {
      const rejectionReason = 'Insufficient budget';
      mockConfirm.mockResolvedValue({
        input: rejectionReason,
      });

      const { result } = renderUseProposalDecisionActions();

      result.current.handleRejectProposal();

      await waitFor(() => {
        expect(proposalProposalsReject).toHaveBeenCalledWith({
          path: { uuid: mockProposal.uuid },
          body: { allocation_comment: rejectionReason },
        });
      });
      expect(mockShowSuccess).toHaveBeenCalledWith(
        'Proposal has been rejected.',
      );
      expect(mockRefetch).toHaveBeenCalled();
    });

    it('should call API with empty reason when no input provided', async () => {
      mockConfirm.mockResolvedValue({ input: '' });

      const { result } = renderUseProposalDecisionActions();

      result.current.handleRejectProposal();

      await waitFor(() => {
        expect(proposalProposalsReject).toHaveBeenCalledWith({
          path: { uuid: mockProposal.uuid },
          body: { allocation_comment: '' },
        });
      });
    });

    it('should handle API error and show error message', async () => {
      const error = new Error('API Error');
      vi.mocked(proposalProposalsReject).mockRejectedValue(error);

      const { result } = renderUseProposalDecisionActions();

      result.current.handleRejectProposal();

      await waitFor(() => {
        expect(mockShowErrorResponse).toHaveBeenCalledWith(
          error,
          'Unable to reject the proposal.',
        );
      });
      expect(mockRefetch).not.toHaveBeenCalled();
    });

    it('should handle undefined rejection reason', async () => {
      mockConfirm.mockResolvedValue({ input: undefined });

      const { result } = renderUseProposalDecisionActions();

      result.current.handleRejectProposal();

      await waitFor(() => {
        expect(proposalProposalsReject).toHaveBeenCalledWith({
          path: { uuid: mockProposal.uuid },
          body: { allocation_comment: undefined },
        });
      });
    });
  });

  describe('integration with multiple proposal states', () => {
    it.each([
      ['submitted' as const, true],
      ['in_review' as const, true],
      ['accepted' as const, false],
      ['rejected' as const, false],
      ['draft' as const, false],
    ])('should handle %s state correctly', (state, expectedCanPerform) => {
      const proposal = { ...mockProposal, state };
      const { result } = renderUseProposalDecisionActions(proposal);

      expect(result.current.canPerformDecisionActions).toBe(expectedCanPerform);
    });
  });

  describe('error handling edge cases', () => {
    it('should handle network timeout errors', async () => {
      const timeoutError = new Error('Network timeout');
      timeoutError.name = 'TimeoutError';
      vi.mocked(proposalProposalsApprove).mockRejectedValue(timeoutError);

      const { result } = renderUseProposalDecisionActions();

      result.current.handleApproveProposal();

      await waitFor(() => {
        expect(mockShowErrorResponse).toHaveBeenCalledWith(
          timeoutError,
          'Unable to approve the proposal.',
        );
      });
    });

    it('should handle rejection API errors with detailed error message', async () => {
      const detailedError = {
        response: {
          data: { detail: 'Proposal is already processed' },
          status: 400,
        },
      };
      vi.mocked(proposalProposalsReject).mockRejectedValue(detailedError);

      const { result } = renderUseProposalDecisionActions();

      result.current.handleRejectProposal();

      await waitFor(() => {
        expect(mockShowErrorResponse).toHaveBeenCalledWith(
          detailedError,
          'Unable to reject the proposal.',
        );
      });
    });
  });
});
