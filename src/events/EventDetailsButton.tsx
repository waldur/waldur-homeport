import * as React from 'react';
import {connect} from 'react-redux';

import { withTranslation } from '@waldur/i18n/translate';
import { openModalDialog } from '@waldur/modal/actions';
import ActionButton from '@waldur/table-react/ActionButton';

const EventDetailsButton = ({ row, onShowEventsDetails, translate }) => (
  <ActionButton
    title={translate('Details')}
    action={() => onShowEventsDetails(row)}
    icon="fa fa-eye"/>
);

const showEventsDetails = event => openModalDialog('eventDetailsDialog', {resolve: {event}});

export default withTranslation(connect(null, {onShowEventsDetails: showEventsDetails})(EventDetailsButton));
