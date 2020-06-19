import * as React from 'react';
import { connect } from 'react-redux';

import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

import { OfferingDetailsDialog } from './OfferingDetailsDialog';

const openOfferingDetailsDialog = (offeringUuid: string) =>
  openModalDialog(OfferingDetailsDialog, {
    resolve: { offeringUuid },
    size: 'lg',
  });

interface OfferingDetailsButton {
  offering: string;
  openDialog(): void;
}

const PureOfferingDetailsButton = (props: OfferingDetailsButton) => (
  <ActionButton
    title={translate('Offering details')}
    icon="fa fa-eye"
    action={props.openDialog}
  />
);

const mapDispatchToProps = (dispatch, ownProps) => ({
  openDialog: () => dispatch(openOfferingDetailsDialog(ownProps.offering)),
});

export const OfferingDetailsButton = connect(
  null,
  mapDispatchToProps,
)(PureOfferingDetailsButton);
