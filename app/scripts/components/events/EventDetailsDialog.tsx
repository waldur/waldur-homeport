import * as React from 'react';

import { TranslateProps, withTranslation } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { connectAngularComponent } from '@waldur/store/connect';

import { EventDetailsTable } from './EventDetailsTable';
import { Event } from './types';

interface Props extends TranslateProps {
  resolve: { event: Event };
}

const PureEventDetailsDialog = (props: Props) => (
  <ModalDialog title={props.translate('Event details')} footer={<CloseDialogButton/>}>
    <EventDetailsTable event={props.resolve.event}/>
  </ModalDialog>
);

export const EventDetailsDialog = withTranslation(PureEventDetailsDialog);

export default connectAngularComponent(EventDetailsDialog, ['resolve']);
