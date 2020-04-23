import Axios from 'axios';
import * as React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { useQuery } from '@waldur/core/useQuery';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import * as actions from '@waldur/providers/actions';
import { ProviderUpdateForm } from '@waldur/providers/ProviderUpdateForm';
import { findProvider } from '@waldur/providers/registry';
import { connectAngularComponent } from '@waldur/store/connect';

import { getOffering } from '../store/selectors';

interface ProviderData {
  type: string;
  name: string;
}

export const ServiceSettingsDetailsDialog = () => {
  const offering = useSelector(getOffering);
  const { state, call } = useQuery(async () => {
    const provider = (await Axios.get(offering.offering.scope))
      .data as ProviderData;
    return {
      initialValues: {
        name: provider.name,
        type: findProvider(provider.type),
        details: provider,
      },
      type: findProvider(provider.type),
    };
  });
  React.useEffect(call, []);

  const dispatch = useDispatch();
  const updateProvider = React.useCallback(
    data => actions.updateProvider(data, dispatch),
    [],
  );

  return (
    <ModalDialog
      title={translate('Provider details')}
      footer={<CloseDialogButton />}
    >
      {state.loading ? (
        <LoadingSpinner />
      ) : state.error ? (
        <h3>{translate('Unable to load provider details.')}</h3>
      ) : !state.loaded ? null : (
        <ProviderUpdateForm
          {...state.data}
          updateProvider={updateProvider}
          translate={translate}
        />
      )}
    </ModalDialog>
  );
};

export default connectAngularComponent(ServiceSettingsDetailsDialog);
