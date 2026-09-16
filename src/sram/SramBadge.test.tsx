import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ENV } from '@/core/config';

import { SramGrantBadge, SramRoleBadge, SramTeamMarker } from './SramBadge';

const enable = (on: boolean) => {
  (ENV.plugins.WALDUR_CORE as any).SRAM_INTEGRATION_ENABLED = on;
  (ENV as any).FEATURES = { sram: { integration: on } };
};

describe('SRAM badges', () => {
  beforeEach(() => enable(true));
  afterEach(() => {
    delete (ENV.plugins.WALDUR_CORE as any).SRAM_INTEGRATION_ENABLED;
    (ENV as any).FEATURES = {};
  });

  it('marks a grant made by SRAM', () => {
    render(<SramGrantBadge source="sram-rule:abc:def" />);
    expect(screen.getByTestId('sram-badge')).toHaveTextContent('SRAM');
  });

  it('does not mark a manual grant', () => {
    render(<SramGrantBadge source="" />);
    expect(screen.queryByTestId('sram-badge')).not.toBeInTheDocument();
  });

  it('marks a placeholder role', () => {
    render(<SramRoleBadge roleName="CUSTOMER.ufra.SRAM.research" />);
    expect(screen.getByTestId('sram-badge')).toBeInTheDocument();
  });

  it('falls back to the role for rows without a source', () => {
    render(<SramTeamMarker roleName="CUSTOMER.ufra.SRAM.research" />);
    expect(screen.getByTestId('sram-badge')).toBeInTheDocument();
  });

  it('shows one badge for an SRAM grant of a placeholder role', () => {
    render(
      <SramTeamMarker
        source="sram:9d863b8a"
        roleName="CUSTOMER.ufra.SRAM.research"
      />,
    );
    expect(screen.getAllByTestId('sram-badge')).toHaveLength(1);
  });

  it('shows nothing while the SRAM UI is off', () => {
    enable(false);
    render(
      <SramTeamMarker
        source="sram:9d863b8a"
        roleName="CUSTOMER.ufra.SRAM.research"
      />,
    );
    expect(screen.queryByTestId('sram-badge')).not.toBeInTheDocument();
  });
});
