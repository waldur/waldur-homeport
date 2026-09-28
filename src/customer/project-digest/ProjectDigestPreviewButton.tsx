import { EyeIcon } from '@phosphor-icons/react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

const ProjectDigestPreviewDialog = lazyComponent(() =>
  import('./ProjectDigestPreviewDialog').then((m) => ({
    default: m.ProjectDigestPreviewDialog,
  })),
);

export const ProjectDigestPreviewButton = () => {
  const { openDialog } = useModal();
  return (
    <BaseButton
      onClick={() =>
        openDialog(ProjectDigestPreviewDialog, {
          size: 'xl',
        })
      }
      label={translate('Preview')}
      iconNode={<EyeIcon weight="bold" />}
      variant="tertiary"
      size="lg"
    />
  );
};
