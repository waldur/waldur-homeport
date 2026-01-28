import { FC } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';

import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { NoResult } from '@waldur/navigation/header/search/NoResult';
import { useTitle } from '@waldur/navigation/title';

import { useReportBreadcrumbs } from '../ReportsBreadcrumbs';

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
  useTitle(translate('Organization Summary'));
  useReportBreadcrumbs({
    category: 'resources',
    currentReport: 'organization-summary',
  });

  const formValues = useSelector(
    getFormValues(ORGANIZATION_FILTER_FORM),
  ) as OrganizationFilterFormValues;
  const customerUuid = formValues?.organization?.uuid;

  return (
    <>
      <div className="d-flex flex-wrap gap-6 mb-6">
        <FormGroup
          label={translate('Organization')}
          className="flex-grow-1 mw-300px"
        >
          <OrganizationFilter />
        </FormGroup>
      </div>

      {customerUuid ? (
        <OrganizationResourcesTable customerUuid={customerUuid} />
      ) : (
        <NoResult
          title={translate('Select an organization')}
          message={translate(
            'Choose an organization from the dropdown above to view resource statistics and usage data.',
          )}
        />
      )}
    </>
  );
};
