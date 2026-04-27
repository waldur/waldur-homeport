import {
  PencilSimpleIcon,
  PlusCircleIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import { FC, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import {
  KeycloakScopeOptionRequest,
  marketplaceProviderResourcesSetKeycloakScopes,
  Resource,
} from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { waitForConfirmation } from '@/modal/actions';
import { openModalDialog } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@/store/notify';
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
  const dispatch = useDispatch();
  return (
    <ActionItem
      title={translate('Edit')}
      action={() =>
        dispatch(
          openModalDialog(AddScopeOptionDialog, {
            resolve: {
              resourceUuid: (row as any)._resourceUuid,
              existingScopes: (row as any)._allScopes,
              editScope: row,
            },
          }),
        )
      }
      iconNode={<PencilSimpleIcon weight="bold" />}
    />
  );
};

const RemoveScopeAction = ({ row, refetch }) => {
  const dispatch = useDispatch();
  return (
    <ActionItem
      title={translate('Remove')}
      action={async () => {
        try {
          await waitForConfirmation(
            dispatch,
            translate('Confirmation'),
            translate(
              'Are you sure you want to remove scope {label}?',
              { label: <strong>{row.label}</strong> },
              formatJsxTemplate,
            ),
            { forDeletion: true },
          );
        } catch {
          return;
        }
        try {
          const allScopes: ScopeOption[] = (row as any)._allScopes;
          const resourceUuid: string = (row as any)._resourceUuid;
          const newScopes = allScopes.filter(
            (s) => s.scope_id !== row.scope_id,
          );
          await marketplaceProviderResourcesSetKeycloakScopes({
            path: { uuid: resourceUuid },
            body: { keycloak_available_scopes: newScopes },
          });
          dispatch(showSuccess(translate('Scope option has been removed.')));
          refetch();
        } catch (error) {
          dispatch(
            showErrorResponse(
              error,
              translate('Unable to remove scope option.'),
            ),
          );
        }
      }}
      iconNode={<TrashIcon weight="bold" />}
      className="text-danger"
      iconColor="danger"
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
  const dispatch = useDispatch();

  const availableScopes: ScopeOption[] =
    (row.options as any)?.keycloak_available_scopes || [];

  const handleAdd = useCallback(() => {
    dispatch(
      openModalDialog(AddScopeOptionDialog, {
        resolve: {
          resourceUuid: row.uuid,
          existingScopes: availableScopes,
        },
      }),
    );
  }, [dispatch, row.uuid, availableScopes]);

  // Enrich rows with metadata needed by row actions
  const rows = useMemo(
    () =>
      availableScopes.map((scope) => ({
        ...scope,
        _allScopes: availableScopes,
        _resourceUuid: row.uuid,
      })),
    [availableScopes, row.uuid],
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
