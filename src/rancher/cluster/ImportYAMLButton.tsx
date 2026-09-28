import { PlusCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useUser } from '@/workspace/hooks';

const ImportYAMLDialog = lazyComponent(() =>
  import('./ImportYAMLDialog').then((module) => ({
    default: module.ImportYAMLDialog,
  })),
);

export const ImportYAMLButton: FunctionComponent<{ cluster_id: string }> = ({
  cluster_id,
}) => {
  const { openDialog } = useModal();
  const user = useUser();
  if (!user.is_staff) {
    return null;
  }
  return (
    <BaseButton
      label={translate('Import YAML')}
      onClick={() =>
        openDialog(ImportYAMLDialog, {
          resolve: { cluster_id },
          size: 'lg',
        })
      }
      iconNode={<PlusCircleIcon weight="bold" />}
      variant="tertiary"
      size="lg"
    />
  );
};
