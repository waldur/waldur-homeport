import { DropdownButton, DropdownDivider } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

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
  <DropdownButton variant="primary" title={translate('All actions')}>
    <MultiStopAction rows={rows} refetch={refetch} />
    <MultiStartAction rows={rows} refetch={refetch} />
    <MultiRestartAction rows={rows} refetch={refetch} />
    <MultiPullAction rows={rows} refetch={refetch} />
    <MultiMoveAction rows={rows} refetch={refetch} />
    <DropdownDivider className="border-top m-0" />
    <MultiDestroyAction rows={rows} refetch={refetch} />
  </DropdownButton>
);
