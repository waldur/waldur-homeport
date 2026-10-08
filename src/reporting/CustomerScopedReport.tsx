import { BuildingsIcon } from '@phosphor-icons/react';
import { FC, ReactNode } from 'react';
import { useSelector } from 'react-redux';

import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';
import { isStaffOrSupport } from '@/workspace/selectors';

import {
  ReportingOrganizationSelect,
  useReportingOrganization,
} from './ReportingOrganizationSelect';
import { ReportingTitle } from './ReportingTitle';

interface CustomerScopedReportProps {
  reportKey: string;
  /** Receives the organization to scope to, or undefined for staff/support */
  children(customerUuid: string | undefined): ReactNode;
}

/**
 * Report page that staff/support see across all organizations and everyone
 * else scoped to the organization selected in the page header.
 */
export const CustomerScopedReport: FC<CustomerScopedReportProps> = ({
  reportKey,
  children,
}) => {
  const isStaff = useSelector(isStaffOrSupport);
  const { organization } = useReportingOrganization();

  return (
    <>
      <ReportingTitle reportKey={reportKey} showControlsOnMobile>
        {!isStaff && <ReportingOrganizationSelect />}
      </ReportingTitle>
      {isStaff ? (
        children(undefined)
      ) : organization ? (
        children(organization.uuid)
      ) : (
        <NoResult
          icon={<BuildingsIcon weight="bold" size={24} />}
          title={translate('Select an organization')}
          message={translate(
            'Choose an organization from the dropdown above to view this report.',
          )}
          noAction
        />
      )}
    </>
  );
};
