import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { InferencePlayground } from './InferencePlayground';

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

const typeMessage = () =>
  userEvent.setup().type(screen.getByLabelText('Message input'), 'hello');

const sendDisabled = () =>
  (screen.getByLabelText('Send message') as HTMLButtonElement).disabled;

describe('InferencePlayground', () => {
  it('keeps Send locked while no model is selected, even with text entered', async () => {
    render(
      <InferencePlayground
        endpoint="https://x.test/v1"
        model=""
        apiKey={null}
      />,
    );
    await typeMessage();
    expect(sendDisabled()).toBe(true);
  });

  it('enables Send once a model is selected and text is entered', async () => {
    render(
      <InferencePlayground
        endpoint="https://x.test/v1"
        model="qwen"
        apiKey={null}
      />,
    );
    await typeMessage();
    expect(sendDisabled()).toBe(false);
  });
});
