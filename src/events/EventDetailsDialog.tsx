import { FunctionComponent } from 'react';
import { connect } from 'react-redux';

import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { RootState } from '@waldur/store/reducers';
import { isStaffOrSupport } from '@waldur/workspace/selectors';

import { EventDetailsTable } from './EventDetailsTable';
import { Event } from './types';

interface StateProps {
  isStaffOrSupport: boolean;
}

interface EventDetailsDialogProps extends StateProps {
  resolve: { event: Event };
}

const PureEventDetailsDialog: FunctionComponent<EventDetailsDialogProps> = (
  props,
) => (
  <ModalDialog
    title={translate('Event details')}
    footer={<CloseDialogButton />}
  >
    <EventDetailsTable
      event={props.resolve.event}
      isStaffOrSupport={props.isStaffOrSupport}
    />
  </ModalDialog>
);

const mapStateToProps = (state: RootState) => ({
  isStaffOrSupport: isStaffOrSupport(state),
});

const enhance = connect<StateProps>(mapStateToProps);

export const EventDetailsDialog = enhance(PureEventDetailsDialog);
