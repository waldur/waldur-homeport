import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  Attribute,
  marketplaceAttributesCreate,
  marketplaceAttributesPartialUpdate,
  Section,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import {
  AttributeFormDialog,
  buildAttributeRequest,
} from './AttributeFormDialog';

const section = {
  url: 'https://example.com/api/marketplace-sections/hpc_support/',
  key: 'hpc_support',
  title: 'Support',
} as Section;

const values = (overrides = {}) => ({
  title: 'Delivery',
  type: 'choice' as const,
  required: false,
  options: [],
  default: null,
  ...overrides,
});

describe('buildAttributeRequest', () => {
  it('keeps saved option keys and generates unique keys for new options', () => {
    const request = buildAttributeRequest(
      values({
        options: [
          { ref: 'online', key: 'online', title: 'Online' },
          { ref: '__new_1', title: 'Online' },
          { ref: '__new_2', title: 'On site' },
          { ref: '__new_3', title: '   ' },
        ],
        default: '__new_2',
      }),
      section,
    );
    expect(request.options).toEqual([
      { key: 'online', title: 'Online' },
      { key: 'online_2', title: 'Online' },
      { key: 'on_site', title: 'On site' },
    ]);
    expect(request.default).toBe('on_site');
  });

  it('resolves a list default to option keys and drops removed options', () => {
    const request = buildAttributeRequest(
      values({
        type: 'list',
        options: [{ ref: 'a', key: 'a', title: 'A' }],
        default: ['a', 'removed'],
      }),
      section,
    );
    expect(request.default).toEqual(['a']);
  });

  it('sends no options for a type without options', () => {
    const request = buildAttributeRequest(
      values({
        type: 'string',
        options: [{ ref: 'a', key: 'a', title: 'A' }],
        default: '',
      }),
      section,
    );
    expect(request).not.toHaveProperty('options');
    expect(request.default).toBeNull();
  });

  it('turns an integer default into a number', () => {
    expect(
      buildAttributeRequest(values({ type: 'integer', default: '12' }), section)
        .default,
    ).toBe(12);
  });
});

describe('AttributeFormDialog', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(marketplaceAttributesCreate).mockResolvedValue({} as any);
    vi.mocked(marketplaceAttributesPartialUpdate).mockResolvedValue({} as any);
  });

  it('creates a string attribute in the section', async () => {
    const refetch = vi.fn();
    renderWithProviders(<AttributeFormDialog resolve={{ section, refetch }} />);
    await user.type(await screen.findByLabelText(/Title/), 'Support e-mail');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    await waitFor(() =>
      expect(marketplaceAttributesCreate).toHaveBeenCalledWith({
        body: {
          title: 'Support e-mail',
          section: section.url,
          type: 'string',
          required: false,
          default: null,
        },
      }),
    );
    expect(refetch).toHaveBeenCalled();
  });

  it('adds an option to a saved choice attribute', async () => {
    const attribute = {
      uuid: 'attr-uuid',
      key: 'hpc_support_delivery',
      title: 'Delivery',
      type: 'choice',
      required: false,
      default: 'online',
      options: [
        { uuid: 'o1', key: 'online', title: 'Online', is_default: true },
      ],
    } as unknown as Attribute;
    renderWithProviders(
      <AttributeFormDialog
        resolve={{ section, attribute, refetch: vi.fn() }}
      />,
    );

    expect(await screen.findByText('online')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Add option' }));
    const titles = screen.getAllByLabelText('Option title');
    await user.type(titles[1], 'On site');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(marketplaceAttributesPartialUpdate).toHaveBeenCalledWith({
        path: { uuid: 'attr-uuid' },
        body: expect.objectContaining({
          options: [
            { key: 'online', title: 'Online' },
            { key: 'on_site', title: 'On site' },
          ],
          default: 'online',
        }),
      }),
    );
  });
});

describe('AttributeFormDialog validation', () => {
  const user = userEvent.setup();

  it('rejects a negative number default instead of changing it', async () => {
    renderWithProviders(
      <AttributeFormDialog resolve={{ section, refetch: vi.fn() }} />,
    );
    await user.type(await screen.findByLabelText(/Title/), 'Nodes');
    await user.click(screen.getByLabelText(/Type/));
    await user.click(await screen.findByText('Number'));
    await user.type(screen.getByLabelText(/Default value/), '-1');
    await user.tab();

    expect(
      await screen.findByText('Value should be positive integer'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
  });

  it('asks for at least one option on a choice attribute', async () => {
    renderWithProviders(
      <AttributeFormDialog resolve={{ section, refetch: vi.fn() }} />,
    );
    await user.type(await screen.findByLabelText(/Title/), 'Delivery');
    await user.click(screen.getByLabelText(/Type/));
    await user.click(await screen.findByText('Single choice'));

    expect(
      await screen.findByText('Add at least one option.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();

    // Adding a row registers fields under the array that holds the error.
    await user.click(screen.getByRole('button', { name: 'Add option' }));
    await user.type(screen.getByLabelText('Option title'), 'Online');

    await waitFor(() =>
      expect(
        screen.queryByText('Add at least one option.'),
      ).not.toBeInTheDocument(),
    );
    expect(screen.getByRole('button', { name: 'Add' })).toBeEnabled();
  });
});

describe('buildAttributeRequest key reservation', () => {
  it('does not hand a removed option key to a new option', () => {
    const request = buildAttributeRequest(
      values({ options: [{ ref: '__new_9', title: 'GPU' }] }),
      section,
      ['gpu'],
    );
    expect(request.options).toEqual([{ key: 'gpu_2', title: 'GPU' }]);
  });
});

describe('AttributeFormDialog input checks', () => {
  const user = userEvent.setup();

  it('refuses a title of only spaces', async () => {
    renderWithProviders(
      <AttributeFormDialog resolve={{ section, refetch: vi.fn() }} />,
    );
    await user.type(await screen.findByLabelText(/Title/), '   ');
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
  });

  it('refuses a decimal number default', async () => {
    renderWithProviders(
      <AttributeFormDialog resolve={{ section, refetch: vi.fn() }} />,
    );
    await user.type(await screen.findByLabelText(/Title/), 'Nodes');
    await user.click(screen.getByLabelText(/Type/));
    await user.click(await screen.findByText('Number'));
    await user.type(screen.getByLabelText(/Default value/), '1.5');
    await user.tab();
    expect(
      await screen.findByText('Value should be positive integer'),
    ).toBeInTheDocument();
  });
});
