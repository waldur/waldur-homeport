import * as React from 'react';

import { withTranslation, TranslateProps } from '@waldur/i18n';
import { connectAngularComponent } from '@waldur/store/connect';

import { StateIndicator } from './StateIndicator';
import { Offering } from './types';

interface OfferingStateProps extends TranslateProps {
  offering: Offering;
}

export const PureOfferingState = (props: OfferingStateProps) => props.offering ? (
  <StateIndicator
    variant={props.offering.state === 'Terminated' ? 'danger' : 'primary'}
    active={props.offering.state === 'Requested'}
    label={props.translate(props.offering.state).toUpperCase()}
  />
) : null;

export const OfferingState = withTranslation(PureOfferingState);

export default connectAngularComponent(OfferingState, ['offering']);
