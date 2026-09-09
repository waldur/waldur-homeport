import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Offering } from 'waldur-js-client';

import { consumePendingAssistantSeed } from '@/ai-assistant/logic/assistantSeed';
import { isAssistantEnabled } from '@/ai-assistant/utils';
import { DrawerProvider } from '@/drawer/DrawerContext';

import { AskAboutOfferingButton } from './AskAboutOfferingButton';

vi.mock('@/ai-assistant/utils', () => ({ isAssistantEnabled: vi.fn() }));

const offering = (overrides: Partial<Offering>) =>
  ({ name: 'Elastic HPC', customer_name: 'CSC', ...overrides }) as Offering;

const renderButton = (value: Offering) =>
  render(
    <DrawerProvider>
      <AskAboutOfferingButton offering={value} />
    </DrawerProvider>,
  );

beforeEach(() => {
  consumePendingAssistantSeed();
  vi.mocked(isAssistantEnabled).mockReturnValue(true);
});

describe('AskAboutOfferingButton', () => {
  it('hands the assistant the offering and its provider', async () => {
    renderButton(offering({}));

    await userEvent.click(screen.getByTestId('offering-ask-assistant'));

    expect(consumePendingAssistantSeed()).toBe(
      'Tell me about Elastic HPC by CSC. Is this service right for me?',
    );
  });

  // `customer_name` is nullable on Offering and the interpolator stringifies
  // whatever it gets, so the provider clause has to be dropped rather than
  // filled with the literal word "null" — which the model would then be asked
  // about.
  it('drops the provider clause when the offering has no customer name', async () => {
    renderButton(offering({ customer_name: null }));

    await userEvent.click(screen.getByTestId('offering-ask-assistant'));

    expect(consumePendingAssistantSeed()).toBe(
      'Tell me about Elastic HPC. Is this service right for me?',
    );
  });

  it('renders nothing when the assistant is not enabled', () => {
    vi.mocked(isAssistantEnabled).mockReturnValue(false);

    renderButton(offering({}));

    expect(screen.queryByTestId('offering-ask-assistant')).toBeNull();
  });
});
