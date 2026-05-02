import { EyeIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { OrganizationGroup } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const OrganizationGroupDetailsDialog = lazyComponent(() =>
  import('./OrganizationGroupDetailsDialog').then((module) => ({
    default: module.OrganizationGroupDetailsDialog,
  })),
);

interface OrganizationGroupDetailsButtonProps {
  row: OrganizationGroup;
}

export const OrganizationGroupDetailsButton: FunctionComponent<
  OrganizationGroupDetailsButtonProps
> = (props) => {
  const { openDialog } = useModal();
  return (
    <ActionItem
      title={translate('Details')}
      iconNode={<EyeIcon weight="bold" />}
      action={() =>
        openDialog(OrganizationGroupDetailsDialog, {
          resolve: { organizationGroup: props.row },
          size: 'xl',
        })
      }
      size="sm"
    />
  );
};
