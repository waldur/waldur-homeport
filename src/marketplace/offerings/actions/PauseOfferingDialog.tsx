import { FunctionComponent, useState } from 'react';
import { Form } from 'react-final-form';
import { marketplaceProviderOfferingsPause } from 'waldur-js-client';

import { SubmitButton, TextGroup } from '@/form';
import { translate } from '@/i18n';
import { OfferingDependentsWarning } from '@/marketplace/offerings/dependents/OfferingDependentsWarning';
import { useOfferingDependents } from '@/marketplace/offerings/dependents/useOfferingDependents';
import { getConflictDetail } from '@/marketplace/offerings/dependents/utils';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { useManagedMutation } from '@/modal/useManagedMutation';

export const PauseOfferingDialog: FunctionComponent<{
  resolve: { offering; refreshOffering };
}> = ({ resolve: { offering, refreshOffering } }) => {
  // Paused, the offering takes no orders: what calls built on it may refuse.
  const { dependents, blocked, reason, isLoading } = useOfferingDependents(
    offering.uuid,
    'offering_withdrawn',
  );
  const [conflict, setConflict] = useState<string>();
  const pauseMutation = useManagedMutation<any, any, any>({
    mutationFn: (formData) =>
      marketplaceProviderOfferingsPause({
        path: { uuid: offering.uuid },
        body: { paused_reason: formData.reason },
      }),
    successMessage: translate('Offering has been paused.'),
    errorMessage: translate('Unable to pause offering.'),
    refetch: refreshOffering,
    onError: (error) => setConflict(getConflictDetail(error)),
  });

  return (
    <Form
      onSubmit={(values) => pauseMutation.mutateAsync(values)}
      render={({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Pause offering')}
            subtitle={
              <ScopeSubtitle
                label={translate('Offering name')}
                name={offering.name}
              />
            }
            footer={
              <>
                <CloseDialogButton />
                <SubmitButton
                  submitting={submitting}
                  label={translate('Pause')}
                  variant="primary"
                  disabled={isLoading || blocked}
                  disabledReason={blocked ? reason : undefined}
                />
              </>
            }
          >
            <TextGroup
              name="reason"
              placeholder={translate(
                'Please enter reason why offering has been paused.',
              )}
              rows={7}
            />
            <OfferingDependentsWarning
              dependents={dependents}
              blocked={blocked}
              conflict={conflict}
              className="mt-3"
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
