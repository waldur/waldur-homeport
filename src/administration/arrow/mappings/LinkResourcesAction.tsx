import { LinkIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import type { ArrowCustomerMapping } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

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
