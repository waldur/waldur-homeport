import { RemoteProject } from 'waldur-js-client';

import { BadgeVariant } from 'waldur-ui';

import { StateIndicator } from '@/core/StateIndicator';

interface RemoteProjectStateFieldProps {
  project: Pick<RemoteProject, 'state' | 'state_display'>;
  hasBullet?: boolean;
}

const STATE_VARIANTS: Record<string, BadgeVariant> = {
  pending: 'warning',
  active: 'success',
  stale: 'warning',
  error: 'danger',
  deleted: 'neutral',
};

export const RemoteProjectStateField = ({
  project,
  hasBullet,
}: RemoteProjectStateFieldProps) => (
  <StateIndicator
    label={project.state_display || project.state}
    variant={STATE_VARIANTS[project.state] || 'neutral'}
    hasBullet={hasBullet}
    tone="outline"
    shape="pill"
    data-testid="remote-project-state-field"
  />
);
