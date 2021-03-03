import React from 'react';

import { Link } from '@waldur/core/Link';

interface OwnProps {
  category_uuid: string;
  className?: string;
}

export const CategoryLink: React.FC<OwnProps> = (props) => (
  <Link
    state={'marketplace-checklist-user'}
    params={{ category: props.category_uuid }}
    className={props.className}
  >
    {props.children}
  </Link>
);
