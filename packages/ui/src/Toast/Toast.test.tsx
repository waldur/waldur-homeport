import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { Toast, ToastProvider, ToastViewport } from './Toast';

describe('Toast', () => {
  beforeAll(() => {
    window.HTMLElement.prototype.hasPointerCapture = vi.fn();
    window.HTMLElement.prototype.setPointerCapture = vi.fn();
    window.HTMLElement.prototype.releasePointerCapture = vi.fn();
  });

  const renderToast = (props: Partial<Parameters<typeof Toast>[0]> = {}) => {
    const onOpenChange = vi.fn();
    const result = render(
      <ToastProvider>
        <Toast
          open={true}
          onOpenChange={onOpenChange}
          title="Notification Title"
          message="Notification Message"
          variant="success"
          {...props}
        />
        <ToastViewport />
      </ToastProvider>,
    );
    return { ...result, onOpenChange };
  };

  it('renders title and message correctly', () => {
    renderToast();

    expect(screen.getByText('Notification Title')).toBeInTheDocument();
    expect(screen.getByText('Notification Message')).toBeInTheDocument();
  });

  it('carries a toast-item-{variant} class as a stable E2E hook', () => {
    // waldur-integration-testing's tests/components/base.py locates toasts
    // by this class (`.toast-item-{status}`) — it lives in a separate repo
    // this package can't type-check against, so losing this silently only
    // shows up as that suite's E2E tests failing to find a toast at all.
    const { container } = renderToast({ variant: 'success' });

    // Asserting a CSS class hook, not user-facing behavior — no semantic
    // query for this.
    // eslint-disable-next-line testing-library/no-node-access
    expect(container.querySelector('.toast-item-success')).not.toBeNull();
  });

  it('renders action buttons and handles clicks', async () => {
    const user = userEvent.setup();
    const onActionClick = vi.fn();
    const { onOpenChange } = renderToast({
      actions: [
        { label: 'Undo', onClick: onActionClick, primary: true },
        { label: 'Cancel' },
      ],
    });

    const undoButton = screen.getByRole('button', { name: 'Undo' });
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });

    expect(undoButton).toBeInTheDocument();
    expect(cancelButton).toBeInTheDocument();

    await user.click(undoButton);
    expect(onActionClick).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('calls onOpenChange(false) when dismiss button is clicked', async () => {
    const user = userEvent.setup();
    const { onOpenChange } = renderToast();

    const dismissButton = screen.getByRole('button', { name: 'Dismiss' });
    expect(dismissButton).toBeInTheDocument();

    await user.click(dismissButton);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
