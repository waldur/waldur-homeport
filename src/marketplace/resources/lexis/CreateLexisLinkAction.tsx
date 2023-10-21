import { FC } from 'react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { validateState } from '@waldur/resource/actions/base';
import { useModalDialogCallback } from '@waldur/resource/actions/useModalDialogCallback';
import { useValidators } from '@waldur/resource/actions/useValidators';

const CreateLexisLinkDialog = lazyComponent(
  () => import('./CreateLexisLinkDialog'),
  'CreateLexisLinkDialog',
);

export const validateOfferingPluginOptions = (ctx: any) => {
  if (!ctx.resource.marketplace_offering_plugin_options?.heappe_url) {
    return translate('Offering does not include heappe_url option');
  }
  if (!ctx.resource.marketplace_offering_plugin_options?.heappe_username) {
    return translate('Offering does not include heappe_username option');
  }
  if (!ctx.resource.marketplace_offering_plugin_options?.heappe_cluster_id) {
    return translate('Offering does not include heappe_cluster_id option');
  }
  if (
    !ctx.resource.marketplace_offering_plugin_options?.heappe_local_base_path
  ) {
    return translate('Offering does not include heappe_local_base_path option');
  }
  return;
};

const validators = [
  validateState('OK', 'Erred'),
  validateOfferingPluginOptions,
];

interface TerminateActionProps {
  resource: any;
  refetch?(): void;
}

export const CreateLexisLinkAction: FC<TerminateActionProps> = ({
  resource,
  refetch,
}) => {
  const { tooltip, disabled } = useValidators(validators, resource);
  const action = useModalDialogCallback(
    CreateLexisLinkDialog,
    null,
    resource,
    null,
    {
      refetch,
    },
  );
  const props = {
    title: translate('Create LEXIS link'),
    action,
    tooltip,
    disabled,
  };
  if (!disabled) {
    return <ActionItem {...props} />;
  } else {
    return null;
  }
};
