import { FC, useMemo } from 'react';
import Select from 'react-select';

import { translate } from '@/i18n';

import { useAssignTicket, useProviderTeam } from '../api';
import { isResolvedStatus } from '../common/status';

interface AssigneeOption {
  value: string;
  label: string;
}

interface AssigneeSelectProps {
  ticketUuid: string;
  status?: string | null;
  assignee?: string | null;
  assigneeName?: string | null;
  helpdeskUuid?: string;
  refetch: () => void;
}

/**
 * Inline assignee picker: a searchable dropdown of active team members that
 * (re)assigns the ticket on select. Shared by the tickets table cell and the
 * ticket details page. Read-only once the ticket is resolved/closed.
 */
export const AssigneeSelect: FC<AssigneeSelectProps> = ({
  ticketUuid,
  status,
  assignee,
  assigneeName,
  helpdeskUuid,
  refetch,
}) => {
  const { data: team = [] } = useProviderTeam(helpdeskUuid);
  const assign = useAssignTicket(refetch);

  const options = useMemo<AssigneeOption[]>(
    () =>
      team.map((member) => ({
        value: member.uuid,
        label: member.user_full_name || member.user_email,
      })),
    [team],
  );

  if (isResolvedStatus(status)) {
    return <span>{assigneeName || translate('Unassigned')}</span>;
  }

  const current =
    options.find((option) => option.value === assignee) ??
    (assigneeName ? { value: assignee ?? '', label: assigneeName } : null);

  return (
    <div style={{ minWidth: 180 }}>
      <Select<AssigneeOption>
        value={current}
        options={options}
        isDisabled={assign.isPending}
        isLoading={assign.isPending}
        placeholder={translate('Unassigned')}
        menuPortalTarget={
          typeof document !== 'undefined' ? document.body : undefined
        }
        styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
        onChange={(option) =>
          option &&
          option.value !== assignee &&
          assign.mutate({
            uuid: ticketUuid,
            provider_support_user: option.value,
          })
        }
      />
    </div>
  );
};
