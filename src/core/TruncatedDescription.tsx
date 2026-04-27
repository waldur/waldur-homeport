import { truncate } from 'lodash-es';
import { FC } from 'react';
import { useToggle } from 'react-use';

import { translate } from '@/i18n';

interface TruncatedDescriptionProps {
  text: string;
  max?: number;
  className?: string;
  /** Overrides onClick */
  onClick?(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
}

const OFFSET = 20;

export const TruncatedDescription: FC<TruncatedDescriptionProps> = ({
  text = '',
  max = 150,
  className,
  onClick,
}) => {
  const [collapsed, setCollapsed] = useToggle(true);

  // Instead of showing the 'Show more` button for just a few more characters, show the full text.
  if (text.length <= max + OFFSET) {
    return text;
  }

  return (
    <div className={className}>
      {collapsed ? truncate(text, { length: max }) : text}
      <button
        type="button"
        className="text-anchor fw-bold"
        onClick={onClick || setCollapsed}
      >
        &nbsp;
        {collapsed ? translate('Show more') : translate('Show less')}
      </button>
    </div>
  );
};
