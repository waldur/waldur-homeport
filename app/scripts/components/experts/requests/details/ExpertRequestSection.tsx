import * as React from 'react';
import { react2angular } from 'react2angular';

import {
  ExpertRequestConfiguration,
  ExpertRequestConfigurationProps
} from './ExpertRequestConfiguration';

export const ExpertRequestSection = (props: ExpertRequestConfigurationProps) => (
  <dl className="dl-horizontal">
    <ExpertRequestConfiguration {...props}/>
  </dl>
);

export default react2angular(ExpertRequestSection, ['config', 'model']);
