import { FunctionComponent, useState } from 'react';
import { Form, useFormState } from 'react-final-form';
import { marketplaceProviderOfferingsMoveOffering } from 'waldur-js-client';

import { FormFooter } from '@/form';
import { translate } from '@/i18n';
import { OfferingDependentsWarning } from '@/marketplace/offerings/dependents/OfferingDependentsWarning';
import { useOfferingDependents } from '@/marketplace/offerings/dependents/useOfferingDependents';
import { getConflictDetail } from '@/marketplace/offerings/dependents/utils';
import { ModalDialog } from '@/modal/ModalDialog';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useNotify } from '@/store/notify';

import { MoveOfferingFields } from './MoveOfferingFields';

/**
 * Moved without its permissions, the offering loses its team: the calls that
 * hand it work may refuse that. Kept together so the warning and the submit
 * follow the checkbox.
 */
const useTeamDropGuard = (offeringUuid: string) => {
  const { values } = useFormState({ subscription: { values: true } });
  const dropsTeam = !values?.preserve_permissions;
  const guard = useOfferingDependents(offeringUuid, 'offering_team_dropped', {
    enabled: dropsTeam,
  });
  return dropsTeam
    ? guard
    : { dependents: [], blocked: false, reason: undefined, isLoading: false };
};

const MoveOfferingFooter: FunctionComponent<{ offeringUuid: string }> = ({
  offeringUuid,
}) => {
  const { blocked, reason, isLoading } = useTeamDropGuard(offeringUuid);
  return (
    <FormFooter
      submitLabel={translate('Save')}
      submitDisabled={isLoading || blocked}
      submitDisabledReason={blocked ? reason : undefined}
    />
  );
};

const MoveOfferingWarning: FunctionComponent<{
  offeringUuid: string;
  conflict?: string;
}> = ({ offeringUuid, conflict }) => {
  const { dependents, blocked } = useTeamDropGuard(offeringUuid);
  return (
    <OfferingDependentsWarning
      dependents={dependents}
      blocked={blocked}
      conflict={conflict}
      className="mt-3"
    />
  );
};

export const MoveOfferingDialog: FunctionComponent<{
  resolve: { offering; refetch };
}> = ({ resolve: { offering, refetch } }) => {
  const { showSuccess } = useNotify();
  const [conflict, setConflict] = useState<string>();

  const moveOfferingMutation = useManagedMutation<any, any, any>({
    mutationFn: (formData) =>
      marketplaceProviderOfferingsMoveOffering({
        path: { uuid: offering.uuid },
        body: {
          customer: formData.organization.url,
          preserve_permissions: formData.preserve_permissions,
        },
      }),
    errorMessage: translate('Offering could not be moved.'),
    refetch,
    onError: (error) => setConflict(getConflictDetail(error)),
    onSuccess: (_data, variables) => {
      showSuccess(
        translate(
          '{offeringName} offering has been moved to {organizationName} organization.',
          {
            offeringName: offering.name,
            organizationName: variables.organization.name,
          },
        ),
      );
    },
  });

  return (
    <Form
      onSubmit={(values) => moveOfferingMutation.mutateAsync(values)}
      initialValues={{ preserve_permissions: false }}
      render={({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Move offering')}
            subtitle={
              <ScopeSubtitle
                label={translate('Offering name')}
                name={offering.name}
              />
            }
            footer={<MoveOfferingFooter offeringUuid={offering.uuid} />}
          >
            <MoveOfferingFields submitting={submitting} />
            <MoveOfferingWarning
              offeringUuid={offering.uuid}
              conflict={conflict}
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
