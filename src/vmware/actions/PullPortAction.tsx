import { PullActionItem } from '@waldur/resource/actions/PullActionItem';
import { ActionItemType } from '@waldur/resource/actions/types';

import { pullPort } from '../api';

export const PullPortAction: ActionItemType = ({ resource, refetch }) => (
  <PullActionItem apiMethod={pullPort} resource={resource} refetch={refetch} />
);
