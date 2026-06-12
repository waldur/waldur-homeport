import { FunctionComponent, useCallback, useMemo, useState } from 'react';
import { FormCheck } from 'react-bootstrap';
import {
  AffiliatedOrganization,
  affiliatedOrganizationsList,
  Customer,
  CustomerDefaultAffiliationsUpdateRequest,
  customersUpdateDefaultAffiliations,
} from 'waldur-js-client';

import { getAllPages } from '@/core/api';
import { BaseButton } from '@/core/buttons/BaseButton';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useNotify } from '@/store/notify';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

interface EditDefaultAffiliationsDialogProps {
  resolve: {
    customer: Customer;
    callback?: () => void;
  };
}

export const EditDefaultAffiliationsDialog: FunctionComponent<
  EditDefaultAffiliationsDialogProps
> = ({ resolve: { customer, callback } }) => {
  const initialUuids = useMemo<Set<string>>(
    () =>
      new Set(
        (customer.default_affiliations ?? [])
          .map((o) => o.uuid)
          .filter((u): u is string => Boolean(u)),
      ),
    [customer],
  );
  const [selectedUuids, setSelectedUuids] = useState<Set<string>>(initialUuids);
  const [bulkLoading, setBulkLoading] = useState(false);
  const { showErrorResponse } = useNotify();

  const toggle = useCallback((uuid: string) => {
    setSelectedUuids((prev) => {
      const next = new Set(prev);
      if (next.has(uuid)) {
        next.delete(uuid);
      } else {
        next.add(uuid);
      }
      return next;
    });
  }, []);

  const fetchAllUuids = useCallback(async (): Promise<string[]> => {
    const rows = await getAllPages((page) =>
      affiliatedOrganizationsList({
        query: { page, field: ['uuid'] },
      }),
    );
    return rows.map((o) => o.uuid).filter((u): u is string => Boolean(u));
  }, []);

  const enableAll = useCallback(async () => {
    setBulkLoading(true);
    try {
      const uuids = await fetchAllUuids();
      setSelectedUuids(new Set(uuids));
    } catch (e) {
      showErrorResponse(e, translate('Unable to load affiliations.'));
    } finally {
      setBulkLoading(false);
    }
  }, [fetchAllUuids, showErrorResponse]);

  const disableAll = useCallback(() => {
    setSelectedUuids(new Set());
  }, []);

  const tableProps = useTable({
    table: `EditDefaultAffiliations-${customer.uuid}`,
    fetchData: createFetcher(affiliatedOrganizationsList),
    queryField: 'query',
  });

  const columns = useMemo(
    () => [
      {
        title: translate('Enabled'),
        render: ({ row }: { row: AffiliatedOrganization }) => (
          <FormCheck
            type="checkbox"
            id={`default-affiliation-${row.uuid}`}
            checked={selectedUuids.has(row.uuid)}
            onChange={() => toggle(row.uuid)}
          />
        ),
        className: 'text-center',
      },
      {
        title: translate('Name'),
        render: ({ row }: { row: AffiliatedOrganization }) => <>{row.name}</>,
        orderField: 'name',
      },
      {
        title: translate('Code'),
        render: ({ row }: { row: AffiliatedOrganization }) => <>{row.code}</>,
      },
      {
        title: translate('Abbreviation'),
        render: ({ row }: { row: AffiliatedOrganization }) =>
          renderFieldOrDash(row.abbreviation),
      },
      {
        title: translate('Country'),
        render: ({ row }: { row: AffiliatedOrganization }) =>
          renderFieldOrDash(row.country),
      },
    ],
    [selectedUuids, toggle],
  );

  const updateMutation = useManagedMutation<any, any, void>({
    mutationFn: () => {
      const body: CustomerDefaultAffiliationsUpdateRequest = {
        default_affiliations: Array.from(selectedUuids),
      };
      return customersUpdateDefaultAffiliations({
        path: { uuid: customer.uuid! },
        body,
      });
    },
    successMessage: translate('Available affiliations have been updated.'),
    errorMessage: translate('Unable to update available affiliations.'),
    onSuccess: callback,
  });

  return (
    <ModalDialog
      title={translate('Edit available affiliations')}
      footer={
        <>
          <CloseDialogButton />
          <SubmitButton
            disabled={updateMutation.isPending}
            submitting={updateMutation.isPending}
            label={translate('Save')}
            onClick={() => updateMutation.mutate()}
          />
        </>
      }
    >
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="text-muted">
          {selectedUuids.size === 0
            ? translate('No affiliations enabled')
            : selectedUuids.size === 1
              ? translate('1 affiliation enabled')
              : translate('{count} affiliations enabled', {
                  count: selectedUuids.size,
                })}
        </span>
        <div className="d-flex gap-2">
          <BaseButton
            size="sm"
            variant="outline-primary"
            disabled={bulkLoading}
            disabledReason={
              bulkLoading ? translate('Loading affiliations...') : undefined
            }
            pending={bulkLoading}
            onClick={enableAll}
            label={translate('Enable all')}
          />
          <BaseButton
            size="sm"
            variant="outline-secondary"
            disabled={bulkLoading || selectedUuids.size === 0}
            disabledReason={
              selectedUuids.size === 0
                ? translate('Nothing to disable')
                : undefined
            }
            onClick={disableAll}
            label={translate('Disable all')}
          />
        </div>
      </div>
      <Table<AffiliatedOrganization>
        {...tableProps}
        columns={columns}
        verboseName={translate('Affiliations')}
        initialSorting={{ field: 'name', mode: 'asc' }}
        hasQuery={true}
        showPageSizeSelector={true}
      />
    </ModalDialog>
  );
};
