import { render, screen } from '@testing-library/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import FormTable from '@/form/FormTable';
import { useUser } from '@/workspace/hooks';

import { FieldRow } from './FieldRow';

const siteName = {
  key: 'SITE_NAME',
  description: 'Human-friendly name of the deployment.',
  default: 'Waldur',
  type: 'string',
};

const freeipaPassword = {
  key: 'FREEIPA_PASSWORD',
  description: 'Password of FreeIPA user.',
  default: 'secret',
  type: 'secret_field',
};

const renderRow = (item, value) =>
  render(
    <FormTable>
      <FieldRow item={item} value={value} />
    </FormTable>,
  );

describe('FieldRow', () => {
  beforeEach(() => {
    vi.mocked(useUser).mockReturnValue({ is_staff: true } as any);
    vi.mocked(useCurrentStateAndParams).mockReturnValue({
      state: { name: 'admin-branding' } as any,
      params: {},
    });
  });

  it('anchors the row and highlights it when linked with ?setting=', () => {
    vi.mocked(useCurrentStateAndParams).mockReturnValue({
      state: { name: 'admin-branding' } as any,
      params: { setting: 'SITE_NAME' },
    });
    renderRow(siteName, 'Waldur');

    const row = screen.getByRole('row', { name: /Site name/ });
    expect(row).toHaveAttribute('id', 'setting-SITE_NAME');
    expect(row).toHaveClass('bg-warning-subtle');
  });

  it('marks a value that differs from the default', () => {
    renderRow(siteName, 'My Cloud');

    expect(screen.getByText('Modified')).toBeInTheDocument();
  });

  it('does not mark a secret that was blanked for a support user', () => {
    vi.mocked(useUser).mockReturnValue({ is_support: true } as any);
    renderRow(freeipaPassword, '');

    expect(screen.queryByText('Modified')).not.toBeInTheDocument();
  });
});
