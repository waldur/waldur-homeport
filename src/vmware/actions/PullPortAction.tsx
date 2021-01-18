import { PullActionItem } from '@waldur/resource/actions/PullActionItem';

import { pullPort } from '../api';

export const PullPortAction = ({ resource }) => (
  <PullActionItem apiMethod={pullPort} resource={resource} />
);
