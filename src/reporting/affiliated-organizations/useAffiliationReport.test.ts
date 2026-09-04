import { describe, expect, it } from 'vitest';
import {
  AffiliatedOrganization,
  AffiliatedOrganizationReportRow,
} from 'waldur-js-client';

import { buildAffiliationReport } from './useAffiliationReport';

const organization = (
  uuid: string,
  overrides: Partial<AffiliatedOrganization> = {},
): AffiliatedOrganization =>
  ({
    uuid,
    url: `/api/affiliated-organizations/${uuid}/`,
    name: uuid,
    code: uuid.toUpperCase(),
    created: '2026-01-01T00:00:00Z',
    modified: '2026-01-01T00:00:00Z',
    projects_count: 0,
    ...overrides,
  }) as AffiliatedOrganization;

const reportRow = (
  overrides: Partial<AffiliatedOrganizationReportRow>,
): AffiliatedOrganizationReportRow => ({
  org_uuid: null,
  org_name: 'Unaffiliated',
  org_abbreviation: '',
  projects_count: 0,
  resources_count: 0,
  estimated_cost: '0',
  ...overrides,
});

describe('buildAffiliationReport', () => {
  it('keeps the unaffiliated bucket and derives coverage from it', () => {
    const report = buildAffiliationReport(
      [
        reportRow({
          org_uuid: 'cern',
          org_name: 'CERN',
          org_abbreviation: 'CERN',
          projects_count: 3,
          resources_count: 7,
          estimated_cost: '120.50',
        }),
        reportRow({ projects_count: 1, estimated_cost: '10' }),
      ],
      [organization('cern', { country: 'CH' })],
    );

    expect(report.rows).toHaveLength(2);
    const unaffiliated = report.rows.find((row) => row.org_uuid === null);
    expect(unaffiliated?.projects_count).toBe(1);

    expect(report.summary.affiliatedProjects).toBe(3);
    expect(report.summary.unaffiliatedProjects).toBe(1);
    expect(report.summary.coverage).toBe(75);
    expect(report.summary.totalCost).toBe(130.5);
  });

  it('joins code and country in from the organization registry', () => {
    const report = buildAffiliationReport(
      [reportRow({ org_uuid: 'embl', org_name: 'EMBL', projects_count: 2 })],
      [organization('embl', { code: 'EMBL', country: 'DE' })],
    );

    expect(report.rows[0]).toMatchObject({ code: 'EMBL', country: 'DE' });
  });

  it('rolls affiliated rows up by country, bucketing unknown countries', () => {
    const report = buildAffiliationReport(
      [
        reportRow({
          org_uuid: 'a',
          projects_count: 2,
          resources_count: 1,
          estimated_cost: '5',
        }),
        reportRow({
          org_uuid: 'b',
          projects_count: 4,
          resources_count: 3,
          estimated_cost: '7',
        }),
        reportRow({ org_uuid: 'c', projects_count: 1 }),
        reportRow({ projects_count: 9 }),
      ],
      [
        organization('a', { country: 'CH' }),
        organization('b', { country: 'CH' }),
        organization('c'),
      ],
    );

    expect(report.byCountry).toEqual([
      {
        country: 'CH',
        organizations: 2,
        projects_count: 6,
        resources_count: 4,
        estimated_cost: 12,
      },
      {
        country: null,
        organizations: 1,
        projects_count: 1,
        resources_count: 0,
        estimated_cost: 0,
      },
    ]);
  });

  it('orders affiliations by project count and keeps the bucket last', () => {
    const report = buildAffiliationReport(
      [
        reportRow({ org_uuid: 'small', org_name: 'Small', projects_count: 2 }),
        reportRow({ projects_count: 99 }),
        reportRow({ org_uuid: 'big', org_name: 'Big', projects_count: 40 }),
      ],
      [organization('small'), organization('big')],
    );

    expect(report.rows.map((row) => row.org_name)).toEqual([
      'Big',
      'Small',
      'Unaffiliated',
    ]);
  });

  it('reports no coverage when the registry and the projects are empty', () => {
    const report = buildAffiliationReport([], []);

    expect(report.rows).toEqual([]);
    expect(report.summary.coverage).toBeNull();
    expect(report.summary.organizations).toBe(0);
    expect(report.summary.withProjects).toBe(0);
  });
});
