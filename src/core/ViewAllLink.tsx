import { FC } from 'react';

import { translate } from '@/i18n';

import { Link } from './Link';

/** "View all", leading from a figure (a `StatCard` footer) to its list. */
export const ViewAllLink: FC<{ to: { state: string; params?: object } }> = ({
  to,
}) => (
  <Link
    state={to.state}
    params={to.params}
    label={translate('View all')}
    buttonVariant="text-primary"
    buttonSize="sm"
    className="px-0"
  />
);
