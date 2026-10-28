import { FunctionComponent } from 'react';

import { SafeMarkdown } from '@/core/SafeMarkdown';
import { OfferingLogo } from '@/marketplace/common/OfferingLogo';

export const TemplateHeader: FunctionComponent<any> = (props) => (
  <div className="grid grid-cols-1 md:grid-cols-12 gap-x-5">
    <div className="md:col-span-3">
      <OfferingLogo src={props.template.icon} />
    </div>
    <div className="md:col-span-9">
      <SafeMarkdown text={props.version.app_readme} />
    </div>
  </div>
);
