import classNames from 'classnames';
import { FC, ReactNode } from 'react';

import { HelpTip } from '@/core/HelpTip';

interface SectionHeadingProps {
  title: ReactNode;
  /** One or two sentences saying what the section holds. */
  help?: ReactNode;
  className?: string;
}

/**
 * A section or table heading on the merge pages, with the question mark that
 * explains it. The long version of every one of these lives in the staff
 * guide; the bubble says just enough to read the panel without it.
 */
export const SectionHeading: FC<SectionHeadingProps> = ({
  title,
  help,
  className,
}) => (
  <h4
    className={classNames('d-flex align-items-center gap-2', className)}
    data-testid="section-heading"
  >
    {title}
    {help ? <HelpTip label={help} /> : null}
  </h4>
);
