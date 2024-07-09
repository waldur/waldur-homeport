import { Eye } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { OrganizationGroup } from '@waldur/marketplace/types';
import { openModalDialog } from '@waldur/modal/actions';
import { RowActionButton } from '@waldur/table/ActionButton';

const OrganizationGroupDetailsDialog = lazyComponent(
  () => import('./OrganizationGroupDetailsDialog'),
  'OrganizationGroupDetailsDialog',
);

interface OrganizationGroupDetailsButtonProps {
  organizationGroup: OrganizationGroup;
}

const openOrganizationGroupsDialog = (organizationGroup: OrganizationGroup) => {
  return openModalDialog(OrganizationGroupDetailsDialog, {
    resolve: { organizationGroup },
    size: 'xl',
  });
};

export const OrganizationGroupDetailsButton: FunctionComponent<
  OrganizationGroupDetailsButtonProps
> = (props) => {
  const dispatch = useDispatch();
  return (
    <RowActionButton
      title={translate('Details')}
      iconNode={<Eye />}
      action={() =>
        dispatch(openOrganizationGroupsDialog(props.organizationGroup))
      }
      size="sm"
    />
  );
};
