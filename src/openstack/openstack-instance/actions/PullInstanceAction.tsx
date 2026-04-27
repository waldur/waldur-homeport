import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import { openstackInstancesPull } from 'waldur-js-client';

import { translate } from '@/i18n';
import { validateOpenStackInstanceManagePermission } from '@/openstack/utils';
import { ActionItem } from '@/resource/actions/ActionItem';
import { validateState } from '@/resource/actions/base';
import { ActionContext, ActionItemType } from '@/resource/actions/types';
import { useValidators } from '@/resource/actions/useValidators';
import { showErrorResponse, showSuccess } from '@/store/notify';

const hasBackendId = (ctx: ActionContext) =>
  ctx.resource.backend_id
    ? undefined
    : translate('Resource does not have backend ID.');

const validators = [
  validateState('OK', 'ERRED'),
  hasBackendId,
  validateOpenStackInstanceManagePermission,
];

export const PullInstanceAction: ActionItemType = ({ resource, refetch }) => {
  const dispatch = useDispatch();
  const { tooltip, disabled } = useValidators(validators, resource);

  return (
    <ActionItem
      title={translate('Synchronise')}
      action={async () => {
        try {
          await openstackInstancesPull({ path: { uuid: resource.uuid } });
          if (refetch) {
            await refetch();
          }
          dispatch(showSuccess(translate('Resource sync has been scheduled.')));
        } catch (error) {
          dispatch(
            showErrorResponse(error, translate('Unable to sync resource.')),
          );
        }
      }}
      disabled={disabled}
      tooltip={tooltip}
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
    />
  );
};
