import {
  AffiliatedOrganization,
  affiliatedOrganizationsDestroy,
} from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

interface AffiliatedOrganizationDeleteButtonProps {
  row: AffiliatedOrganization;
  refetch;
}

export const AffiliatedOrganizationDeleteButton = (
  props: AffiliatedOrganizationDeleteButtonProps,
) => {
  const { mutate: mutate, isPending: isPending } = useManagedMutation<
    any,
    any,
    void
  >({
    mutationFn: () =>
      affiliatedOrganizationsDestroy({ path: { uuid: props.row.uuid } }),
    refetch: props.refetch,

    confirmation: {
      title: translate('Confirmation'),

      body: translate(
        'Are you sure you want to delete the {name} affiliated organization?',
        { name: <strong>{props.row.name}</strong> },
        formatJsxTemplate,
      ),

      options: {
        forDeletion: true,
      },
    },

    errorMessage: translate('Unable to remove affiliated organization.'),
  });

  return (
    <RemovalActionItem
      title={translate('Remove')}
      action={mutate}
      disabled={isPending}
    />
  );
};
