import { FC } from 'react';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';

import { validatePermissions } from './utils';

const SubmitReportDialog = lazyComponent(
  () =>
    import(/* webpackChunkName: "SubmitReportDialog" */ './SubmitReportDialog'),
  'SubmitReportDialog',
);

const validators = [validateState('OK', 'Erred'), validatePermissions];

export const SubmitReportAction: FC<any> = ({ resource, reInitResource }) => (
  <DialogActionItem
    validators={validators}
    title={translate('Submit report')}
    modalComponent={SubmitReportDialog}
    resource={resource}
    extraResolve={{ reInitResource }}
  />
);
