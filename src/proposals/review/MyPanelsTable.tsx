import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { CallPanel, proposalProtectedCallsPanelsList } from 'waldur-js-client';

import { getAllPages } from '@/core/api';
import { ENV } from '@/core/config';
import { translate } from '@/i18n';
import { RoleEnum } from '@/permissions/enums';
import { PanelExportActions } from '@/proposals/update/panels/PanelExportActions';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import Table from '@/table/Table';
import { useRowsTable } from '@/table/useRowsTable';
import { renderFieldOrDash } from '@/table/utils';
import { useUser } from '@/workspace/hooks';

interface PanelCall {
  uuid: string;
  name: string;
}

interface MyPanel {
  call: PanelCall & { url: string; slug?: string };
  panel: CallPanel;
  chairs: boolean;
}

/** The calls the user holds the panel member role on, from their grants. */
export const getPanelCalls = (
  permissions:
    | {
        scope_type?: string | null;
        scope_uuid?: string;
        scope_name?: string;
        role_name?: string;
      }[]
    | undefined,
): PanelCall[] => {
  const seen = new Map<string, PanelCall>();
  (permissions ?? []).forEach((grant) => {
    if (
      grant.scope_type === 'call' &&
      grant.role_name === RoleEnum.CALL_PANEL_MEMBER &&
      grant.scope_uuid
    ) {
      seen.set(grant.scope_uuid, {
        uuid: grant.scope_uuid,
        name: grant.scope_name,
      });
    }
  });
  return [...seen.values()];
};

/**
 * Every panel of the call: the list is paginated, and a call may hold more
 * panels than fit on one page.
 */
export const fetchCallPanels = (callUuid: string) =>
  getAllPages((page) =>
    proposalProtectedCallsPanelsList({
      path: { uuid: callUuid },
      query: { page, page_size: 100 },
    }),
  );

const protectedCallUrl = (uuid: string) =>
  `${ENV.apiEndpoint}api/proposal-protected-calls/${uuid}/`;

/**
 * The panels of ``calls`` the user chairs or sits on, from each call's panel
 * list as it settled, and the names of the calls whose list failed.
 */
export const collectMyPanels = (
  calls: PanelCall[],
  results: PromiseSettledResult<CallPanel[]>[],
  userUuid: string,
): { rows: MyPanel[]; failedCalls: string[] } => {
  const rows: MyPanel[] = [];
  const failedCalls: string[] = [];
  results.forEach((result, index) => {
    const call = calls[index];
    if (result.status === 'rejected') {
      failedCalls.push(call.name);
      return;
    }
    result.value
      .filter(
        (panel) =>
          panel.chair === userUuid ||
          panel.member_details.some((member) => member.uuid === userUuid),
      )
      .forEach((panel) =>
        rows.push({
          call: { ...call, url: protectedCallUrl(call.uuid) },
          panel,
          chairs: panel.chair === userUuid,
        }),
      );
  });
  return { rows, failedCalls };
};

/**
 * The panels the user chairs or sits on, each with its sheet and its
 * evaluations to download for the panel's meeting. Hidden for anyone who
 * sits on no panel.
 */
export const MyPanelsTable: FC = () => {
  const user = useUser();
  const calls = useMemo(
    () => getPanelCalls(user?.permissions),
    [user?.permissions],
  );
  const { data, isLoading } = useQuery({
    queryKey: ['my-panels', user?.uuid, calls.map((call) => call.uuid)],
    queryFn: async () =>
      collectMyPanels(
        calls,
        // One call's panels failing to load must not hide the others'.
        await Promise.allSettled(
          calls.map((call) => fetchCallPanels(call.uuid)),
        ),
        user.uuid,
      ),
    enabled: Boolean(user?.uuid) && calls.length > 0,
    staleTime: 60 * 1000,
  });
  const rows = useMemo(() => data?.rows ?? [], [data]);
  const failedCalls = data?.failedCalls ?? [];
  const tableProps = useRowsTable<MyPanel>('MyPanelsTable', rows, data);

  if (!calls.length || (!isLoading && !rows.length && !failedCalls.length)) {
    return null;
  }

  return (
    <Table<MyPanel>
      {...tableProps}
      columns={[
        {
          title: translate('Call'),
          render: ({ row }) => <>{row.call.name}</>,
        },
        {
          title: translate('Panel'),
          render: ({ row }) => (
            <span className="font-medium text-primary">{row.panel.name}</span>
          ),
        },
        {
          title: translate('Role'),
          render: ({ row }) => (
            <>{row.chairs ? translate('Chair') : translate('Member')}</>
          ),
        },
        {
          title: translate('Proposals'),
          render: ({ row }) => (
            <>{renderFieldOrDash(row.panel.proposals_count)}</>
          ),
        },
      ]}
      title={translate('My panels')}
      verboseName={translate('panels')}
      footer={
        failedCalls.length ? (
          <p className="text-danger mt-3 mb-0">
            {translate(
              'The panels of {calls} could not be loaded. Refresh to try again.',
              { calls: failedCalls.join(', ') },
            )}
          </p>
        ) : undefined
      }
      rowActions={({ row }) => (
        <ActionsDropdown row={row}>
          <PanelExportActions call={row.call} panel={row.panel} />
        </ActionsDropdown>
      )}
    />
  );
};
