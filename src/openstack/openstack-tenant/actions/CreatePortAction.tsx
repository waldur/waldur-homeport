import { PlusCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { validateState } from '@/resource/actions/base';
import { DialogActionButton } from '@/resource/actions/DialogActionButton';
import { useUser } from '@/workspace/hooks';
import { checkCanManageProject } from '@/workspace/selectors';

import { TenantActionProps } from './types';

const CreatePortDialog = lazyComponent(() =>
  import('./CreatePortDialog').then((module) => ({
    default: module.CreatePortDialog,
  })),
);

const validators = [validateState('OK')];

export const CreatePortAction: FC<TenantActionProps> = ({
  resource,
  refetch,
}) => {
  const user = useUser();

  if (
    !checkCanManageProject(user, {
      uuid: resource.project_uuid,
      customerUuid: resource.customer_uuid,
    })
  ) {
    return null;
  }

  return (
    <DialogActionButton
      title={translate('Create')}
      iconNode={<PlusCircleIcon weight="bold" />}
      modalComponent={CreatePortDialog}
      resource={resource}
      validators={validators}
      extraResolve={{ refetch }}
    />
  );
};
