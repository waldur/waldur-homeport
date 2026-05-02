import { QuestionIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

const ProjectDigestSummaryDialog = lazyComponent(() =>
  import('./ProjectDigestSummaryDialog').then((m) => ({
    default: m.ProjectDigestSummaryDialog,
  })),
);

export const ProjectDigestSummaryButton = () => {
  const { openDialog } = useModal();
  return (
    <ActionButton
      action={() =>
        openDialog(ProjectDigestSummaryDialog, {
          size: 'xl',
        })
      }
      title={translate('How it works')}
      iconNode={<QuestionIcon weight="bold" />}
    />
  );
};
