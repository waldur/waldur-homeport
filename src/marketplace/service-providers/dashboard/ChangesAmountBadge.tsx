interface ChangesAmountBadgeProps {
  changes: number;
  showOnInfinity?: boolean;
  showOnZero?: boolean;
  fractionDigits?: number;
}
export const ChangesAmountBadge = ({
  changes,
  showOnInfinity,
  showOnZero,
  fractionDigits = 2,
}: ChangesAmountBadgeProps) =>
  changes !== 0 && !Number.isNaN(changes) ? (
    changes < 0 ? (
      changes !== -Infinity ? (
        <span className="badge badge-light-danger">
          ↓ {Math.abs(changes).toFixed(fractionDigits)}%
        </span>
      ) : showOnInfinity ? (
        <span className="badge badge-light-danger">↓</span>
      ) : null
    ) : changes !== Infinity ? (
      <span className="badge badge-light-success">
        ↑ {changes.toFixed(fractionDigits)}%
      </span>
    ) : showOnInfinity ? (
      <span className="badge badge-light-success">↑</span>
    ) : null
  ) : showOnZero ? (
    <span className="badge badge-light-warning">0%</span>
  ) : null;
