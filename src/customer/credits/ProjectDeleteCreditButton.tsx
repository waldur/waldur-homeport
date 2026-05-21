import { TrashIcon } from '@phosphor-icons/react';
import { Dropdown } from 'react-bootstrap';
import { projectCreditsDestroy } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useCustomer } from '@/workspace/hooks';

export const ProjectDeleteCreditButton = ({ row, refetch }) => {
  const customer = useCustomer();

  const deleteMutation = useManagedMutation<any, any, void>({
    mutationFn: () => projectCreditsDestroy({ path: { uuid: row.uuid } }),
    successMessage: translate('Credit deleted successfully.'),
    errorMessage: translate('Error while deleting credit.'),
    refetch,
    confirmation: {
      title: translate('Delete project credit'),
      body: translate(
        'Are you sure you want to delete the credit for {project} in {organization}? This will release the allocated credits back to the organization.',
        {
          project: <b>{row.project_name}</b>,
          organization: <b>{customer?.name}</b>,
        },
        formatJsxTemplate,
      ),
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
