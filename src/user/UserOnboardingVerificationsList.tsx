import { EyeIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import {
  OnboardingVerification,
  onboardingVerificationsList,
} from 'waldur-js-client';

import { OnboardingVerificationExpandableRow } from '@/administration/organizations/OnboardingVerificationExpandableRow';
import { getOnboardingVerificationColumns } from '@/administration/organizations/OrganizationOnboardingVerificationsList';
import { translate } from '@/i18n';
import { ActionItem } from '@/resource/actions/ActionItem';
import { router } from '@/router';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { useUser } from '@/workspace/hooks';

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
  return (
    <ActionsDropdown
      row={row}
      refetch={fetch}
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
    queryField: 'query',
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
