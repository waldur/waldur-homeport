import * as React from 'react';

import '@waldur/marketplace/landing/CategoryCard.scss';
import { Checklist } from '@waldur/marketplace-checklist/types';
import { OfferingLogo } from '@waldur/marketplace/common/OfferingLogo';
import { ChecklistLink } from '@waldur/user/list/ChecklistLink';

interface ChecklistCardProps {
  checklist: Checklist;
}

export const ChecklistCard = (props: ChecklistCardProps) => (
  <div className="category-card" style={{ height: '122px' }}>
    <ChecklistLink
      className="category-thumb"
      checklist_uuid={props.checklist.uuid}
    >
      <OfferingLogo src={props.checklist.icon} />
    </ChecklistLink>
    <div className="category-card-body">
      <h3 className="category-title">
        <ChecklistLink checklist_uuid={props.checklist.uuid}>
          {props.checklist.name}
        </ChecklistLink>
      </h3>
    </div>
  </div>
);
