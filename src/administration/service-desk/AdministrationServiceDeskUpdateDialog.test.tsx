import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { overrideSettings } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { AdministrationServiceDeskUpdateDialog } from './AdministrationServiceDeskUpdateDialog';

vi.mock('@/SettingsDescription', () => ({
  SettingsDescription: [
    {
      description: 'Atlassian settings',
      items: [
        {
          key: 'ATLASSIAN_URL',
          description: 'Atlassian URL',
          default: '',
          type: 'string',
        },
        {
          key: 'ATLASSIAN_USE_USERNAME',
          description: 'Use username',
          default: false,
          type: 'boolean',
        },
        {
          key: 'ATLASSIAN_EMAIL',
          description: 'Atlassian email',
          default: '',
          type: 'email_field',
        },
        {
          key: 'ATLASSIAN_DESCRIPTION',
          description: 'Atlassian description',
          default: '',
          type: 'text_field',
        },
        {
          key: 'ATLASSIAN_PORT',
          description: 'Atlassian port',
          default: 80,
          type: 'integer',
        },
        {
          key: 'ATLASSIAN_TOKEN',
          description: 'Atlassian token',
          default: '',
          type: 'secret_field',
        },
        {
          key: 'ATLASSIAN_EXTRA',
          description: 'Atlassian extra data',
          default: {},
          type: 'dict_field',
        },
      ],
    },
  ],
}));

const renderDialog = (props: any) => {
  renderWithProviders(<AdministrationServiceDeskUpdateDialog {...props} />);
};

describe('AdministrationServiceDeskUpdateDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly and submits all field types', async () => {
    const user = userEvent.setup();
    vi.mocked(overrideSettings).mockResolvedValue({} as any);

    renderDialog({
      resolve: {
        name: 'atlassian',
        initialValues: {
          ATLASSIAN_URL: 'https://example.com',
          ATLASSIAN_USE_USERNAME: false,
          ATLASSIAN_EMAIL: 'old@example.com',
          ATLASSIAN_DESCRIPTION: 'old text',
          ATLASSIAN_PORT: 80,
          ATLASSIAN_TOKEN: 'old-secret',
          ATLASSIAN_EXTRA: { key: 'value' },
          OTHER_FIELD: 'should not be submitted',
        },
      },
    });

    expect(
      await screen.findByText(/Update Atlassian settings/i),
    ).toBeInTheDocument();

    // 1. String
    const urlInput = screen.getByLabelText(/Atlassian URL/i);
    expect(urlInput).toHaveValue('https://example.com');
    await user.clear(urlInput);
    await user.type(urlInput, 'https://new-example.com');

    // 2. Boolean
    const checkbox = screen.getByLabelText(/Use username/i);
    expect(checkbox).not.toBeChecked();
    await user.click(checkbox);

    // 3. Email
    const emailInput = screen.getByLabelText(/Atlassian email/i);
    expect(emailInput).toHaveValue('old@example.com');
    await user.clear(emailInput);
    await user.type(emailInput, 'new@example.com');

    // 4. Text
    const textInput = screen.getByLabelText(/Atlassian description/i);
    expect(textInput).toHaveValue('old text');
    await user.clear(textInput);
    await user.type(textInput, 'new text');

    // 5. Integer
    const intInput = screen.getByLabelText(/Atlassian port/i);
    expect(intInput).toHaveValue(80);
    await user.clear(intInput);
    await user.type(intInput, '8080');

    // 6. Secret
    const secretInput = screen.getByLabelText(/Atlassian token/i);
    expect(secretInput).toHaveValue('old-secret');
    await user.clear(secretInput);
    await user.type(secretInput, 'new-secret');

    // 7. Dict
    const dictInput = screen.getByLabelText(/Atlassian extra data/i);
    expect(dictInput).toHaveValue('{\n  "key": "value"\n}');
    await user.clear(dictInput);
    await user.click(dictInput);
    await user.paste('{"newKey": "newValue"}');

    // Submit
    await user.click(screen.getByRole('button', { name: /Update/i }));

    await waitFor(() => {
      expect(overrideSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          body: {
            ATLASSIAN_URL: 'https://new-example.com',
            ATLASSIAN_USE_USERNAME: true,
            ATLASSIAN_EMAIL: 'new@example.com',
            ATLASSIAN_DESCRIPTION: 'new text',
            ATLASSIAN_PORT: '8080', // Expecting string due to input type="number" without parse={Number}
            ATLASSIAN_TOKEN: 'new-secret',
            ATLASSIAN_EXTRA: { newKey: 'newValue' },
          },
        }),
      );
    });

    // Check that OTHER_FIELD is NOT submitted
    const callArgs = vi.mocked(overrideSettings).mock.calls[0][0];
    expect(callArgs.body).not.toHaveProperty('OTHER_FIELD');
  });
});
