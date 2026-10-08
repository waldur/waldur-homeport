import { BuildingsIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';

import {
  ReportingOrganizationSelect,
  useReportingOrganization,
} from '../ReportingOrganizationSelect';
import { ReportingTitle } from '../ReportingTitle';

import { OrganizationResourcesTable } from './OrganizationResourcesTable';

export const OrganizationSummaryPage: FC = () => {
  const { organization } = useReportingOrganization();

  return (
    <>
      <ReportingTitle reportKey="organization-summary" showControlsOnMobile>
        <ReportingOrganizationSelect />
      </ReportingTitle>

      {organization ? (
        <OrganizationResourcesTable customerUuid={organization.uuid} />
      ) : (
        <NoResult
          icon={<BuildingsIcon weight="bold" size={24} />}
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
