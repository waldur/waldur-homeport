import { PlusCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';
import { useUser } from '@/workspace/hooks';

const ImportYAMLDialog = lazyComponent(() =>
  import('./ImportYAMLDialog').then((module) => ({
    default: module.ImportYAMLDialog,
  })),
);

export const ImportYAMLButton: FunctionComponent<{ cluster_id: string }> = ({
  cluster_id,
}) => {
  const dispatch = useDispatch();
  const user = useUser();
  if (!user.is_staff) {
    return null;
  }
  return (
    <ActionButton
      title={translate('Import YAML')}
      action={() =>
        dispatch(
          openModalDialog(ImportYAMLDialog, {
            resolve: { cluster_id },
            size: 'lg',
          }),
        )
      }
      iconNode={<PlusCircleIcon weight="bold" />}
    />
  );
};
