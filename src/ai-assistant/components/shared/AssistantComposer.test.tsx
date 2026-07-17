import {
  AssistantRuntimeProvider,
  useExternalStoreRuntime,
} from '@assistant-ui/react';
import { render, screen } from '@testing-library/react';
import { FC } from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { AssistantComposer } from './AssistantComposer';

const Harness: FC<{ disabled?: boolean }> = ({ disabled }) => {
  const runtime = useExternalStoreRuntime({
    isRunning: false,
    messages: [],
    onNew: async () => {},
  });
  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <AssistantComposer placeholder="Ask…" disabled={disabled} />
    </AssistantRuntimeProvider>
  );
};

beforeAll(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

const sendButton = () =>
  screen.getByLabelText('Send message') as HTMLButtonElement;

describe('AssistantComposer', () => {
  it('keeps Send disabled on an empty composer when no disabled prop is passed', () => {
    render(<Harness />);
    expect(sendButton().disabled).toBe(true);
  });

  it('disables Send when the disabled prop is set', () => {
    render(<Harness disabled />);
    expect(sendButton().disabled).toBe(true);
  });
});
