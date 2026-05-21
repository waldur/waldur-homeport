import {
  PencilSimpleIcon,
  PlusCircleIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import { FC } from 'react';
import {
  marketplaceOfferingProfilesDestroy,
  marketplaceOfferingProfilesList,
} from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { Link } from '@/core/Link';
import { formatJsxTemplate, translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionButton } from '@/table/ActionButton';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

const OfferingProfileForm = lazyComponent(() =>
  import('./OfferingProfileForm').then((module) => ({
    default: module.OfferingProfileForm,
  })),
);

const DeleteProfileAction: FC<{ row; refetch(): void }> = ({
  row,
  refetch,
}) => {
  const deleteMutation = useManagedMutation<any, any, void>({
    mutationFn: () =>
      marketplaceOfferingProfilesDestroy({ path: { uuid: row.uuid } }),
    successMessage: translate('Profile deleted.'),
    errorMessage: translate('Unable to delete profile.'),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate(
        'Delete service profile {name}? This will unbind {count} offering(s) and revoke role grants for those offerings.',
        {
          name: <b>{row.name}</b>,
          count: <b>{row.offerings_count}</b>,
        },
        formatJsxTemplate,
      ),
      options: { forDeletion: true },
    },
  });

  return (
    <ActionItem
      title={translate('Delete')}
      action={() => deleteMutation.mutate()}
      iconNode={<TrashIcon weight="bold" />}
      className="text-danger"
      disabled={deleteMutation.isPending}
    />
  );
};

const EditProfileAction: FC<{ row; refetch(): void }> = ({ row, refetch }) => {
  const { openDialog } = useModal();
  return (
    <ActionItem
      title={translate('Edit')}
      iconNode={<PencilSimpleIcon weight="bold" />}
      action={() =>
        openDialog(OfferingProfileForm, {
          resolve: { profile: row, refetch },
        })
      }
    />
  );
};

export const OfferingProfilesList: FC = () => {
  const { openDialog } = useModal();
  const tableProps = useTable({
    table: 'OfferingProfilesList',
    fetchData: createFetcher(marketplaceOfferingProfilesList),
  });

  return (
    <Table
      {...tableProps}
      title={translate('Service profiles')}
      verboseName={translate('service profiles')}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => (
            <Link
              state="admin-marketplace-offering-profile-detail"
              params={{ uuid: row.uuid }}
            >
              {row.name}
            </Link>
          ),
          keys: ['name'],
        },
        {
          title: translate('Description'),
          render: ({ row }) => renderFieldOrDash(row.description),
          keys: ['description'],
        },
        {
          title: translate('Roles'),
          render: ({ row }) => (row.roles || []).length,
        },
        {
          title: translate('Offerings'),
          render: ({ row }) => row.offerings_count ?? 0,
        },
      ]}
      rowActions={({ row }) => (
        <ActionsDropdown row={row} refetch={tableProps.fetch}>
          <EditProfileAction row={row} refetch={tableProps.fetch} />
          <DeleteProfileAction row={row} refetch={tableProps.fetch} />
        </ActionsDropdown>
      )}
      tableActions={
        <ActionButton
          title={translate('Create profile')}
          iconNode={<PlusCircleIcon weight="bold" />}
          action={() =>
            openDialog(OfferingProfileForm, {
              resolve: { refetch: tableProps.fetch },
            })
          }
        />
      }
    />
  );
};
