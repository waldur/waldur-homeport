import { LinkBreak } from '@phosphor-icons/react';
import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { post } from '@waldur/core/api';
import { formatJsxTemplate, translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { getUser } from '@waldur/workspace/selectors';

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
    'Are you sure you want to unlink {resourceName} {resourceType} from {projectName} ({customerName})? ',
    context,
    formatJsxTemplate,
  );
};

export const UnlinkActionItem: FC<{ resource }> = ({ resource }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
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
      await post(
        `/marketplace-resources/${resource.marketplace_resource_uuid}/unlink/`,
      );
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
      iconNode={<LinkBreak />}
    />
  );
};
