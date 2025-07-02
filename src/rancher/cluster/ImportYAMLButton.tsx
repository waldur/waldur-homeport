import { PlusCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';
import { useUser } from '@waldur/workspace/hooks';

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
