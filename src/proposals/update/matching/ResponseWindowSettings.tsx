import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import {
  proposalProtectedCallsAssignmentConfigurationPartialUpdate,
  proposalProtectedCallsAssignmentConfigurationRetrieve,
} from 'waldur-js-client';

import { PropertyList } from 'waldur-ui';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { EditFieldProvider, NumberEditField } from '@/form/editFields';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { Call } from '@/proposals/types';
import { getCallReadOnlyReason } from '@/proposals/utils';

const assignmentConfigurationKey = (callUuid: string) => [
  'callAssignmentConfiguration',
  callUuid,
];

const validateDays = (value: unknown) =>
  value === null || value === undefined || value === ''
    ? translate('Enter a number of days.')
    : Number(value) < 1 || !Number.isInteger(Number(value))
      ? translate('Enter a whole number of days, at least 1.')
      : undefined;

/**
 * How long reviewers have to answer: the window shared by pool invitations
 * and assignment batches, and the reminder before it closes. The call's
 * other assignment settings are read nowhere yet and are not offered.
 */
export const ResponseWindowSettings: FC<{
  call: Call;
  isReadOnly?: boolean;
}> = ({ call, isReadOnly }) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: assignmentConfigurationKey(call.uuid),
    queryFn: () =>
      proposalProtectedCallsAssignmentConfigurationRetrieve({
        path: { uuid: call.uuid },
      }).then((response) => response.data),
    refetchOnWindowFocus: false,
  });
  const { mutateAsync: update } = useManagedMutation({
    mutationFn: (body: Record<string, number>) =>
      proposalProtectedCallsAssignmentConfigurationPartialUpdate({
        path: { uuid: call.uuid },
        body,
      }),
    successMessage: translate('The response window has been updated.'),
    errorMessage: translate('Unable to update the response window.'),
    invalidateQueries: [{ queryKey: assignmentConfigurationKey(call.uuid) }],
    closeModal: false,
  });

  if (isLoading) return <LoadingSpinner />;
  if (error || !data) {
    return (
      <LoadingErred
        message={translate('Failed to load the response window.')}
        loadData={refetch}
      />
    );
  }
  return (
    <EditFieldProvider
      scope={data}
      callback={update}
      readOnlyReason={isReadOnly ? getCallReadOnlyReason(call) : undefined}
    >
      <PropertyList>
        <NumberEditField
          name="assignment_expiration_days"
          label={translate('Days to respond')}
          description={translate(
            'How long a reviewer has to answer a pool invitation or an assignment batch before it expires. Applies to invitations and batches sent after the change.',
          )}
          disabled={isReadOnly}
          validate={validateDays}
          renderValue={(value) =>
            translate('{count} days', { count: value as number })
          }
        />
        <NumberEditField
          name="send_reminder_before_expiry_days"
          label={translate('Reminder before expiry')}
          description={translate(
            'How many days before an assignment batch expires its reviewer is reminded to answer.',
          )}
          disabled={isReadOnly}
          validate={validateDays}
          renderValue={(value) =>
            translate('{count} days before', { count: value as number })
          }
        />
      </PropertyList>
    </EditFieldProvider>
  );
};
