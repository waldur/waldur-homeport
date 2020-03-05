import * as React from 'react';
import { connect } from 'react-redux';
import { getFormValues } from 'redux-form';

import { translate } from '@waldur/i18n';

import { FORM_ID } from '../store/constants';

import { AccountingSummary } from './AccountingSummary';
import { DescriptionSummary } from './DescriptionSummary';
import { ManagementSummary } from './ManagementSummary';
import { OverviewSummary } from './OverviewSummary';

const PureReviewStep = props =>
  !props.hasData ? (
    <p className="text-center">
      {translate('Offering is not configured yet.')}
    </p>
  ) : (
    <>
      <OverviewSummary />
      <ManagementSummary isVisible={props.isVisible} />
      <DescriptionSummary />
      <AccountingSummary />
    </>
  );

const connector = connect(state => {
  const formData = getFormValues(FORM_ID)(state) as any;
  const hasData = formData && !!formData.type;
  return { hasData };
});

export const ReviewStep = connector(PureReviewStep);
