import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useMemo, useState } from 'react';
import { FormCheck } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import {
  AffiliatedOrganization,
  affiliatedOrganizationsList,
  customersRetrieve,
  Project,
  ProjectAffiliationUpdateRequest,
  projectsRetrieve,
  projectsUpdateAffiliation,
} from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { SHORT_STALE_TIME } from '@/core/constants';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { setCurrentProject } from '@/workspace/actions';
import { useUser } from '@/workspace/hooks';

interface UpdateAffiliationDialogProps {
  resolve: {
    project: Project;
  };
}

export const UpdateAffiliationDialog: FunctionComponent<
  UpdateAffiliationDialogProps
> = ({ resolve: { project } }) => {
  const dispatch = useDispatch();
  const user = useUser();
  const isStaff = Boolean(user?.is_staff);

  // Customer's default_affiliations are needed only for the staff "Default"
  // badge — non-staff get the same list via the server-side
  // ?default_for_customer filter, so they don't need a separate fetch to
  // know what's allowed.
  const customerUuid = project.customer_uuid!;

  const {
    data: customer,
    isLoading: customerLoading,
    error: customerError,
    refetch: refetchCustomer,
  } = useQuery({
    queryKey: ['customer', customerUuid],
    queryFn: () =>
      customersRetrieve({ path: { uuid: customerUuid } }).then((r) => r.data),
    staleTime: SHORT_STALE_TIME,
    enabled: isStaff,
  });

  const customerDefaultUuids = useMemo(
    () =>
      new Set(
        (customer?.default_affiliations ?? [])
          .map((o) => o.uuid)
          .filter((u): u is string => Boolean(u)),
      ),
    [customer],
  );

  const currentUuid = project.affiliation?.uuid ?? null;
  const [selectedUuid, setSelectedUuid] = useState<string | null>(currentUuid);

  const updateMutation = useManagedMutation<any, any, void>({
    mutationFn: () => {
      const body: ProjectAffiliationUpdateRequest = {
        affiliation: selectedUuid,
      };
      return projectsUpdateAffiliation({
        path: { uuid: project.uuid! },
        body,
      });
    },
    successMessage: translate('Affiliation has been updated.'),
    errorMessage: translate('Unable to update affiliation.'),
    onSuccess: async () => {
      const response = await projectsRetrieve({
        path: { uuid: project.uuid },
      });
      dispatch(setCurrentProject(response.data));
    },
  });

  const baseFilter = useMemo(
    () => (isStaff ? undefined : { default_for_customer: customerUuid }),
    [isStaff, customerUuid],
  );

  const tableProps = useTable({
    table: `UpdateAffiliation-${project.uuid}-${isStaff ? 'staff' : 'limited'}`,
    fetchData: createFetcher(affiliatedOrganizationsList),
    queryField: 'query',
    filter: baseFilter,
  });

  const columns = useMemo(
    () => [
      {
        title: translate('Selected'),
        render: ({ row }: { row: AffiliatedOrganization }) => (
          <FormCheck
            type="radio"
            name="affiliation-row"
            id={`affiliation-${row.uuid}`}
            checked={selectedUuid === row.uuid}
            onChange={() => setSelectedUuid(row.uuid)}
          />
        ),
        className: 'text-center',
      },
      {
        title: translate('Name'),
        render: ({ row }: { row: AffiliatedOrganization }) => (
          <span>
            {row.name}
            {isStaff && customerDefaultUuids.has(row.uuid) && (
              <Badge variant="info" pill outline className="ms-2">
                {translate('Default')}
              </Badge>
            )}
          </span>
        ),
        orderField: 'name',
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
    [selectedUuid, customerDefaultUuids, isStaff],
  );

  return (
    <ModalDialog
      title={translate('Update affiliation')}
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
      {customerLoading ? (
        <LoadingSpinner />
      ) : customerError ? (
        <LoadingErred
          message={translate('Unable to load affiliations.')}
          loadData={refetchCustomer}
        />
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="text-muted">
              {isStaff
                ? translate(
                    'Pick from the full registry. The default list for this organization is highlighted.',
                  )
                : translate(
                    'Pick from the affiliations configured for this organization.',
                  )}
            </span>
            <FormCheck
              type="radio"
              name="affiliation-row"
              id="affiliation-none"
              checked={selectedUuid === null}
              onChange={() => setSelectedUuid(null)}
              label={translate('Clear (None)')}
            />
          </div>
          <Table<AffiliatedOrganization>
            {...tableProps}
            columns={columns}
            verboseName={translate('Affiliations')}
            initialSorting={{ field: 'name', mode: 'asc' }}
            hasQuery={true}
            showPageSizeSelector={true}
          />
        </>
      )}
    </ModalDialog>
  );
};
