import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { UIBlock } from '@/ai-assistant/lib/types';
import { subscribeHpcJobSubmitted } from '@/marketplace/resources/details/hpc/queries';

import { HpcJobBlock } from './HpcJobBlock';

vi.mock('@/core/Link', () => ({
  Link: ({ children }) => <span>{children}</span>,
}));

const block = (fields: Partial<UIBlock>): UIBlock => ({
  id: 'b1',
  key: 'hpc_job',
  content: '',
  status: 'complete',
  name: 'matmul-bench',
  allocation_uuid: 'alloc-1',
  ...fields,
});

describe('HpcJobBlock', () => {
  it('tells the allocation jobs table about a submitted job once', () => {
    const onSubmitted = vi.fn();
    const unsubscribe = subscribeHpcJobSubmitted('alloc-1', onSubmitted);
    const submitted = block({ job_status: 'submitted', job_id: '90' });
    const { rerender, unmount } = render(<HpcJobBlock block={submitted} />);
    rerender(<HpcJobBlock block={{ ...submitted }} />);
    unmount();
    // The thread read again: the same card does not refresh the table twice.
    render(<HpcJobBlock block={submitted} />);
    expect(onSubmitted).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it('says nothing for a preview', () => {
    const onSubmitted = vi.fn();
    const unsubscribe = subscribeHpcJobSubmitted('alloc-1', onSubmitted);
    render(<HpcJobBlock block={block({ job_status: 'preview' })} />);
    expect(onSubmitted).not.toHaveBeenCalled();
    unsubscribe();
  });
});
