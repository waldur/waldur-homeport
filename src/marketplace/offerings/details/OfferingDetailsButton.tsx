import { FunctionComponent } from 'react';
import { connect } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const OfferingDetailsDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "OfferingDetailsDialog" */ './OfferingDetailsDialog'
    ),
  'OfferingDetailsDialog',
);

const openOfferingDetailsDialog = (offeringUuid: string) =>
  openModalDialog(OfferingDetailsDialog, {
    resolve: { offeringUuid },
    size: 'lg',
  });

interface OfferingDetailsButton {
  offering: string;
  openDialog(): void;
}

const PureOfferingDetailsButton: FunctionComponent<OfferingDetailsButton> = (
  props,
) => (
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
