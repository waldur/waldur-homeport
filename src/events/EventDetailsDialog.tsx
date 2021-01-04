import React, { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { TranslateProps, withTranslation } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { RootState } from '@waldur/store/reducers';
import { isStaffOrSupport } from '@waldur/workspace/selectors';

import { EventDetailsTable } from './EventDetailsTable';
import { Event } from './types';

interface StateProps {
  isStaffOrSupport: boolean;
}

interface Props extends TranslateProps, StateProps {
  resolve: { event: Event };
}

const PureEventDetailsDialog: FunctionComponent<Props> = (props) => (
  <ModalDialog
    title={props.translate('Event details')}
    footer={<CloseDialogButton />}
  >
    <EventDetailsTable
      event={props.resolve.event}
      translate={props.translate}
      isStaffOrSupport={props.isStaffOrSupport}
    />
  </ModalDialog>
);

const mapStateToProps = (state: RootState) => ({
  isStaffOrSupport: isStaffOrSupport(state),
});

const enhance = compose(connect<StateProps>(mapStateToProps), withTranslation);

export const EventDetailsDialog = enhance(PureEventDetailsDialog);
