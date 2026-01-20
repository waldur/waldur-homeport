import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import { marketplaceResourcesPull } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { validateState } from '@waldur/resource/actions/base';
import { useValidators } from '@waldur/resource/actions/useValidators';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { SITE_AGENT_PLUGIN } from './constants';

const hasBackendId = (ctx) =>
  ctx.resource.backend_id
    ? undefined
    : translate('Resource does not have backend ID.');

const validators = [validateState('OK', 'ERRED'), hasBackendId];

export const PullSiteAgentResourceAction = ({ resource, refetch, ...rest }) => {
  const dispatch = useDispatch();
  const { tooltip, disabled } = useValidators(validators, resource);

  const callback = async () => {
    try {
      await marketplaceResourcesPull({ path: { uuid: resource.uuid } });
      dispatch(showSuccess(translate('Synchronisation has been scheduled.')));
      if (refetch) {
        await refetch();
      }
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Unable to synchronise resource.')),
      );
    }
  };

  return resource.offering_type === SITE_AGENT_PLUGIN ? (
    <ActionItem
      title={translate('Synchronise')}
      action={callback}
      tooltip={tooltip}
      disabled={disabled}
      {...rest}
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
    />
  ) : null;
};
