import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { TranslateProps, withTranslation } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { isStaffOrSupport } from '@waldur/workspace/selectors';

import { EventDetailsTable } from './EventDetailsTable';
import { Event } from './types';

interface StateProps {
  isStaffOrSupport: boolean;
}

interface Props extends TranslateProps, StateProps {
  resolve: { event: Event };
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

const mapStateToProps = (state) => ({
  isStaffOrSupport: isStaffOrSupport(state),
});

const enhance = compose(connect<StateProps>(mapStateToProps), withTranslation);

export const EventDetailsDialog = enhance(
  PureEventDetailsDialog,
) as React.ComponentType<{}>;
