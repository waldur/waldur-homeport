import { RemoteProject } from 'waldur-js-client';

import { StateIndicator } from '@/core/StateIndicator';

interface RemoteProjectStateFieldProps {
  project: Pick<RemoteProject, 'state' | 'state_display'>;
  hasBullet?: boolean;
}

export const RemoteProjectStateField = ({
  project,
  hasBullet,
}: RemoteProjectStateFieldProps) => (
  <StateIndicator
    label={project.state_display || project.state}
    variant={
      {
        pending: 'warning',
        active: 'success',
        stale: 'warning',
        error: 'danger',
        deleted: 'default',
      }[project.state] || 'default'
    }
    hasBullet={hasBullet}
    outline
    pill
    data-testid="remote-project-state-field"
  />
);
