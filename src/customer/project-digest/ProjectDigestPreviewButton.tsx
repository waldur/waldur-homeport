import { EyeIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionButton } from '@/table/ActionButton';

const ProjectDigestPreviewDialog = lazyComponent(() =>
  import('./ProjectDigestPreviewDialog').then((m) => ({
    default: m.ProjectDigestPreviewDialog,
  })),
);

export const ProjectDigestPreviewButton = () => {
  const { openDialog } = useModal();
  return (
    <ActionButton
      action={() =>
        openDialog(ProjectDigestPreviewDialog, {
          size: 'xl',
        })
      }
      title={translate('Preview')}
      iconNode={<EyeIcon weight="bold" />}
    />
  );
};
