import { translate } from '@/i18n';
import { Column } from '@/table/types';

import { ReportScope } from './types';

interface OrganizationRow {
  organisation_uuid: string;
  organisation_name: string;
}

/**
 * Whether naming the organization tells the rows apart: only across every
 * organization, and only when the rows come from more than one. A filter
 * naming one organization narrows the rows to it, so it needs no rule of
 * its own.
 */
export const showsOrganization = (
  scope: ReportScope,
  rows: OrganizationRow[],
): boolean =>
  Boolean(scope.global) &&
  new Set(rows.map((row) => row.organisation_uuid)).size > 1;

/**
 * The call-managing organization of a row's call, in the reports across
 * every organization. Hidden but still exported when every row is of one.
 */
export const organizationColumns = <T extends OrganizationRow>(
  scope: ReportScope,
  rows: OrganizationRow[],
): Column<T>[] =>
  scope.global
    ? [
        {
          title: translate('Organization'),
          orderField: 'organisation_name',
          render: ({ row }) => <>{row.organisation_name}</>,
          export: (row) => row.organisation_name,
          visible: showsOrganization(scope, rows),
        },
      ]
    : [];
