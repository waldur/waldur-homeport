import { render, screen } from '@testing-library/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { describe, expect, it, vi } from 'vitest';

import { ReviewViewAction } from './ReviewViewAction';

vi.mock('@/resource/actions/ActionItem', () => ({
  ActionItem: ({ title }) => <span>{title}</span>,
}));

const renderOn = (state: { name: string; parent?: string }, reviewState) => {
  vi.mocked(useCurrentStateAndParams).mockReturnValue({
    state,
    params: {},
  } as any);
  return render(
    <ReviewViewAction row={{ uuid: 'review-1', state: reviewState }} />,
  );
};

const ownList = { name: 'reviews-all-reviews', parent: 'reviews' };

describe('ReviewViewAction', () => {
  it('lets the reviewer read a review they submitted', () => {
    renderOn(ownList, 'submitted');
    expect(screen.getByText('View review')).toBeInTheDocument();
  });

  it('lets the reviewer read a review they sent back', () => {
    renderOn(ownList, 'rejected');
    expect(screen.getByText('View review')).toBeInTheDocument();
  });

  it('lets the reviewer continue a review in progress', () => {
    renderOn(ownList, 'in_review');
    expect(screen.getByText('Continue review')).toBeInTheDocument();
  });

  it('offers call managers to view any review', () => {
    renderOn({ name: 'call-management.review-list' }, 'submitted');
    expect(screen.getByText('View')).toBeInTheDocument();
  });

  it('offers nothing on another list for a finished review', () => {
    const { container } = renderOn({ name: 'admin-reviews' }, 'submitted');
    expect(container).toBeEmptyDOMElement();
  });
});
