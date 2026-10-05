import { Project } from 'waldur-js-client';

import { ButtonSize, Menu } from 'waldur-ui';

import { translate } from '@/i18n';

import { BatchDeleteProjectAction } from './BatchDeleteProjectAction';
import { BatchMoveProjectAction } from './BatchMoveProjectAction';
import { BatchSetEndDateAction } from './BatchSetEndDateAction';

export const BatchProjectActions = ({
  rows,
  refetch,
  size = 'lg',
}: {
  rows: Project[];
  refetch;
  size?: ButtonSize;
}) => (
  <Menu>
    <Menu.TriggerButton variant="primary" size={size}>
      {translate('All actions')}
    </Menu.TriggerButton>
    <Menu.Content look="actions" side="bottom">
      <BatchMoveProjectAction rows={rows} refetch={refetch} />
      <BatchSetEndDateAction rows={rows} refetch={refetch} />
      <Menu.Separator className="border-top m-0" />
      <BatchDeleteProjectAction rows={rows} refetch={refetch} />
    </Menu.Content>
  </Menu>
);
