import * as React from 'react';

import { translate } from '@waldur/i18n';
import { formatFlavor } from '@waldur/resource/utils';

import { OpenStackInstance } from './types';

interface OpenStackInstanceCurrentFlavorProps {
  context: {
    resource: OpenStackInstance;
  };
}

export const OpenStackInstanceCurrentFlavor = (
  props: OpenStackInstanceCurrentFlavorProps,
) => (
  <p>
    <strong>{translate('Current flavor')}: </strong>
    {props.context.resource.flavor_name} ({formatFlavor(props.context.resource)}
    )
  </p>
);
