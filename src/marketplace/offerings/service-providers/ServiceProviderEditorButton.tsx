import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

const ServiceProviderEditor = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "ServiceProviderEditor" */ './ServiceProviderEditor'
    ),
  'ServiceProviderEditor',
);

export const ServiceProviderEditorButton = ({
  provider,
  refreshServiceProvider,
}) => {
  const dispatch = useDispatch();
  return (
    <Button
      className="m-r-sm"
      onClick={() =>
        dispatch(
          openModalDialog(ServiceProviderEditor, {
            resolve: {
              uuid: provider.uuid,
              initialValues: { description: provider.description },
              refreshServiceProvider,
            },
            modalStyle: { left: 'auto', bottom: 'auto' },
            formId: 'ServiceProviderEditor',
            dialogClassName: 'sidebarEditor',
          }),
        )
      }
    >
      {translate('Edit')}
    </Button>
  );
};
