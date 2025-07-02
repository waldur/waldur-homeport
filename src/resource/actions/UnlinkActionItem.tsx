import { LinkBreakIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { useDispatch } from 'react-redux';
import { marketplaceResourcesUnlink } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { useUser } from '@waldur/workspace/hooks';

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
  const dispatch = useDispatch();
  const user = useUser();
  if (!user.is_staff || !resource.marketplace_resource_uuid) {
    return null;
  }
  const callback = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Unlink resource'),
        getConfirmationText(resource),
      );
    } catch {
      return;
    }

    try {
      await marketplaceResourcesUnlink({
        path: { uuid: resource.marketplace_resource_uuid },
      });
      dispatch(showSuccess(translate('Resource has been unlinked.')));
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to unlink resource.')));
    }
  };
  return (
    <ActionItem
      title={translate('Unlink')}
      action={callback}
      className="text-danger"
      staff
      iconNode={<LinkBreakIcon weight="bold" />}
      iconColor="danger"
    />
  );
};
