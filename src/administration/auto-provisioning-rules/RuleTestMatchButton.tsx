import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Rule } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const RuleTestMatchDialog = lazyComponent(() =>
  import('./RuleTestMatchDialog').then((module) => ({
    default: module.RuleTestMatchDialog,
  })),
);

export const RuleTestMatchButton: FC<{ row: Rule }> = ({ row }) => {
  const { openDialog } = useModal();
  return (
    <ActionItem
      title={translate('Test match')}
      iconNode={<MagnifyingGlassIcon weight="bold" />}
      action={() =>
        openDialog(RuleTestMatchDialog as any, {
          resolve: { rule: row },
          size: 'lg',
        })
      }
    />
  );
};
