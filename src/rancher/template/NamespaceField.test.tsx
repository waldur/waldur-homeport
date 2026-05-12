import { render, screen } from '@testing-library/react';
import { Form } from 'react-final-form';
import { describe, it, expect, vi } from 'vitest';

import { NamespaceField } from './NamespaceField';

vi.mock('@/i18n', () => ({
  translate: (key) => key,
}));

describe('NamespaceField', () => {
  it('renders select by default', () => {
    render(
      <Form
        onSubmit={vi.fn()}
        initialValues={{ useNewNamespace: false }}
        render={() => (
          <NamespaceField options={[{ name: 'ns-1', url: 'u-1' } as any]} />
        )}
      />,
    );
    // SelectControl renders a select with FormControl (as="select")
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('ns-1')).toBeInTheDocument();
  });

  it('renders input when useNewNamespace is true', () => {
    render(
      <Form
        onSubmit={vi.fn()}
        initialValues={{ useNewNamespace: true }}
        render={() => (
          <NamespaceField options={[{ name: 'ns-1', url: 'u-1' } as any]} />
        )}
      />,
    );
    expect(screen.getByPlaceholderText('e.g. MyApp')).toBeInTheDocument();
  });
});
