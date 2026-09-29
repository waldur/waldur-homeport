import { describe, expect, it } from 'vitest';

import { formatUsageValue } from '@/core/formatNumber';

import { buildProposalDocument } from './proposalPdf';

const proposal: any = {
  uuid: 'p1',
  slug: 'ROUND-001',
  name: 'Protein folding at scale',
  state: 'submitted',
  created: '2026-01-15T10:00:00Z',
  created_by_name: 'Ada Lovelace',
  applicant_email: 'ada@example.com',
  applicant_organization: 'Analytical Engines Ltd',
  science_sub_domain_name: 'Structural biology',
  project_summary: 'Fold proteins.',
  call_name: 'HPC 2026',
  round: { name: 'Round 1' },
  supporting_documentation: [{ file_name: 'methodology.pdf' }],
};

const resources: any[] = [
  {
    requested_offering: {
      offering_name: 'HPC',
      components: [
        { type: 'cpu_hours', name: 'CPU hours', measured_unit: 'h' },
        { type: 'storage', name: 'Storage', measured_unit: 'TB' },
      ],
    },
    limits: { cpu_hours: 80000 },
    purchase_order_reference: 'PO-7',
    attachment: 'https://example.com/media/orders/po-7.pdf',
  },
];

const team: any[] = [
  {
    user_full_name: 'Ada Lovelace',
    user_email: 'ada@example.com',
    role_name: 'PI',
  },
];

const flatten = (node: unknown): string => JSON.stringify(node);

describe('buildProposalDocument', () => {
  const document = buildProposalDocument(proposal, resources, team);
  const text = flatten(document.content);

  it('names the proposal and where it was submitted', () => {
    expect(text).toContain('Protein folding at scale');
    expect(text).toContain('ROUND-001');
    expect(text).toContain('HPC 2026');
  });

  // Locale-dependent separator, so compare through the same formatter.
  it('spells the requested amount with its component and unit', () => {
    expect(text).toContain(`CPU hours: ${formatUsageValue(80000)} h`);
  });

  // A component with no amount asked for is not invented as a zero.
  it('leaves out components the proposal did not ask for', () => {
    expect(text).not.toContain('Storage');
  });

  it('carries the applicant, the team and the purchase order', () => {
    expect(text).toContain('ada@example.com');
    expect(text).toContain('PI');
    expect(text).toContain('PO-7');
  });

  // Named, never embedded.
  it('lists attachments by name only', () => {
    expect(text).toContain('methodology.pdf');
    expect(text).toContain('po-7.pdf');
    expect(text).not.toContain('https://example.com/media');
  });

  it('says so when a proposal has no resources or team', () => {
    const empty = flatten(buildProposalDocument(proposal, [], []).content);
    expect(empty).toContain('No resources requested.');
    expect(empty).toContain('No team members.');
  });
});
