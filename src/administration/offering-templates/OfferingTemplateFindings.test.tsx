import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OfferingTemplate } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import {
  OfferingTemplateFindingsBadges,
  OfferingTemplateFindingsTable,
} from './OfferingTemplateFindings';

const template = (findings: OfferingTemplate['configuration_findings']) =>
  ({ configuration_findings: findings }) as OfferingTemplate;

const ERROR = {
  rule: 'slurm_component_tres',
  severity: 'error',
  field: 'components.2.type',
  message: 'storage is not a SLURM TRES name.',
} as const;
const WARNING = {
  rule: 'slurm_component_billing_type',
  severity: 'warning',
  field: 'components.0.billing_type',
  message: 'cpu is billed fixed.',
} as const;

describe('OfferingTemplateFindingsBadges', () => {
  it('counts errors and warnings', () => {
    renderWithProviders(
      <OfferingTemplateFindingsBadges
        row={template([ERROR, ERROR, WARNING])}
      />,
    );
    expect(screen.getByText('2 errors')).toBeInTheDocument();
    expect(screen.getByText('1 warning')).toBeInTheDocument();
  });

  it('shows nothing for a consistent template', () => {
    renderWithProviders(<OfferingTemplateFindingsBadges row={template([])} />);
    expect(screen.queryByTestId('offering-template-findings')).toBeNull();
  });

  it('shows nothing when the field is absent, as for non-staff', () => {
    renderWithProviders(
      <OfferingTemplateFindingsBadges row={{} as OfferingTemplate} />,
    );
    expect(screen.queryByTestId('offering-template-findings')).toBeNull();
  });
});

describe('OfferingTemplateFindingsTable', () => {
  it('lists each finding with its field and message', () => {
    renderWithProviders(
      <OfferingTemplateFindingsTable row={template([ERROR, WARNING])} />,
    );
    expect(screen.getByText('components.2.type')).toBeInTheDocument();
    expect(
      screen.getByText('storage is not a SLURM TRES name.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Warning')).toBeInTheDocument();
  });
});
