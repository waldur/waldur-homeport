import { DropdownDivider } from 'react-bootstrap';
import { Project } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ActionDropdownButton } from '@/table/ActionDropdownButton';

import { BatchDeleteProjectAction } from './BatchDeleteProjectAction';
import { BatchMoveProjectAction } from './BatchMoveProjectAction';
import { BatchSetEndDateAction } from './BatchSetEndDateAction';

export const BatchProjectActions = ({
  rows,
  refetch,
}: {
  rows: Project[];
  refetch;
}) => (
  <ActionDropdownButton variant="primary" title={translate('All actions')}>
    <BatchMoveProjectAction rows={rows} refetch={refetch} />
    <BatchSetEndDateAction rows={rows} refetch={refetch} />
    <DropdownDivider className="border-top m-0" />
    <BatchDeleteProjectAction rows={rows} refetch={refetch} />
  </ActionDropdownButton>
);
