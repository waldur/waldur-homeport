import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const ApplicationDetailsDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "ApplicationDetailsDialog" */ './ApplicationDetailsDialog'
    ),
  'ApplicationDetailsDialog',
);

const applicationDetailsDialog = (application) =>
  openModalDialog(ApplicationDetailsDialog, {
    resolve: { application },
  });

export const ApplicationDetailsButton: FunctionComponent<any> = (props) => {
  const dispatch = useDispatch();
  const callback = () => dispatch(applicationDetailsDialog(props.application));
  return (
    <ActionButton
      title={translate('Details')}
      action={callback}
      icon="fa fa-eye"
    />
  );
};
