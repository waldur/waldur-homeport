import { CheckCircleIcon, UserPlusIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { ProviderTicket } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionsDropdown } from '@/table/ActionsDropdown';

import { useClaimTicket, useResolveTicket } from '../api';
import { isResolvedStatus } from '../common/status';

const ClaimAction: FC<{ row: ProviderTicket; refetch: () => void }> = ({
  row,
  refetch,
}) => {
  const claim = useClaimTicket(refetch);
  return (
    <ActionItem
      title={translate('Claim')}
      iconNode={<UserPlusIcon weight="bold" />}
      action={() => claim.mutate({ uuid: row.uuid })}
    />
  );
};

const ResolveAction: FC<{ row: ProviderTicket; refetch: () => void }> = ({
  row,
  refetch,
}) => {
  const resolve = useResolveTicket(refetch);
  return (
    <ActionItem
      title={translate('Resolve')}
      iconNode={<CheckCircleIcon weight="bold" />}
      action={() => resolve.mutate({ uuid: row.uuid })}
    />
  );
};

export const ProviderTicketsRowActions: FC<{
  row: ProviderTicket;
  fetch: () => void;
}> = ({ row, fetch }) => {
  const canClaim = !row.provider_assignee;
  const canResolve = !isResolvedStatus(row.status);

  if (!canClaim && !canResolve) {
    return <ActionsDropdown disabled tooltip />;
  }

  return (
    <ActionsDropdown row={row} refetch={fetch}>
      {canClaim && <ClaimAction row={row} refetch={fetch} />}
      {canResolve && <ResolveAction row={row} refetch={fetch} />}
    </ActionsDropdown>
  );
};
