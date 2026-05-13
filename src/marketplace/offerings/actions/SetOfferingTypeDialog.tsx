import { FunctionComponent } from 'react';
import { Form } from 'react-final-form';
import {
  marketplaceProviderOfferingsUpdateType,
  ProviderOffering,
} from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { SITE_AGENT_PLUGIN } from '@/site-agent/constants';
import { BASIC_OFFERING_TYPE } from '@/support/constants';

const TYPE_LABELS: Record<string, string> = {
  [BASIC_OFFERING_TYPE]: translate('Basic'),
  [SITE_AGENT_PLUGIN]: translate('Site Agent'),
};

const getTargetType = (currentType: string) =>
  currentType === BASIC_OFFERING_TYPE ? SITE_AGENT_PLUGIN : BASIC_OFFERING_TYPE;

interface SetOfferingTypeDialogProps {
  resolve: {
    offering: ProviderOffering;
    refetch: () => void;
  };
}

export const SetOfferingTypeDialog: FunctionComponent<
  SetOfferingTypeDialogProps
> = ({ resolve: { offering, refetch } }) => {
  const currentType = offering.type!;
  const targetType = getTargetType(currentType);

  const mutation = useManagedMutation<any, any, void>({
    mutationFn: () =>
      marketplaceProviderOfferingsUpdateType({
        path: { uuid: offering.uuid! },
        body: { type: targetType },
      }),
    successMessage: translate('Offering type has been updated.'),
    errorMessage: translate('Unable to update offering type.'),
    refetch,
  });

  return (
    <Form
      onSubmit={() => mutation.mutateAsync()}
      render={({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Change offering type')}
            subtitle={translate(
              'Change "{offeringName}" from {currentLabel} to {targetLabel}. Existing components, plans, resources, orders, and offering users are preserved.',
              {
                offeringName: offering.name,
                currentLabel: TYPE_LABELS[currentType] ?? currentType,
                targetLabel: TYPE_LABELS[targetType] ?? targetType,
              },
            )}
            footer={
              <>
                <CloseDialogButton />
                <SubmitButton
                  submitting={submitting}
                  label={translate('Confirm')}
                />
              </>
            }
          />
        </form>
      )}
    />
  );
};
