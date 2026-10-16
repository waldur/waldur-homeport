import { Badge } from '../Badge';
import { LoadingSpinner } from '../LoadingSpinner';

/** A tab's count badge: primary on the active tab, neutral on the rest. */
export const TabCount = ({
  count,
  loading,
  active,
}: {
  count?: number;
  loading?: boolean;
  active: boolean;
}) =>
  loading || count !== undefined ? (
    <Badge
      variant={active ? 'primary' : 'neutral'}
      shape="pill"
      tone="outline"
      className="ms-2"
    >
      {loading ? <LoadingSpinner size={12} /> : count}
    </Badge>
  ) : null;
