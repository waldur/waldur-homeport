import * as React from 'react';
import { connect } from 'react-redux';

import { showEventTypes } from '@waldur/events/actions';
import { withTranslation } from '@waldur/i18n/translate';
import ActionButton from '@waldur/table-react/ActionButton';

const EventTypesButton = ({ showEventTypes, translate }) => (
  <ActionButton
    title={translate('Event types')}
    action={showEventTypes}
    icon={'fa fa-question-circle'}/>
);

export default withTranslation(connect(null, {showEventTypes})(EventTypesButton));
