import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import {
  ScriptPanel,
  ScriptPanelProvider,
} from '@/ai-assistant/components/ScriptPanel';
import { UIBlock } from '@/ai-assistant/lib/types';
import { subscribeHpcJobSubmitted } from '@/marketplace/resources/details/hpc/queries';
import { useModal } from '@/modal/actions';

import { HpcJobBlock } from './HpcJobBlock';

const h = vi.hoisted(() => ({
  expanded: false,
  drawer: { setExpanded: vi.fn() },
}));

vi.mock('@/drawer/actions', () => ({
  useOptionalDrawer: () => h.drawer,
}));

vi.mock('@/drawer/useDrawerExpanded', () => ({
  useDrawerExpanded: () => h.expanded,
}));

vi.mock('@/core/Link', () => ({
  isModifiedClick: (e) => e.ctrlKey || e.metaKey,
  Link: ({ children, params, onClick, role }) => (
    <a
      href="#job"
      data-testid="link"
      data-params={JSON.stringify(params)}
      role={role}
      onClick={(e) => {
        e.preventDefault();
        onClick?.(e);
      }}
    >
      {children}
    </a>
  ),
}));

vi.mock('@/marketplace/resources/details/hpc/HpcScriptViewer', () => ({
  HpcScriptViewer: ({ script }) => <pre data-testid="viewer">{script}</pre>,
}));

const longScript = Array.from({ length: 40 }, (_, i) => `line ${i + 1}`).join(
  '\n',
);

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

describe('HpcJobBlock script', () => {
  it('folds a long script in the narrow drawer and opens it in a dialog', async () => {
    h.expanded = false;
    render(
      <HpcJobBlock
        block={block({ job_status: 'preview', script: longScript })}
      />,
    );
    expect(screen.getByText(/line 12$/m)).toBeInTheDocument();
    expect(screen.queryByText(/line 13$/m)).not.toBeInTheDocument();
    await userEvent.click(screen.getByText('Show all 40 lines'));
    expect(screen.getByText(/line 40$/m)).toBeInTheDocument();
    await userEvent.click(screen.getByText('View script'));
    expect(useModal().openDialog).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        resolve: expect.objectContaining({ script: longScript }),
      }),
    );
  });

  it('links a submitted job to the jobs table instead of its script', () => {
    h.expanded = false;
    render(
      <HpcJobBlock
        block={block({
          job_status: 'submitted',
          job_id: '91',
          script: longScript,
        })}
      />,
    );
    expect(screen.queryByText(/line 1$/m)).not.toBeInTheDocument();
    expect(screen.getByText('Follow the job')).toBeInTheDocument();
    expect(JSON.parse(screen.getByTestId('link').dataset.params)).toEqual({
      resource_uuid: 'alloc-1',
      tab: 'hpc-jobs',
      object: '91',
    });
  });

  it('shows the latest script beside the full-screen chat', async () => {
    h.expanded = true;
    render(
      <ScriptPanelProvider>
        <HpcJobBlock
          block={block({ name: 'first', job_status: 'preview', script: 'one' })}
        />
        <HpcJobBlock
          block={block({
            name: 'second',
            job_status: 'preview',
            script: 'two',
          })}
        />
        <ScriptPanel />
      </ScriptPanelProvider>,
    );
    // Not inline: only the panel has it.
    expect(screen.getAllByText('two')).toHaveLength(1);
    expect(screen.getByTestId('viewer')).toHaveTextContent('two');
    await userEvent.click(screen.getAllByText('View script')[0]);
    expect(screen.getByTestId('viewer')).toHaveTextContent('one');
    await userEvent.click(screen.getByRole('button', { name: 'Hide script' }));
    expect(screen.queryByTestId('viewer')).not.toBeInTheDocument();
  });
});

describe('HpcJobBlock script panel', () => {
  const first = block({ name: 'first', job_status: 'preview', script: 'one' });
  const second = block({
    name: 'second',
    job_status: 'preview',
    script: 'two',
  });

  it('reopens for a new job, not for a card mounted again', async () => {
    h.expanded = true;
    const { rerender } = render(
      <ScriptPanelProvider>
        <HpcJobBlock key="a" block={first} />
        <ScriptPanel />
      </ScriptPanelProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Hide script' }));
    // The thread read again: the same card, mounted anew.
    rerender(
      <ScriptPanelProvider>
        <HpcJobBlock key="b" block={first} />
        <ScriptPanel />
      </ScriptPanelProvider>,
    );
    expect(screen.queryByTestId('viewer')).not.toBeInTheDocument();
    rerender(
      <ScriptPanelProvider>
        <HpcJobBlock key="b" block={first} />
        <HpcJobBlock key="c" block={second} />
        <ScriptPanel />
      </ScriptPanelProvider>,
    );
    expect(screen.getByTestId('viewer')).toHaveTextContent('two');
  });

  it('forgets a card that leaves the thread', () => {
    h.expanded = true;
    const { rerender } = render(
      <ScriptPanelProvider>
        <HpcJobBlock key="a" block={first} />
        <ScriptPanel />
      </ScriptPanelProvider>,
    );
    expect(screen.getByTestId('viewer')).toHaveTextContent('one');
    rerender(
      <ScriptPanelProvider>
        <ScriptPanel />
      </ScriptPanelProvider>,
    );
    expect(screen.queryByTestId('viewer')).not.toBeInTheDocument();
  });
});

describe('HpcJobBlock follow link', () => {
  const submitted = block({ job_status: 'submitted', job_id: '91' });

  it('is a link, and makes room for the jobs table on a plain click', async () => {
    h.drawer.setExpanded.mockClear();
    render(<HpcJobBlock block={submitted} />);
    const link = screen.getByRole('link', { name: /Follow the job/ });
    await userEvent.click(link);
    expect(h.drawer.setExpanded).toHaveBeenCalledWith(false);
  });

  it('leaves the chat as it is for a new tab', async () => {
    h.drawer.setExpanded.mockClear();
    render(<HpcJobBlock block={submitted} />);
    const user = userEvent.setup();
    await user.keyboard('{Control>}');
    await user.click(screen.getByRole('link', { name: /Follow the job/ }));
    await user.keyboard('{/Control}');
    expect(h.drawer.setExpanded).not.toHaveBeenCalled();
  });
});
