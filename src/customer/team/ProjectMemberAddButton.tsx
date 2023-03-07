import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

interface ProjectMemberAddButtonProps {
  refetch;
}

const ProjectMemberAddDialog = lazyComponent(
  () => import('@waldur/project/team/AddProjectUserDialog'),
  'AddProjectUserDialog',
);

export const ProjectMemberAddButton: FunctionComponent<ProjectMemberAddButtonProps> =
  ({ refetch }) => {
    const dispatch = useDispatch();
    return (
      <ActionButton
        action={() =>
          dispatch(
            openModalDialog(ProjectMemberAddDialog, {
              refetch,
              level: 'organization',
              title: translate('Add member'),
            }),
          )
        }
        title={translate('Add member')}
        icon="fa fa-plus"
        variant="primary"
      />
    );
  };
