import { TrashIcon } from '@phosphor-icons/react';
import { Dropdown } from 'react-bootstrap';
import { customerCreditsDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';

export const DeleteCreditButton = ({ row, refetch }) => {
  const deleteMutation = useManagedMutation<any, any, void>({
    mutationFn: () => customerCreditsDestroy({ path: { uuid: row.uuid } }),
    successMessage: translate('Credit deleted successfully.'),
    errorMessage: translate('Error while deleting credit.'),
    refetch,
    confirmation: {
      title: translate('Delete confirmation'),
      body: translate('Are you sure you want to delete this credit?'),
      options: { forDeletion: true },
    },
  });

  return (
    <Dropdown.Item
      as="button"
      className="text-danger"
      disabled={deleteMutation.isPending}
      onClick={() => deleteMutation.mutate()}
    >
      <span className="svg-icon svg-icon-2 svg-icon-danger">
        <TrashIcon weight="bold" />
      </span>
      {translate('Delete')}
    </Dropdown.Item>
  );
};
