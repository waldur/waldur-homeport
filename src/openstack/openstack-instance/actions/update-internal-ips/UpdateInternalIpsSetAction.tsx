import { Wrench } from '@phosphor-icons/react';
import { FC } from 'react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { DialogActionButton } from '@waldur/resource/actions/DialogActionButton';

import { OpenStackInstance } from '../../types';

const UpdateInternalIpsDialog = lazyComponent(
  () => import('./UpdateInternalIpsDialog'),
  'UpdateInternalIpsDialog',
);

interface UpdateInternalIpsActionProps {
  resource: OpenStackInstance;
}

const validators = [validateState('OK')];

export const UpdateInternalIpsAction: FC<UpdateInternalIpsActionProps> = ({
  resource,
}) => (
  <DialogActionButton
    title={translate('Configure')}
    iconNode={<Wrench />}
    modalComponent={UpdateInternalIpsDialog}
    resource={resource}
    validators={validators}
  />
);
