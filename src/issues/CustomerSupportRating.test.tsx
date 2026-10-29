import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  supportFeedbackAverageReportRetrieve,
  supportFeedbackReportRetrieve,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { CustomerSupportRating } from './CustomerSupportRating';

const mockReports = (average: unknown, report: Record<string, number>) => {
  vi.mocked(supportFeedbackAverageReportRetrieve).mockResolvedValue({
    data: average,
  } as any);
  vi.mocked(supportFeedbackReportRetrieve).mockResolvedValue({
    data: report,
  } as any);
};

describe('CustomerSupportRating', () => {
  it('shows the average rating and the number of reviews', async () => {
    mockReports(9.5, { 8: 1, 10: 3 });
    renderWithProviders(<CustomerSupportRating />);
    expect(
      await screen.findByText('Customer support satisfaction overall rating'),
    ).toBeInTheDocument();
    expect(screen.getByText('4 reviews')).toBeInTheDocument();
  });

  it('shows nothing when there is no average yet', async () => {
    mockReports(null, {});
    const { container } = renderWithProviders(<CustomerSupportRating />);
    await vi.waitFor(() =>
      expect(supportFeedbackAverageReportRetrieve).toHaveBeenCalled(),
    );
    expect(
      screen.queryByText('Customer support satisfaction overall rating'),
    ).not.toBeInTheDocument();
    expect(container.textContent).not.toContain('reviews');
  });
});
