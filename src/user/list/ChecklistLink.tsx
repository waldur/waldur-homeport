import * as React from 'react';

import { Link } from '@waldur/core/Link';

interface OwnProps {
  checklist_uuid: string;
  className?: string;
}

export const ChecklistLink: React.FC<OwnProps> = (props) => (
  <Link
    state={'marketplace-checklist-user'}
    params={{ category: props.checklist_uuid }}
    className={props.className}
  >
    {props.children}
  </Link>
);
