import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

const PublicOfferingEditor = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "PublicOfferingEditor" */ './PublicOfferingEditor'
    ),
  'PublicOfferingEditor',
);

export const PublicOfferingEditorButton = ({ offering, refreshOffering }) => {
  const dispatch = useDispatch();
  return (
    <Button
      className="m-r-sm"
      onClick={() =>
        dispatch(
          openModalDialog(PublicOfferingEditor, {
            resolve: {
              offering,
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
