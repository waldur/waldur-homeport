import * as React from 'react';

import { Link } from '@waldur/core/Link';
import { OfferingLogo } from '@waldur/marketplace/common/OfferingLogo';

import './TemplateCard.scss';

interface TemplateCardProps {
  template: any;
}

export const TemplateCard = (props: TemplateCardProps) => (
  <div className="template-card">
    <Link
      state="rancher-template-details"
      params={{ templateUuid: props.template.uuid }}
      className="template-thumb"
    >
      <OfferingLogo src={props.template.icon} />
    </Link>
    <div className="template-card-body">
      <h3 className="template-title">
        <Link
          state="rancher-template-details"
          params={{ templateUuid: props.template.uuid }}
        >
          {props.template.name}
        </Link>
      </h3>
    </div>
  </div>
);
