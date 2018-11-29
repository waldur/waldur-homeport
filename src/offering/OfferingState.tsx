import * as React from 'react';

import { StateIndicator } from '@waldur/core/StateIndicator';
import { withTranslation, TranslateProps } from '@waldur/i18n';
import { connectAngularComponent } from '@waldur/store/connect';

import { Offering } from './types';

interface OfferingStateProps extends TranslateProps {
  offering: Pick<Offering, 'state'>;
}

export const PureOfferingState = (props: OfferingStateProps) => props.offering ? (
  <StateIndicator
    variant={props.offering.state === 'Terminated' ? 'danger' : 'primary'}
    active={props.offering.state === 'Requested'}
    label={props.translate(props.offering.state)}
  />
) : null;

export const OfferingState = withTranslation(PureOfferingState);

export default connectAngularComponent(OfferingState, ['offering']);
