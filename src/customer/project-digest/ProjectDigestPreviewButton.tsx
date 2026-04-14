import { EyeIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

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
