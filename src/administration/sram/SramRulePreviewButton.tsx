import { EyeIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { SramProjectRule } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const SramRulePreviewDialog = lazyComponent(() =>
  import('./SramRulePreviewDialog').then((module) => ({
    default: module.SramRulePreviewDialog,
  })),
);

export const SramRulePreviewButton: FC<{ row: SramProjectRule }> = ({
  row,
}) => {
  const { openDialog } = useModal();
  return (
    <ActionItem
      title={translate('Preview')}
      iconNode={<EyeIcon weight="bold" />}
      action={() =>
        openDialog(SramRulePreviewDialog, {
          resolve: { rule: row },
          size: 'xl',
        })
      }
    />
  );
};
