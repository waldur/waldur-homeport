import { Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { getUser } from '@waldur/workspace/selectors';

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
  const user = useSelector(getUser);
  if (!user || !user.is_staff) {
    return null;
  }
  return (
    <Button
      className="m-r-sm"
      onClick={() =>
        dispatch(
          openModalDialog(ServiceProviderEditor, {
            resolve: {
              uuid: provider.uuid,
              image: provider.customer_image,
              customer_uuid: provider.customer_uuid,
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
