import { KeyIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { useDispatch } from 'react-redux';
import { Resource } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

interface ResourceAccessButtonProps {
  resource: Resource;
  refetch;
}

const AddResourceAccessDialog = lazyComponent(() =>
  import('./AddResourceAccessDialog').then((module) => ({
    default: module.AddResourceAccessDialog,
  })),
);

export const AddResourceAccessButton: FC<ResourceAccessButtonProps> = ({
  resource,
  refetch,
}) => {
  const dispatch = useDispatch();

  return (
    <ActionItem
      title={translate('Resource access')}
      action={() =>
        dispatch(
          openModalDialog(AddResourceAccessDialog, {
            resource,
            refetch,
            size: 'lg',
          }),
        )
      }
      iconNode={<KeyIcon weight="bold" />}
    />
  );
};
