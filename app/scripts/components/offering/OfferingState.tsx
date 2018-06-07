import * as classNames from 'classnames';
import * as React from 'react';

import { withTranslation, TranslateProps } from '@waldur/i18n';
import { connectAngularComponent } from '@waldur/store/connect';

import { Offering } from './types';

interface OfferingStateProps extends TranslateProps {
  offering: Offering;
}

export const PureOfferingState = (props: OfferingStateProps) => (
  <span className={classNames('label', {
    'label-success': props.offering.state === 'OK',
    'label-warning': props.offering.state === 'Requested',
    'label-danger': props.offering.state === 'Terminated',
  })}>
    {props.translate(props.offering.state).toUpperCase()}
  </span>
);

export const OfferingState = withTranslation(PureOfferingState);

export default connectAngularComponent(OfferingState, ['offering']);
