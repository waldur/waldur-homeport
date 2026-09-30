import { useCurrentStateAndParams } from '@uirouter/react';
import { FC, useCallback } from 'react';

import {
  ScrollSpyItemRenderProps,
  ScrollSpyNav as BaseScrollSpyNav,
  ScrollSpyNavProps as BaseScrollSpyNavProps,
} from 'waldur-ui';

import { Link } from '@/core/Link';

export interface ScrollSpyNavProps extends BaseScrollSpyNavProps {}

/**
 * Application-level ScrollSpyNav that integrates `waldur-ui`'s ScrollSpyNav
 * with `@uirouter/react` Link navigation.
 */
export const ScrollSpyNav: FC<ScrollSpyNavProps> = ({
  renderItem,
  ...props
}) => {
  const { state } = useCurrentStateAndParams();

  const defaultRenderItem = useCallback(
    ({
      item,
      className,
      onClick,
      'aria-current': ariaCurrent,
    }: ScrollSpyItemRenderProps) => (
      <Link
        state={item.state ?? state?.name}
        params={item.params ?? { '#': item.key }}
        onClick={onClick}
        aria-current={ariaCurrent}
        className={className}
      >
        {item.title}
      </Link>
    ),
    [state?.name],
  );

  return (
    <BaseScrollSpyNav renderItem={renderItem || defaultRenderItem} {...props} />
  );
};
