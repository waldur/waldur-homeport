import { LinkIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import type { ArrowCustomerMapping } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const LinkResourcesDialog = lazyComponent(() =>
  import('./LinkResourcesDialog').then((module) => ({
    default: module.LinkResourcesDialog,
  })),
);

export const LinkResourcesAction = ({ row }: { row: ArrowCustomerMapping }) => {
  const dispatch = useDispatch();

  const handleClick = () => {
    dispatch(
      openModalDialog(LinkResourcesDialog, {
        resolve: { mapping: row },
        size: 'xl',
      }),
    );
  };

  return (
    <ActionItem
      title={translate('LinkIcon resources')}
      action={handleClick}
      iconNode={<LinkIcon weight="bold" />}
    />
  );
};
