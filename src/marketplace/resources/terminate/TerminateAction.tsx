import { FC } from 'react';

import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';

import { TerminateDialog } from './TerminateContainer';

const validators = [validateState('OK', 'Erred')];

interface TerminateActionProps {
  resource: any;
  dialogSubtitle?: string;
}

export const TerminateAction: FC<TerminateActionProps> = ({
  resource,
  dialogSubtitle,
}) =>
  resource.marketplace_resource_uuid !== null ? (
    <DialogActionItem
      validators={validators}
      title={translate('Terminate')}
      modalComponent={TerminateDialog as any}
      extraResolve={{ dialogSubtitle }}
      resource={resource}
    />
  ) : null;
