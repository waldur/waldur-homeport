import { LinkBreakIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { useDispatch } from 'react-redux';
import { openstackInstancesUnlink } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { useUser } from '@waldur/workspace/hooks';

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
  const dispatch = useDispatch();
  const user = useUser();
  if (!user.is_staff || resource.marketplace_resource_uuid) {
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
      await openstackInstancesUnlink({
        path: { uuid: resource.uuid },
      });
      dispatch(showSuccess(translate('OpenStack instance has been unlinked.')));
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Unable to unlink OpenStack instance.')),
      );
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
