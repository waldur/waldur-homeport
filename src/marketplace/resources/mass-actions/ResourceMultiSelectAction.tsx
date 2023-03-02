import { Resource } from '../types';

import { MultiDestroyAction } from './MultiDestroyAction';
import { MultiMoveAction } from './MultiMoveAction';
import { MultiPullAction } from './MultiPullAction';
import { MultiRestartAction } from './MultiRestartAction';
import { MultiStartAction } from './MultiStartAction';
import { MultiStopAction } from './MultiStopAction';

export const ResourceMultiSelectAction = ({
  rows,
  refetch,
}: {
  rows: Resource[];
  refetch(): void;
}) => (
  <>
    <MultiStopAction rows={rows} refetch={refetch} />
    <MultiStartAction rows={rows} refetch={refetch} />
    <MultiRestartAction rows={rows} refetch={refetch} />
    <MultiPullAction rows={rows} refetch={refetch} />
    <MultiMoveAction rows={rows} refetch={refetch} />
    <MultiDestroyAction rows={rows} refetch={refetch} />
  </>
);
