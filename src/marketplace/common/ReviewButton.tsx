import * as React from 'react';
import { connect } from 'react-redux';

import { translate } from '@waldur/i18n';
import { isVisible } from '@waldur/store/config';

import { OfferingButton } from '../common/OfferingButton';

const connector = connect(state => ({
  isVisible: isVisible(state, 'marketplace.review'),
}));

const PureReviewButton = props => props.isVisible ? (
  <OfferingButton
    icon="fa fa-comments"
    title={translate('Write review')}
  />
) : null;

export const ReviewButton = connector(PureReviewButton);
