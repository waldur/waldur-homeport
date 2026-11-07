import { useQueryClient } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { proposalProtectedCallsPartialUpdate } from 'waldur-js-client';

import { PropertyCard, PropertyList } from 'waldur-ui';

import { EditFieldProvider, SelectEditField } from '@/form/editFields';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { getBudgetEnforcementOptions } from '@/proposals/budgets';
import { Call } from '@/proposals/types';
import { getCallReadOnlyReason } from '@/proposals/utils';

interface AllocationSettingsSectionProps {
  call: Call;
  refetch: () => void;
  isReadOnly?: boolean;
}

/**
 * How the call's awards are held to what it offers: the settings of the
 * allocation decision, beside the role mapping that turns an awarded
 * proposal into a project.
 */
export const AllocationSettingsSection: FC<AllocationSettingsSectionProps> = ({
  call,
  refetch,
  isReadOnly,
}) => {
  const queryClient = useQueryClient();
  const { mutateAsync: updateCall } = useManagedMutation({
    mutationFn: (body: any) =>
      proposalProtectedCallsPartialUpdate({ path: { uuid: call.uuid }, body }),
    successMessage: translate('The call has been updated.'),
    errorMessage: translate('Unable to update call.'),
    onSuccess: async () => {
      refetch();
      await queryClient.invalidateQueries({ queryKey: ['Call', call.uuid] });
    },
    closeModal: false,
  });
  const budgetEnforcementOptions = useMemo(getBudgetEnforcementOptions, []);

  return (
    <PropertyCard
      bordered
      title={translate('Allocation settings')}
      className="mb-5"
    >
      <EditFieldProvider
        scope={call}
        callback={updateCall}
        readOnlyReason={isReadOnly ? getCallReadOnlyReason(call) : undefined}
      >
        <PropertyList>
          <SelectEditField
            name="budget_enforcement"
            label={translate('Awards past the resource pools')}
            description={translate(
              "How the allocation decision is held to the call's resource pools. Soft lets a call manager approve an award past what remains, with an override and a reason. Hard refuses it; only staff may override. Changing it affects only later decisions.",
            )}
            options={budgetEnforcementOptions}
            simpleValue
            isClearable={false}
            disabled={isReadOnly}
            renderValue={(value) =>
              budgetEnforcementOptions.find((o) => o.value === value)?.label ||
              budgetEnforcementOptions[0].label
            }
          />
        </PropertyList>
      </EditFieldProvider>
    </PropertyCard>
  );
};
