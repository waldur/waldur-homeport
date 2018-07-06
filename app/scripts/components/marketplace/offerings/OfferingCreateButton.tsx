import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { withTranslation } from '@waldur/i18n/translate';
import { openModalDialog } from '@waldur/modal/actions';
import ActionButton from '@waldur/table-react/ActionButton';

const PureOfferingCreateButton = ({ onClick, translate }) => (
  <ActionButton
    title={translate('Add offering')}
    action={onClick}
    icon={'fa fa-plus'}/>
);

const enhance = compose(
  withTranslation,
  connect(null, {
    onClick: () => openModalDialog('offeringCreateDialog'),
  })
);

export const OfferingCreateButton = enhance(PureOfferingCreateButton);
