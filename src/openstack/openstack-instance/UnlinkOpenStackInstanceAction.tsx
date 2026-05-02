import { LinkBreakIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { openstackInstancesUnlink } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useUser } from '@/workspace/hooks';

const getConfirmationText = (resource) => {
  const context = {
    resourceName: <strong>{resource.name}</strong>,
    projectName: <strong>{resource.project_name}</strong>,
    customerName: <strong>{resource.customer_name}</strong>,
  };
  return translate(
    'Are you sure you want to unlink OpenStack instance {resourceName} from {projectName} ({customerName})? Unlinking will only remove object from the database, it will not trigger any cleanup',
    context,
    formatJsxTemplate,
  );
};

// This action is shown only for OpenStack instances that are not linked to marketplace resources.
export const UnlinkOpenStackInstanceAction: FC<{ resource }> = ({
  resource,
}) => {
  const user = useUser();
  if (!user.is_staff || resource.marketplace_resource_uuid) {
    return null;
  }
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      openstackInstancesUnlink({ path: { uuid: resource.uuid } }),
    successMessage: translate('OpenStack instance has been unlinked.'),
    errorMessage: translate('Unable to unlink OpenStack instance.'),
    confirmation: {
      title: translate('Unlink resource'),
      body: getConfirmationText(resource),
    },
  });
  return (
    <ActionItem
      title={translate('Unlink')}
      action={mutate}
      disabled={isPending}
      className="text-danger"
      staff
      iconNode={<LinkBreakIcon weight="bold" />}
      iconColor="danger"
    />
  );
};
