import { onboardingVerificationsDestroy } from 'waldur-js-client';

import { translate, formatJsxTemplate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

export const OnboardingVerificationDeleteAction = (props) => {
  const { mutate: mutate, isPending: isPending } = useManagedMutation<
    any,
    any,
    void
  >({
    mutationFn: () =>
      onboardingVerificationsDestroy({ path: { uuid: props.row.uuid } }),
    refetch: props.refetch,

    confirmation: {
      title: translate('Confirmation'),

      body: translate(
        'Are you sure you want to delete the verification entry for {name}?',
        {
          name: (
            <strong>
              {props.row.verified_company_data.name || props.row.legal_name}
            </strong>
          ),
        },
        formatJsxTemplate,
      ),

      options: {
        forDeletion: true,
      },
    },

    successMessage: translate('Verification entry removed successfully.'),
    errorMessage: translate('Unable to remove verification entry.'),
  });

  return (
    <RemovalActionItem
      title={translate('Remove')}
      action={mutate}
      disabled={isPending}
    />
  );
};
