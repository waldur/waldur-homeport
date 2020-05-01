import { connect } from 'react-redux';

import { translate } from '@waldur/i18n';
import { ActionsDropdown } from '@waldur/marketplace/offerings/actions/ActionsDropdown';
import { removeOfferingScreenshot } from '@waldur/marketplace/offerings/store/actions';
import { getOffering } from '@waldur/marketplace/offerings/store/selectors';
import { Offering, Screenshot } from '@waldur/marketplace/types';
import { waitForConfirmation } from '@waldur/modal/actions';
import { getUser } from '@waldur/workspace/selectors';
import { OuterState } from '@waldur/workspace/types';

const openDialog = async (
  dispatch,
  screenshot: Screenshot,
  offering: Offering,
) => {
  try {
    await waitForConfirmation(
      dispatch,
      translate('Confirmation'),
      translate('Are you sure you want to delete the screenshot?'),
    );
  } catch {
    return;
  }
  dispatch(removeOfferingScreenshot(offering, screenshot));
};

const mapStateToProps = (state: OuterState) => ({
  user: getUser(state),
  offering: getOffering(state).offering,
});

const mapDispatchToProps = dispatch => ({
  openConfirmationDialog: (screenshot: Screenshot, offering: Offering) =>
    openDialog(dispatch, screenshot, offering),
});

const mergeProps = (stateProps, dispatchProps, ownProps) => ({
  actions: [
    {
      label: translate('Delete'),
      handler: () =>
        dispatchProps.openConfirmationDialog(ownProps.row, stateProps.offering),
      visible: stateProps.user.is_staff,
    },
  ].filter(row => row.visible),
});

const enhance = connect(mapStateToProps, mapDispatchToProps, mergeProps);

export const OfferingScreenshotsActions = enhance(ActionsDropdown);
