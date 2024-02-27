import { FC } from 'react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';
import { PermissionEnum } from '@waldur/permissions/enums';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { validateState } from '@waldur/resource/actions/base';
import { useModalDialogCallback } from '@waldur/resource/actions/useModalDialogCallback';
import { useValidators } from '@waldur/resource/actions/useValidators';

const CreateLexisLinkDialog = lazyComponent(
  () => import('./CreateLexisLinkDialog'),
  'CreateLexisLinkDialog',
);

const validators = [validateState('OK', 'Erred')];

interface CreateLexisLinkActionProps {
  resource: any;
  refetch?(): void;
}

export const CreateLexisLinkAction: FC<CreateLexisLinkActionProps> = ({
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
  if (
    disabled ||
    !resource.available_actions?.includes(PermissionEnum.CREATE_LEXIS_LINK) ||
    !isFeatureVisible('marketplace.lexis_links')
  ) {
    return null;
  } else {
    return <ActionItem {...props} />;
  }
};
