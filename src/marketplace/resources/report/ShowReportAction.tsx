import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

const ShowReportDialog = lazyComponent(
  () => import('./ShowReportDialog'),
  'ShowReportDialog',
);

export const openReport = (report) =>
  openModalDialog(ShowReportDialog, { resolve: { report }, size: 'lg' });

export const ShowReportAction: ActionItemType = ({ resource, ...rest }) => {
  const dispatch = useDispatch();
  const callback = () => dispatch(openReport(resource.report));

  return Array.isArray(resource.report) ? (
    <ActionItem
      title={translate('Show report')}
      iconClass="fa-book"
      action={callback}
      {...rest}
    />
  ) : null;
};
