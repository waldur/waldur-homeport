import { FunctionComponent, useCallback, useMemo } from 'react';
import {
  ScienceDomain,
  ScienceSubDomain,
  scienceSubDomainsList,
  scienceSubDomainsDestroy,
} from 'waldur-js-client';

import {
  CreateModalButton,
  DeleteButton,
  EditModalButton,
} from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';
import { formatJsxTemplate, translate } from '@/i18n';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

const ScienceSubDomainForm = lazyComponent(() =>
  import('./ScienceSubDomainForm').then((module) => ({
    default: module.ScienceSubDomainForm,
  })),
);

const SubDomainCreateButton = ({
  domainUrl,
  refetch,
}: {
  domainUrl: string;
  refetch;
}) => (
  <CreateModalButton
    dialog={ScienceSubDomainForm}
    resolve={{ domainUrl, refetch }}
  />
);

const SubDomainEditButton = ({ row, refetch }) => (
  <EditModalButton
    dialog={ScienceSubDomainForm}
    row={row}
    buildResolve={(r) => ({ scienceSubDomain: r, refetch })}
  />
);

const SubDomainDeleteButton = ({
  row,
  refetch,
}: {
  row: ScienceSubDomain;
  refetch;
}) => (
  <DeleteButton
    row={row}
    apiFunction={(r) => scienceSubDomainsDestroy({ path: { uuid: r.uuid } })}
    refetch={refetch}
    confirmTitle={translate('Confirmation')}
    confirmMessage={(r) =>
      translate(
        'Are you sure you want to delete the {name} sub-domain?',
        { name: <strong>{r.name}</strong> },
        formatJsxTemplate,
      )
    }
    errorMessage={translate('Unable to remove science sub-domain.')}
    title={translate('Remove')}
  />
);

const SubDomainRowActions = ({ row, fetch }) => (
  <ActionsDropdown
    row={row}
    refetch={fetch}
    actions={[SubDomainEditButton, SubDomainDeleteButton].filter(Boolean)}
  />
);

export const ScienceSubDomainsExpandableRow: FunctionComponent<{
  row: ScienceDomain;
  fetch?;
}> = ({ row, fetch: parentFetch }) => {
  const filter = useMemo(() => ({ domain_uuid: row.uuid }), [row.uuid]);

  const tableProps = useTable({
    table: 'ScienceSubDomainsList-' + row.uuid,
    fetchData: createFetcher(scienceSubDomainsList),
    filter,
  });

  const refetch = useCallback(() => {
    tableProps.fetch();
    parentFetch?.();
  }, [tableProps.fetch, parentFetch]);

  return (
    <ExpandableContainer>
      <Table<ScienceSubDomain>
        {...tableProps}
        columns={[
          {
            title: translate('Code'),
            render: ({ row }) => <>{row.code}</>,
            orderField: 'code',
          },
          {
            title: translate('Name'),
            render: ({ row }) => <>{row.name}</>,
            orderField: 'name',
          },
          {
            title: translate('Projects'),
            render: ({ row }) =>
              row.projects_count != null
                ? row.projects_count
                : DASH_ESCAPE_CODE,
            orderField: 'projects_count',
          },
        ]}
        verboseName={translate('Science sub-domains')}
        rowActions={SubDomainRowActions}
        tableActions={
          <SubDomainCreateButton domainUrl={row.url} refetch={refetch} />
        }
      />
    </ExpandableContainer>
  );
};
