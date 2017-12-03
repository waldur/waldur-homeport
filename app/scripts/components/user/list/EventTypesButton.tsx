import * as React from 'react';
import { connect } from 'react-redux';

import { openModalDialog } from '@waldur/table-react/actions';
import { withTranslation } from '@waldur/i18n/translate';
import ActionButton from '@waldur/table-react/ActionButton';

const EventTypesButton = ({ showEventTypes, translate }) => (
  <ActionButton
    title={translate('Event types')}
    action={showEventTypes}
    icon={'fa fa-question-circle'}/>
);

const showEventTypes = () => openModalDialog('eventTypesDialog');

export default withTranslation(connect(null, {showEventTypes})(EventTypesButton));
