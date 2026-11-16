import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { translate } from 'waldur-i18n-runtime';

import { BaseButton } from './BaseButton';

export interface RefreshIconButtonProps {
  refetch(): void;
  /** Spins the icon and disables the button while a refetch is in flight. */
  loading?: boolean;
  /** Accessible label / tooltip for the icon-only button. */
  title?: string;
}

/**
 * Icon-only refresh control for a card or step header. While `loading` it
 * stays in place as a disabled button with a spinning icon, so the header
 * doesn't shift.
 */
export const RefreshIconButton = ({
  refetch,
  loading,
  title,
}: RefreshIconButtonProps) =>
  loading ? (
    // The same button as below, disabled and spinning: same size and icon,
    // so nothing in the header moves while it loads.
    <BaseButton
      iconNode={
        <span className="animation-spin" data-slot="spinner">
          <ArrowsClockwiseIcon size={20} weight="bold" />
        </span>
      }
      tooltip={translate('Loading')}
      onClick={() => {}}
      variant="text-secondary"
      disabled
    />
  ) : (
    <BaseButton
      variant="text-secondary"
      onClick={refetch}
      tooltip={title ?? translate('Refresh')}
      iconNode={<ArrowsClockwiseIcon size={20} weight="bold" />}
    />
  );
