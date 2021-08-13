import { FC } from 'react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { DialogActionButton } from '@waldur/resource/actions/DialogActionButton';

const SubmitJobDialog = lazyComponent(
  () => import(/* webpackChunkName: "SubmitJobDialog" */ './SubmitJobDialog'),
  'SubmitJobDialog',
);

interface SubmitJobActionProps {
  resource;
}

export const SubmitJobAction: FC<SubmitJobActionProps> = ({ resource }) => (
  <DialogActionButton
    title={translate('Submit job')}
    icon="fa fa-plus"
    modalComponent={SubmitJobDialog}
    resource={resource}
  />
);
