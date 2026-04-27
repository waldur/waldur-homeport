import { EyeIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

const ProjectDigestPreviewDialog = lazyComponent(() =>
  import('./ProjectDigestPreviewDialog').then((m) => ({
    default: m.ProjectDigestPreviewDialog,
  })),
);

export const ProjectDigestPreviewButton = () => {
  const dispatch = useDispatch();
  return (
    <ActionButton
      action={() =>
        dispatch(
          openModalDialog(ProjectDigestPreviewDialog, {
            size: 'xl',
          }),
        )
      }
      title={translate('Preview')}
      iconNode={<EyeIcon weight="bold" />}
    />
  );
};
