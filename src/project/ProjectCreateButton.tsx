import { FunctionComponent } from 'react';
import { connect } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n/translate';
import { closeModalDialog, openModalDialog } from '@waldur/modal/actions';
import { RootState } from '@waldur/store/reducers';
import { ActionButton } from '@waldur/table/ActionButton';
import { getCustomer, isOwnerOrStaff } from '@waldur/workspace/selectors';

import { createProject } from './actions';

const ProjectCreateDialog = lazyComponent(
  () => import('./ProjectCreateDialog'),
  'ProjectCreateDialog',
);

interface ProjectCreateButtonProps {
  title?: string;
  icon?: string;
  variant?: string;
}

const PureProjectCreateButton: FunctionComponent<any> = (props) => (
  <ActionButton
    title={props.title}
    action={props.openProjectCreateDialog}
    tooltip={props.tooltip}
    icon={props.icon}
    variant={props.variant}
    disabled={props.disabled}
  />
);

PureProjectCreateButton.defaultProps = {
  title: translate('Add project'),
  variant: 'primary',
  icon: 'fa fa-plus',
};

const mapStateToProps = (state: RootState) => {
  const ownerOrStaff = isOwnerOrStaff(state);
  const customer = getCustomer(state);

  if (!ownerOrStaff || !customer) {
    return {
      disabled: true,
      tooltip: translate(
        "You don't have enough privileges to perform this operation.",
      ),
    };
  } else {
    return {
      disabled: false,
    };
  }
};

const mapDispatchToProps = (dispatch) => ({
  openProjectCreateDialog: () =>
    dispatch(
      openModalDialog(ProjectCreateDialog, {
        size: 'lg',
        onSubmit: (formData) => {
          createProject(formData, dispatch).then(() => {
            dispatch(closeModalDialog());
          });
        },
        onCancel: () => {
          dispatch(closeModalDialog());
        },
        initialValues: null,
      }),
    ),
});

const enhance = connect(mapStateToProps, mapDispatchToProps);

export const ProjectCreateButton = enhance<
  FunctionComponent<ProjectCreateButtonProps>
>(PureProjectCreateButton);
