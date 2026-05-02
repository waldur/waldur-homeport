import { ScienceDomain, scienceDomainsDestroy } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

interface ScienceDomainDeleteButtonProps {
  row: ScienceDomain;
  refetch;
}

export const ScienceDomainDeleteButton = (
  props: ScienceDomainDeleteButtonProps,
) => {
  const { mutate: mutate, isPending: isPending } = useManagedMutation<
    any,
    any,
    void
  >({
    mutationFn: () => scienceDomainsDestroy({ path: { uuid: props.row.uuid } }),
    refetch: props.refetch,

    confirmation: {
      title: translate('Confirmation'),

      body: translate(
        'Are you sure you want to delete the {name} science domain? This will also delete all its sub-domains.',
        { name: <strong>{props.row.name}</strong> },
        formatJsxTemplate,
      ),

      options: {
        forDeletion: true,
      },
    },

    errorMessage: translate('Unable to remove science domain.'),
  });

  return (
    <RemovalActionItem
      title={translate('Remove')}
      action={mutate}
      disabled={isPending}
    />
  );
};
