import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { DialogActionItem } from '@waldur/resource/actions/DialogActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

import { validateStaffAction } from '../actions/utils';

const SubmitReportDialog = lazyComponent(
  () => import('./SubmitReportDialog'),
  'SubmitReportDialog',
);

const validators = [validateState('OK', 'Erred'), validateStaffAction];

export const SubmitReportAction: ActionItemType = ({ resource, refetch }) => (
  <DialogActionItem
    validators={validators}
    title={translate('Submit report')}
    modalComponent={SubmitReportDialog}
    dialogSize="xl"
    resource={resource}
    extraResolve={{ refetch }}
    staff
  />
);
