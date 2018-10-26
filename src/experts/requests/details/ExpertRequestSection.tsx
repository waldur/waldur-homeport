import * as React from 'react';

import { connectAngularComponent } from '@waldur/store/connect';

import {
  ExpertRequestConfiguration,
  ExpertRequestConfigurationProps
} from './ExpertRequestConfiguration';

export const ExpertRequestSection = (props: ExpertRequestConfigurationProps) => (
  <dl className="dl-horizontal">
    <ExpertRequestConfiguration {...props}/>
  </dl>
);

export default connectAngularComponent(ExpertRequestSection, ['config', 'model']);
