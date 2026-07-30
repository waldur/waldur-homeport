import { ArrowsClockwiseIcon, EyeIcon } from '@phosphor-icons/react';
import { FC, useEffect, useRef } from 'react';
import {
  marketplaceResourceApiKeysRotate,
  Resource,
  ResourceApiKeyState,
  ResourceApiKeyStatus,
} from 'waldur-js-client';

import { StateIndicator } from '@/core/StateIndicator';
import { formatJsxTemplate, translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import Table from '@/table/Table';
import { Column, TableProps } from '@/table/types';
import { useUser } from '@/workspace/hooks';

import { RevealApiKeyDialog } from './RevealApiKeyDialog';
import { TRANSITIONAL, useInvalidateRevealedKey } from './useResourceApiKeys';

const getStateVariant = (state: ResourceApiKeyState) => {
  if (state === 'Erred') return { variant: 'danger', active: false };
  if (state === 'OK') return { variant: 'success', active: false };
  // Creating / Updating — in progress, show the spinner.
  return { variant: 'success', active: true };
};

const ApiKeyActions: FC<{
  row: ResourceApiKeyStatus;
  canManage: boolean;
  refetch: () => void;
}> = ({ row, canManage, refetch }) => {
  const { openDialog } = useModal();
  const invalidateReveal = useInvalidateRevealedKey();
  const { active: busy } = getStateVariant(row.state);
  // Only an OK key has a stable value the gateway accepts; the reveal endpoint
  // rejects anything else, so don't offer reveal until then.
  const revealable = row.state === 'OK';
  // Rotating an Erred key re-mints it — surface that as "Retry".
  const isErred = row.state === 'Erred';

  const { mutate: rotate, isPending: rotating } = useManagedMutation({
    mutationFn: () =>
      marketplaceResourceApiKeysRotate({ path: { uuid: row.uuid } }),
    // Retry re-attempts a failed generation — nothing is lost, so no prompt.
    // Rotate replaces a live key, so it confirms first.
    confirmation: isErred
      ? undefined
      : {
          title: translate('Rotate API key'),
          body: translate(
            'Replace the value of API key {name}? Anything using the current value loses access once the new key reaches the gateway. The other keys are unaffected.',
            { name: <strong>{row.fingerprint}</strong> },
            formatJsxTemplate,
          ),
          options: { positiveButton: translate('Yes') },
        },
    successMessage: isErred
      ? translate('API key generation retried')
      : translate('API key rotation requested'),
    errorMessage: translate('Unable to rotate the API key.'),
    onSuccess: () => {
      invalidateReveal(row.uuid);
      refetch();
    },
  });

  const openReveal = () =>
    openDialog(RevealApiKeyDialog, {
      resolve: { uuid: row.uuid, canManage, onRotate: () => rotate() },
    });

  return (
    <ActionsDropdown row={row} refetch={refetch} size="sm">
      <ActionItem
        title={translate('Reveal')}
        action={openReveal}
        iconNode={<EyeIcon weight="bold" />}
        disabled={!revealable}
        tooltip={
          !revealable
            ? translate('The key can be revealed once it is active.')
            : undefined
        }
      />
      {canManage && (
        <ActionItem
          title={isErred ? translate('Retry') : translate('Rotate')}
          action={() => rotate()}
          iconNode={<ArrowsClockwiseIcon weight="bold" />}
          disabled={busy || rotating}
          tooltip={
            busy ? translate('An operation is already in progress.') : undefined
          }
        />
      )}
    </ActionsDropdown>
  );
};

const getColumns = (): Column<ResourceApiKeyStatus>[] => [
  {
    title: translate('Key'),
    render: ({ row }) => <code>{row.fingerprint || '••••••••'}</code>,
  },
  {
    title: translate('State'),
    render: ({ row }) => {
      const { variant, active } = getStateVariant(row.state);
      return (
        <StateIndicator
          label={row.state}
          variant={variant}
          active={active}
          tooltip={row.state === 'Erred' ? row.error_message : ''}
          pill
          outline
        />
      );
    },
  },
];

interface ResourceApiKeysCardProps extends TableProps<ResourceApiKeyStatus> {
  resource: Resource;
}

export const ResourceApiKeysCard = ({
  resource,
  ...tableProps
}: ResourceApiKeysCardProps) => {
  const user = useUser();
  const canManage = hasPermission(user, {
    permission: PermissionEnum.MANAGE_RESOURCE_USERS,
    projectId: resource.project_uuid,
    customerId: resource.customer_uuid,
  });

  // useTable has no built-in polling; refresh while any key is mid-operation so
  // the appearing/disappearing rows and the state indicator stay live.
  const rows = (tableProps.rows ?? []) as ResourceApiKeyStatus[];
  const syncing = rows.some((key) => TRANSITIONAL.includes(key.state));
  const fetchRef = useRef(tableProps.fetch);
  fetchRef.current = tableProps.fetch;
  useEffect(() => {
    if (!syncing) return;
    const id = setInterval(() => fetchRef.current(), 5000);
    return () => clearInterval(id);
  }, [syncing]);

  return (
    <Table<ResourceApiKeyStatus>
      title={translate('API keys')}
      verboseName={translate('API keys')}
      cardBordered
      columns={getColumns()}
      rowActions={({ row }) => (
        <ApiKeyActions
          row={row}
          canManage={canManage}
          refetch={tableProps.fetch}
        />
      )}
      {...tableProps}
    />
  );
};
