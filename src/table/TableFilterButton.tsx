import { FunnelSimpleIcon } from '@phosphor-icons/react';

import { Badge, BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';

interface TableFilterButtonProps {
  onClick: (event: React.MouseEvent) => void;
  hasFilter?: boolean;
  filterCount?: number;
}

export const TableFilterButton = ({
  onClick,
  hasFilter = false,
  filterCount = 0,
}: TableFilterButtonProps) => {
  const count = hasFilter ? filterCount : 0;
  return (
    // The wrapper is always mounted, only the badge comes and goes: wrapping
    // the button only while there is a count changed the tree shape at this
    // position, so React remounted the button (losing focus and tooltip state)
    // whenever the count crossed zero.
    <div className="d-inline-flex position-relative">
      <BaseButton
        variant="tertiary"
        size="lg"
        tooltip={translate('Set filters')}
        iconNode={<FunnelSimpleIcon weight="bold" />}
        onClick={onClick}
        className="btn-toggle-filters"
      />
      {count > 0 && (
        <Badge
          variant="primary"
          size="sm"
          shape="pill"
          tone="outline"
          className="position-absolute top-0 start-100 translate-middle fs-7"
        >
          {count > 9 ? '9+' : count}
        </Badge>
      )}
    </div>
  );
};
