import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'react-final-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as config from '@/core/config';

import { UsernameGroup, validateUsername } from './UsernameGroup';

vi.mock('@/core/config', () => ({
  ENV: {
    plugins: {
      WALDUR_CORE: {
        FREEIPA_USERNAME_PREFIX: '',
      },
    },
  },
}));

const renderComponent = (props = {}) => {
  return render(
    <Form
      onSubmit={() => {}}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <UsernameGroup {...props} />
        </form>
      )}
    />,
  );
};

describe('UsernameGroup', () => {
  it('renders with default props', () => {
    renderComponent();
    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument(); // Required indicator
    // Description is provided, which renders question mark icon in the FormGroup
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders with custom props', () => {
    renderComponent({
      label: 'Custom Username',
      description: 'Custom help text',
      required: false,
    });
    expect(screen.getByText('Custom Username')).toBeInTheDocument();
    expect(screen.queryByText('*')).not.toBeInTheDocument();
    // Description is provided, which renders question mark icon in the FormGroup
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('shows username prefix when configured', () => {
    vi.mocked(config).ENV = {
      plugins: {
        WALDUR_CORE: {
          FREEIPA_USERNAME_PREFIX: 'waldur_',
        },
      },
    } as any;

    renderComponent();
    expect(screen.getByText('waldur_')).toBeInTheDocument();
  });

  it('allows entering username', async () => {
    renderComponent();
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'testuser');
    expect(input).toHaveValue('testuser');
  });

  it('supports autofocus', () => {
    renderComponent({ autoFocus: true });
    const input = screen.getByRole('textbox');
    expect(input).toHaveFocus();
  });

  it('supports disabled state', () => {
    renderComponent({ disabled: true });
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('supports data-testid', () => {
    renderComponent({ 'data-testid': 'username-field' });
    expect(screen.getByTestId('username-field')).toBeInTheDocument();
  });
});

describe('validateUsername', () => {
  beforeEach(() => {
    vi.mocked(config).ENV = {
      plugins: {
        WALDUR_CORE: {
          FREEIPA_USERNAME_PREFIX: '',
        },
      },
    } as any;
  });

  it('requires username', () => {
    expect(validateUsername('')).toBe('Username is required.');
    expect(validateUsername(null as any)).toBe('Username is required.');
  });

  it('validates minimum length', () => {
    expect(validateUsername('ab')).toBe(
      'Minimum username length is 3 characters.',
    );
    expect(validateUsername('abc')).toBeUndefined();
  });

  it('validates pattern', () => {
    expect(validateUsername('invalid@username')).toBe(
      'Usernames can contain letters (a-z), numbers (0-9), dashes (-), underscores (_) and periods (.).',
    );
    expect(validateUsername('valid_username')).toBeUndefined();
  });

  it('validates maximum length with prefix', () => {
    vi.mocked(config).ENV = {
      plugins: {
        WALDUR_CORE: {
          FREEIPA_USERNAME_PREFIX: 'prefix_',
        },
      },
    } as any;

    const longUsername = 'a'.repeat(30); // 30 + 7 (prefix_) = 37 > 32
    expect(validateUsername(longUsername)).toBe(
      'Maximum username length with mandatory username prefix is 32 characters.',
    );
  });

  it('accepts valid usernames', () => {
    expect(validateUsername('validuser')).toBeUndefined();
    expect(validateUsername('valid_user')).toBeUndefined();
    expect(validateUsername('valid.user')).toBeUndefined();
    expect(validateUsername('valid-user')).toBeUndefined();
    expect(validateUsername('user123')).toBeUndefined();
  });
});
