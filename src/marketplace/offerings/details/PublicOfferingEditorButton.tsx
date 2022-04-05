import { Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import {
  isOwnerOrStaff as isOwnerOrStaffSelector,
  isServiceManagerSelector,
} from '@waldur/workspace/selectors';

const PublicOfferingEditor = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "PublicOfferingEditor" */ './PublicOfferingEditor'
    ),
  'PublicOfferingEditor',
);

export const PublicOfferingEditorButton = ({
  offering,
  category,
  refreshOffering,
}) => {
  const dispatch = useDispatch();
  const isOwnerOrStaff = useSelector(isOwnerOrStaffSelector);
  const isServiceManager = useSelector(isServiceManagerSelector);
  if (!(isOwnerOrStaff || isServiceManager)) {
    return null;
  }
  return (
    <Button
      className="me-2"
      onClick={() =>
        dispatch(
          openModalDialog(PublicOfferingEditor, {
            resolve: {
              offering,
              category,
              refreshOffering,
            },
            modalStyle: { left: 'auto', bottom: 'auto' },
            formId: 'PublicOfferingEditor',
            dialogClassName: 'sidebarEditor',
          }),
        )
      }
    >
      {translate('Edit')}
    </Button>
  );
};
