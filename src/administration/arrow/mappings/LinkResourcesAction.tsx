import { LinkIcon } from '@phosphor-icons/react';
import type { ArrowCustomerMapping } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const LinkResourcesDialog = lazyComponent(() =>
  import('./LinkResourcesDialog').then((module) => ({
    default: module.LinkResourcesDialog,
  })),
);

export const LinkResourcesAction = ({ row }: { row: ArrowCustomerMapping }) => {
  const { openDialog } = useModal();

  return (
    <ActionItem
      title={translate('LinkIcon resources')}
      action={() => {
        openDialog(LinkResourcesDialog, {
          resolve: { mapping: row },
          size: 'xl',
        });
      }}
      iconNode={<LinkIcon weight="bold" />}
    />
  );
};
