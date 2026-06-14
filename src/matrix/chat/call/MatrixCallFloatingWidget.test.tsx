import { act, render, screen } from '@testing-library/react';
import { FC, PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/drawer/actions', () => ({
  useDrawer: () => ({ openDrawer: vi.fn(), closeDrawer: vi.fn() }),
}));

vi.mock('@/chat/openUnifiedChatDrawer', () => ({
  openUnifiedChatDrawer: vi.fn(),
}));

const h = vi.hoisted(() => ({
  callRoomId: '!abc:s' as string | null,
  callRoomUuid: 'uuid-1' as string | null,
}));

vi.mock('./useMatrixCall', () => ({
  useMatrixCall: () => ({
    callRoomId: h.callRoomId,
    callRoomUuid: h.callRoomUuid,
  }),
}));

import { MatrixCallFloatingWidget } from './MatrixCallFloatingWidget';
import { MatrixCallPortalProvider } from './MatrixCallPortalProvider';

const wrapper: FC<PropsWithChildren> = ({ children }) => (
  <MatrixCallPortalProvider>{children}</MatrixCallPortalProvider>
);

beforeEach(() => {
  sessionStorage.clear();
});

describe('MatrixCallFloatingWidget — chrome', () => {
  it('renders the header with the room name', () => {
    render(<MatrixCallFloatingWidget roomName="Project Alpha" />, { wrapper });
    expect(screen.getByText('Project Alpha')).toBeInTheDocument();
  });

  it('exposes the portal target div via data-testid', () => {
    render(<MatrixCallFloatingWidget roomName="X" />, { wrapper });
    expect(screen.getByTestId('call-widget-portal-target')).toBeInTheDocument();
  });
});

describe('MatrixCallFloatingWidget — drag', () => {
  it('updates position on pointer drag', () => {
    Object.defineProperty(window, 'innerWidth', {
      value: 1024,
      configurable: true,
    });
    Object.defineProperty(window, 'innerHeight', {
      value: 768,
      configurable: true,
    });

    render(<MatrixCallFloatingWidget roomName="X" />, { wrapper });
    // eslint-disable-next-line testing-library/no-node-access
    const header = screen.getByText('X').closest('div')!;

    // jsdom doesn't ship a PointerEvent constructor, and fireEvent strips
    // the pointerId field. Build raw events and dispatch directly so our
    // listener sees matching pointerIds.
    const buildPointerEvent = (
      type: string,
      x: number,
      y: number,
    ): PointerEvent => {
      const ev = new Event(type, { bubbles: true }) as any;
      ev.clientX = x;
      ev.clientY = y;
      ev.pointerId = 1;
      return ev;
    };
    act(() => {
      header.dispatchEvent(buildPointerEvent('pointerdown', 0, 0));
    });
    act(() => {
      window.dispatchEvent(buildPointerEvent('pointermove', -50, -40));
    });
    act(() => {
      window.dispatchEvent(buildPointerEvent('pointerup', -50, -40));
    });

    // Widget is bottom-right anchored; cursor moving up/left grows the offset.
    const stored = JSON.parse(
      sessionStorage.getItem('waldur_matrix_call_widget_pos')!,
    );
    expect(stored.x).toBe(74);
    expect(stored.y).toBe(64);
  });

  it('hydrates position from sessionStorage on mount', () => {
    sessionStorage.setItem(
      'waldur_matrix_call_widget_pos',
      JSON.stringify({ x: 100, y: 80 }),
    );
    const { container } = render(<MatrixCallFloatingWidget roomName="X" />, {
      wrapper,
    });
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const widget = container.querySelector(
      '.matrix-call-widget',
    ) as HTMLElement;
    expect(widget.style.right).toBe('100px');
    expect(widget.style.bottom).toBe('80px');
  });
});
