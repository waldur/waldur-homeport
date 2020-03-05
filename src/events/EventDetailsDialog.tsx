import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { TranslateProps, withTranslation } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { connectAngularComponent } from '@waldur/store/connect';
import { isStaffOrSupport } from '@waldur/workspace/selectors';

import { EventDetailsTable } from './EventDetailsTable';
import { Event } from './types';

interface Props extends TranslateProps {
  resolve: { event: Event };
  isStaffOrSupport: boolean;
}

const PureEventDetailsDialog = (props: Props) => (
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

const mapStateToProps = state => ({
  isStaffOrSupport: isStaffOrSupport(state),
});

const enhance = compose(connect(mapStateToProps), withTranslation);

export const EventDetailsDialog = enhance(PureEventDetailsDialog);

export default connectAngularComponent(EventDetailsDialog, ['resolve']);
