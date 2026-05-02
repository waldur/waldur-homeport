import { PencilSimpleIcon, PlusCircleIcon } from '@phosphor-icons/react';
import { FC, useCallback, useMemo } from 'react';
import {
  KeycloakScopeOptionRequest,
  marketplaceProviderResourcesSetKeycloakScopes,
  Resource,
} from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import { AddScopeOptionDialog, ScopeOption } from './AddScopeOptionDialog';

interface ResourceKeycloakScopesRowProps {
  row: Resource;
  fetch(): void;
}

const EditScopeAction = ({ row }) => {
  const { openDialog } = useModal();
  return (
    <ActionItem
      title={translate('Edit')}
      action={() =>
        openDialog(AddScopeOptionDialog, {
          resolve: {
            resourceUuid: (row as any)._resourceUuid,
            existingScopes: (row as any)._allScopes,
            editScope: row,
          },
        })
      }
      iconNode={<PencilSimpleIcon weight="bold" />}
    />
  );
};

const RemoveScopeAction = ({ row, refetch }) => {
  const removeMutation = useManagedMutation<any, any, void>({
    mutationFn: () => {
      const allScopes: ScopeOption[] = (row as any)._allScopes;
      const resourceUuid: string = (row as any)._resourceUuid;
      const newScopes = allScopes.filter((s) => s.scope_id !== row.scope_id);
      return marketplaceProviderResourcesSetKeycloakScopes({
        path: { uuid: resourceUuid },
        body: { keycloak_available_scopes: newScopes },
      });
    },
    successMessage: translate('Scope option has been removed.'),
    errorMessage: translate('Unable to remove scope option.'),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate(
        'Are you sure you want to remove scope {label}?',
        { label: <strong>{row.label}</strong> },
        formatJsxTemplate,
      ),
      options: { forDeletion: true },
    },
  });

  return (
    <RemovalActionItem
      title={translate('Remove')}
      action={() => removeMutation.mutate()}
      disabled={removeMutation.isPending}
    />
  );
};

const ScopeRowActions = ({ row, fetch }) => (
  <ActionsDropdown
    row={row}
    refetch={fetch}
    actions={[EditScopeAction, RemoveScopeAction]}
  />
);

export const ResourceKeycloakScopesRow: FC<ResourceKeycloakScopesRowProps> = ({
  row,
  fetch: parentFetch,
}) => {
  const { openDialog } = useModal();

  const availableScopes: ScopeOption[] =
    (row.options as any)?.keycloak_available_scopes || [];

  const handleAdd = useCallback(() => {
    openDialog(AddScopeOptionDialog, {
      resolve: {
        resourceUuid: row.uuid,
        existingScopes: availableScopes,
      },
    });
  }, [availableScopes, row.uuid]);

  // Enrich rows with metadata needed by row actions
  const rows = useMemo(
    () =>
      availableScopes.map((scope) => ({
        ...scope,
        _allScopes: availableScopes,
        _resourceUuid: row.uuid,
      })),
    [availableScopes],
  );

  const fetcher = useCallback(
    () =>
      Promise.resolve({
        rows,
        resultCount: rows.length,
        nextPage: undefined,
      }),
    [rows],
  );

  const tableProps = useTable({
    table: 'resource-keycloak-scopes-' + row.uuid,
    fetchData: fetcher,
  });

  return (
    <ExpandableContainer>
      <Table<KeycloakScopeOptionRequest>
        {...tableProps}
        rowKey="scope_id"
        // Override fetch so row actions refresh the parent table
        // (scopes live in resource.options, not a separate endpoint)
        fetch={parentFetch}
        title={translate('Scope options')}
        columns={[
          {
            title: translate('Scope type'),
            render: ({ row }) => row.scope_type,
          },
          {
            title: translate('Scope ID'),
            render: ({ row }) => (
              <span className="text-break">{row.scope_id}</span>
            ),
          },
          {
            title: translate('Label'),
            render: ({ row }) => row.label,
          },
        ]}
        verboseName={translate('scope options')}
        rowActions={ScopeRowActions}
        hasPagination={false}
        fullWidth
        tableActions={
          <button
            type="button"
            className="btn btn-sm btn-light-primary"
            onClick={handleAdd}
          >
            <PlusCircleIcon size={18} weight="bold" className="me-1" />
            {translate('Add')}
          </button>
        }
      />
    </ExpandableContainer>
  );
};
