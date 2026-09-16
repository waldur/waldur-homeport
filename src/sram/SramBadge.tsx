import { FC } from 'react';

import { Badge } from '@/core/Badge';
import { translate } from '@/i18n';

import {
  getSramGrantKind,
  getSramGrantTooltip,
  isSramPlaceholderRoleName,
  isSramUiEnabled,
} from './utils';

const SramBadgeView: FC<{ tooltip: string; className?: string }> = ({
  tooltip,
  className,
}) => (
  <Badge
    variant="teal"
    size="sm"
    pill
    outline
    tooltip={tooltip}
    className={className}
    data-testid="sram-badge"
  >
    {translate('SRAM')}
  </Badge>
);

/** Small "SRAM" marker for a role grant created by the SRAM integration. */
export const SramGrantBadge: FC<{ source?: string | null }> = ({ source }) => {
  const kind = getSramGrantKind(source);
  if (!kind || !isSramUiEnabled()) return null;
  return <SramBadgeView tooltip={getSramGrantTooltip(kind)} />;
};

/** Small "SRAM" marker for an SRAM placeholder role. */
export const SramRoleBadge: FC<{
  roleName?: string | null;
  className?: string;
}> = ({ roleName, className }) => {
  if (!isSramPlaceholderRoleName(roleName) || !isSramUiEnabled()) return null;
  return (
    <SramBadgeView
      className={className}
      tooltip={translate(
        'Placeholder role for an SRAM collaboration or group. Its description is the SRAM display name.',
      )}
    />
  );
};

/**
 * Marker for a row of a team list: the grant badge when the row reports an
 * SRAM grant source, else the role badge when the role is an SRAM
 * placeholder. Organization member rows carry no source, so they fall back to
 * the role.
 */
export const SramTeamMarker: FC<{
  source?: string | null;
  roleName?: string | null;
}> = ({ source, roleName }) =>
  getSramGrantKind(source) ? (
    <SramGrantBadge source={source} />
  ) : (
    <SramRoleBadge roleName={roleName} />
  );
