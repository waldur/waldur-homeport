import Axios from 'axios';
import { useCallback, FunctionComponent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useAsync } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import * as actions from '@waldur/providers/actions';
import { ProviderUpdateForm } from '@waldur/providers/ProviderUpdateForm';
import { findProvider } from '@waldur/providers/registry';

import { getOffering } from '../store/selectors';

interface ProviderData {
  type: string;
  name: string;
}

export const ServiceSettingsDetailsDialog: FunctionComponent = () => {
  const offeringData = useSelector(getOffering);
  const offeringScope = offeringData.offering.scope;
  const state = useAsync(async () => {
    const provider = (await Axios.get(offeringScope)).data as ProviderData;
    return {
      initialValues: {
        name: provider.name,
        type: findProvider(provider.type),
        details: provider,
      },
      type: findProvider(provider.type),
    };
  }, [offeringScope]);

  const dispatch = useDispatch();
  const updateProvider = useCallback(
    (data) => actions.updateProvider(data, dispatch),
    [dispatch],
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
      ) : !state.value ? null : (
        <ProviderUpdateForm
          {...state.value}
          updateProvider={updateProvider}
          translate={translate}
        />
      )}
    </ModalDialog>
  );
};
