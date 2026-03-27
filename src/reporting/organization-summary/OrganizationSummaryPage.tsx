import { FC } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';

import { translate } from '@waldur/i18n';
import { NoResult } from '@waldur/navigation/header/search/NoResult';

import { ReportingTitle } from '../ReportingTitle';

import {
  OrganizationFilter,
  ORGANIZATION_FILTER_FORM,
} from './OrganizationFilter';
import { OrganizationResourcesTable } from './OrganizationResourcesTable';

interface OrganizationFilterFormValues {
  organization?: {
    uuid: string;
    name: string;
  };
}

export const OrganizationSummaryPage: FC = () => {
  const formValues = useSelector(
    getFormValues(ORGANIZATION_FILTER_FORM),
  ) as OrganizationFilterFormValues;
  const customerUuid = formValues?.organization?.uuid;

  return (
    <>
      <ReportingTitle reportKey="organization-summary">
        <div className="d-flex align-items-center gap-4">
          <label className="text-muted fs-7 fw-semibold whitespace-nowrap">
            {translate('Organization')}:
          </label>
          <div style={{ minWidth: 200 }}>
            <OrganizationFilter />
          </div>
        </div>
      </ReportingTitle>

      {customerUuid ? (
        <OrganizationResourcesTable customerUuid={customerUuid} />
      ) : (
        <NoResult
          title={translate('Select an organization')}
          message={translate(
            'Choose an organization from the dropdown above to view resource statistics and usage data.',
          )}
          noAction
        />
      )}
    </>
  );
};
