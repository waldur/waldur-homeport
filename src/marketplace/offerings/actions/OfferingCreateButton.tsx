import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { Link } from '@waldur/core/Link';
import { TranslateProps } from '@waldur/i18n';
import { withTranslation } from '@waldur/i18n/translate';

import { isOfferingManagementDisabled } from '../store/selectors';

interface PureOfferingCreateButtonProps extends TranslateProps {
  disabled: boolean;
}

const PureOfferingCreateButton = (props: PureOfferingCreateButtonProps) =>
  props.disabled ? (
    null
  ) : (
    <Link
      state="marketplace-offering-create"
      className="btn btn-default btn-sm">
      <i className="fa fa-plus"/>
      {' '}
      {props.translate('Add offering')}
    </Link>
);

const connector = connect(state => ({
  disabled: isOfferingManagementDisabled(state),
}));

const enhance = compose(connector, withTranslation);

export const OfferingCreateButton = enhance(PureOfferingCreateButton);
