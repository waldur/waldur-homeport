import { QuestionIcon } from '@phosphor-icons/react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

const ProjectDigestSummaryDialog = lazyComponent(() =>
  import('./ProjectDigestSummaryDialog').then((m) => ({
    default: m.ProjectDigestSummaryDialog,
  })),
);

export const ProjectDigestSummaryButton = () => {
  const { openDialog } = useModal();
  return (
    <BaseButton
      onClick={() =>
        openDialog(ProjectDigestSummaryDialog, {
          size: 'xl',
        })
      }
      label={translate('How it works')}
      iconNode={<QuestionIcon weight="bold" />}
      variant="tertiary"
      size="lg"
    />
  );
};
