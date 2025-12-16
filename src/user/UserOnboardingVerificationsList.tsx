import { EyeIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import {
  OnboardingVerification,
  onboardingVerificationsList,
} from 'waldur-js-client';

import { OnboardingVerificationExpandableRow } from '@waldur/administration/organizations/OnboardingVerificationExpandableRow';
import { getOnboardingVerificationColumns } from '@waldur/administration/organizations/OrganizationOnboardingVerificationsList';
import { translate } from '@waldur/i18n';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { router } from '@waldur/router';
import { ActionsDropdown } from '@waldur/table/ActionsDropdown';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { useUser } from '@waldur/workspace/hooks';

const UserOnboardingVerificationView = ({ row }) => (
  <ActionItem
    title={translate('View')}
    action={() =>
      router.stateService.go('profile.verification-details', {
        uuid: row.uuid,
      })
    }
    iconNode={<EyeIcon weight="bold" />}
  />
);

const UserOnboardingVerificationActions: FC<{ row; fetch }> = ({
  row,
  fetch,
}) => {
  const disabled = row.status !== 'escalated';

  return (
    <ActionsDropdown
      row={row}
      refetch={fetch}
      disabled={disabled}
      tooltip={disabled ? translate('No actions available.') : null}
      actions={[UserOnboardingVerificationView]}
    />
  );
};

export const UserOnboardingVerificationsList: FC = () => {
  const user = useUser();
  const filter = useMemo(
    () => ({
      user_uuid: user.uuid,
    }),
    [user],
  );
  const tableProps = useTable({
    table: 'UserOnboardingVerifications',
    fetchData: createFetcher(onboardingVerificationsList),
    filter,
    queryField: 'legal_name',
  });

  return (
    <Table<OnboardingVerification>
      {...tableProps}
      title={translate('Organization applications')}
      columns={getOnboardingVerificationColumns({
        hideCustomerCreationColumn: true,
      })}
      hasQuery
      rowActions={UserOnboardingVerificationActions}
      expandableRow={OnboardingVerificationExpandableRow}
      hasOptionalColumns
    />
  );
};
