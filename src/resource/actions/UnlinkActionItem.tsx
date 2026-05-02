import { LinkBreakIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { marketplaceResourcesUnlink } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { ResourceAction } from '@/marketplace/resources/actions/constants';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useUser } from '@/workspace/hooks';

import { formatResourceType } from '../utils';

import { ActionItem } from './ActionItem';

const getConfirmationText = (resource) => {
  const context = {
    resourceType: formatResourceType(resource) || 'resource',
    resourceName: <strong>{resource.name}</strong>,
    projectName: <strong>{resource.project_name}</strong>,
    customerName: <strong>{resource.customer_name}</strong>,
  };
  return translate(
    'Are you sure you want to unlink {resourceName} {resourceType} from {projectName} ({customerName})? Unlinking will only remove object from the database, it will not trigger any cleanup',
    context,
    formatJsxTemplate,
  );
};

export const UnlinkActionItem: FC<{ resource }> = ({ resource }) => {
  const user = useUser();
  if (!user.is_staff || !resource.marketplace_resource_uuid) {
    return null;
  }

  const { mutate, isPending = false } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      marketplaceResourcesUnlink({
        path: { uuid: resource.marketplace_resource_uuid },
      }),
    successMessage: translate('Resource has been unlinked.'),
    errorMessage: translate('Unable to unlink resource.'),
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
      actionId={ResourceAction.UNLINK}
      resource={resource}
    />
  );
};
