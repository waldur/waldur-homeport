import { lazyComponent } from '@waldur/core/lazyComponent';
import { ActionRegistry } from '@waldur/resource/actions/registry';
import * as ResourceSummary from '@waldur/resource/summary/registry';

import { INSTANCE_TYPE } from '../constants';

import { StartAction } from './actions/StartAction';
import { StopAction } from './actions/StopAction';

import './marketplace';
import './tabs';

const OpenStackInstanceSummary = lazyComponent(
  () => import('./OpenStackInstanceSummary'),
  'OpenStackInstanceSummary',
);

ResourceSummary.register(INSTANCE_TYPE, OpenStackInstanceSummary);
ActionRegistry.registerQuickActions(INSTANCE_TYPE, [StartAction, StopAction]);
