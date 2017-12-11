import * as React from 'react';
import {connect} from 'react-redux';

import { openModalDialog } from '@waldur/modal/actions';
import { withTranslation } from '@waldur/i18n/translate';
import ActionButton from '@waldur/table-react/ActionButton';

const EventDetailsButton = ({ row, showEventsDetails, translate }) => (
  <ActionButton
    title={translate('Details')}
    action={() => showEventsDetails(row)}
    icon={'fa fa-eye'}/>
);

const showEventsDetails = event => openModalDialog('eventDetailsDialog', {resolve: {event}});

export default withTranslation(connect(null, {showEventsDetails})(EventDetailsButton));
