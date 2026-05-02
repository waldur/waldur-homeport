import { PencilSimpleIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const ViewYAMLDialog = lazyComponent(() =>
  import('./ViewYAMLDialog').then((module) => ({
    default: module.ViewYAMLDialog,
  })),
);

export const ViewYAMLButton = ({
  resource,
  disabled,
  yamlRetrieve,
  yamlUpdate,
}: {
  resource: any;
  disabled?: boolean;
  yamlRetrieve: any;
  yamlUpdate: any;
}) => {
  const { openDialog } = useModal();
  return (
    <ActionItem
      title={translate('View YAML')}
      action={() =>
        openDialog(ViewYAMLDialog, {
          resolve: { resource, yamlRetrieve, yamlUpdate },
          size: 'lg',
        })
      }
      iconNode={<PencilSimpleIcon weight="bold" />}
      disabled={disabled}
    />
  );
};
