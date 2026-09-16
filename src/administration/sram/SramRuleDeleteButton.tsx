import { FC } from 'react';
import { SramProjectRule, sramProjectRulesDestroy } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

interface SramRuleDeleteButtonProps {
  row: SramProjectRule;
  refetch;
}

export const SramRuleDeleteButton: FC<SramRuleDeleteButtonProps> = ({
  row,
  refetch,
}) => {
  const { mutate, isPending } = useManagedMutation<unknown, unknown, void>({
    mutationFn: () => sramProjectRulesDestroy({ path: { uuid: row.uuid } }),
    refetch,
    confirmation: {
      title: translate('Delete SRAM project rule'),
      body: translate(
        'Are you sure you want to delete the rule {name}? The project roles it granted are revoked.',
        { name: <strong>{row.name}</strong> },
        formatJsxTemplate,
      ),
      options: {
        forDeletion: true,
      },
    },
    successMessage: translate('SRAM project rule has been deleted.'),
    errorMessage: translate('Unable to delete SRAM project rule.'),
  });

  return (
    <RemovalActionItem
      title={translate('Delete')}
      action={mutate}
      disabled={isPending}
    />
  );
};
