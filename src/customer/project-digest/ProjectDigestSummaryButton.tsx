import { QuestionIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

const ProjectDigestSummaryDialog = lazyComponent(() =>
  import('./ProjectDigestSummaryDialog').then((m) => ({
    default: m.ProjectDigestSummaryDialog,
  })),
);

export const ProjectDigestSummaryButton = () => {
  const dispatch = useDispatch();
  return (
    <ActionButton
      action={() =>
        dispatch(
          openModalDialog(ProjectDigestSummaryDialog, {
            size: 'xl',
          }),
        )
      }
      title={translate('How it works')}
      iconNode={<QuestionIcon weight="bold" />}
    />
  );
};
