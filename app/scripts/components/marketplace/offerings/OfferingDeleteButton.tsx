import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { withTranslation } from '@waldur/i18n/translate';
import ActionButton from '@waldur/table-react/ActionButton';

const PureOfferingDeleteButton = ({ onClick, translate }) => (
  <ActionButton
    title={translate('Delete')}
    action={onClick}
    icon={'fa fa-trash'}/>
);

const enhance = compose(
  withTranslation,
  connect(null, {
    onClick: () => alert('Not implemented yet'),
  })
);

export const OfferingDeleteButton = enhance(PureOfferingDeleteButton);
