import { LinkSimpleIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { PermissionEnum } from '@/permissions/enums';
import { ActionItem } from '@/resource/actions/ActionItem';
import { validateState } from '@/resource/actions/base';
import { useModalDialogCallback } from '@/resource/actions/useModalDialogCallback';
import { useValidators } from '@/resource/actions/useValidators';

const CreateLexisLinkDialog = lazyComponent(() =>
  import('./CreateLexisLinkDialog').then((module) => ({
    default: module.CreateLexisLinkDialog,
  })),
);

const validators = [validateState('OK', 'ERRED')];

interface CreateLexisLinkActionProps {
  resource: any;
  refetch?(): void;
}

export const CreateLexisLinkAction: FC<CreateLexisLinkActionProps> = ({
  resource,
  refetch,
}) => {
  const { tooltip, disabled } = useValidators(validators, resource);
  const action = useModalDialogCallback(CreateLexisLinkDialog, resource, {
    refetch,
  });
  const props = {
    title: translate('Create LEXIS link'),
    action,
    tooltip,
    disabled,
  };
  if (
    disabled ||
    !resource.available_actions?.includes(PermissionEnum.CREATE_LEXIS_LINK) ||
    !isFeatureVisible(MarketplaceFeatures.lexis_links)
  ) {
    return null;
  } else {
    return (
      <ActionItem {...props} iconNode={<LinkSimpleIcon weight="bold" />} />
    );
  }
};
