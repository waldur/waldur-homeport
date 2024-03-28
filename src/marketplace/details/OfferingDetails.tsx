import { FunctionComponent } from 'react';

import { Offering } from '@waldur/marketplace/types';

import { DeployPage } from '../deploy/DeployPage';

import { OfferingTab } from './OfferingTabsComponent';

import './OfferingDetails.scss';

export interface OfferingDetailsProps {
  offering: Offering;
  tabs: OfferingTab[];
  limits: string[];
}

export const OfferingDetails: FunctionComponent<OfferingDetailsProps> = (
  props,
) => <DeployPage offering={props.offering} limits={props.limits} />;
