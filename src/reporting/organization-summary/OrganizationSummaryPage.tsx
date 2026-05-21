import { FC } from 'react';
import { Form, useFormState } from 'react-final-form';

import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';

import { ReportingTitle } from '../ReportingTitle';

import { OrganizationFilter } from './OrganizationFilter';
import { OrganizationResourcesTable } from './OrganizationResourcesTable';

const OrganizationSummaryContent: FC = () => {
  const { values } = useFormState();
  const customerUuid = values?.organization?.uuid;

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

export const OrganizationSummaryPage: FC = () => (
  <Form
    onSubmit={() => {}}
    render={({ handleSubmit }) => (
      <form onSubmit={handleSubmit}>
        <OrganizationSummaryContent />
      </form>
    )}
  />
);
