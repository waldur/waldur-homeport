import { Check } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { ServiceProvider } from '@waldur/marketplace/types';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { ActionButton } from '@waldur/table/ActionButton';

import * as actions from './store/actions';

interface ServiceProviderSecretCodeRegenerateAlertProps {
  resolve: {
    serviceProvider: ServiceProvider;
  };
}

export const ServiceProviderSecretCodeGenerateConfirm = (
  props: ServiceProviderSecretCodeRegenerateAlertProps,
) => {
  const dispatch = useDispatch();
  return (
    <ModalDialog
      title={translate('Alert')}
      footer={
        <>
          <ActionButton
            className="btn btn-success"
            iconNode={<Check />}
            title={translate('Regenerate')}
            action={() =>
              dispatch(
                actions.secretCodeRegenerateStart(
                  props.resolve.serviceProvider,
                ),
              )
            }
          />
          <CloseDialogButton className="btn btn-danger" />
        </>
      }
    >
      {translate(
        'After secret API code has been regenerated, it will not be possible to submit usage with the old key.',
      )}
    </ModalDialog>
  );
};
