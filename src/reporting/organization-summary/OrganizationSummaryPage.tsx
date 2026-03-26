import { FC } from 'react';
import { Card } from 'react-bootstrap';
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
  useTitle(translate('Organization summary'));
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
      <Card className="mb-6">
        <Card.Header>
          <Card.Title>{translate('Filters')}</Card.Title>
        </Card.Header>
        <Card.Body>
          <FormGroup label={translate('Organization')} className="mw-300px">
            <OrganizationFilter />
          </FormGroup>
        </Card.Body>
      </Card>

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
