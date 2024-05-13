import { Eye } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { connect } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const OfferingDetailsDialog = lazyComponent(
  () => import('./OfferingDetailsDialog'),
  'OfferingDetailsDialog',
);

export const openOfferingDetailsDialog = (offering: any) =>
  openModalDialog(OfferingDetailsDialog, {
    resolve: { offering },
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
    iconNode={<Eye />}
    action={props.openDialog}
    className="me-3"
  />
);

const mapDispatchToProps = (dispatch, ownProps) => ({
  openDialog: () => dispatch(openOfferingDetailsDialog(ownProps.offering)),
});

export const OfferingDetailsButton = connect(
  null,
  mapDispatchToProps,
)(PureOfferingDetailsButton);
