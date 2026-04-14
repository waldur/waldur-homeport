import { QuestionIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

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
