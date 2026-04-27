import { FunctionComponent } from 'react';
import { OpenStackInstance } from 'waldur-js-client';

import { translate } from '@/i18n';
import { formatFlavor } from '@/resource/utils';

interface OpenStackInstanceCurrentFlavorProps {
  context: {
    resource: OpenStackInstance;
  };
}

export const OpenStackInstanceCurrentFlavor: FunctionComponent<
  OpenStackInstanceCurrentFlavorProps
> = (props) => (
  <p>
    <strong>{translate('Current flavor')}: </strong>
    {props.context.resource.flavor_name} ({formatFlavor(props.context.resource)}
    )
  </p>
);
