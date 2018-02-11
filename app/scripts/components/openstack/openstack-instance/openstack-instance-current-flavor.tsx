import * as React from 'react';

import { withTranslation, TranslateProps } from '@waldur/i18n';
import { formatFlavor } from '@waldur/resource/utils';
import { connectAngularComponent } from '@waldur/store/connect';

import { OpenStackInstance } from './types';

interface OpenStackInstanceCurrentFlavorProps extends TranslateProps {
  context: {
    resource: OpenStackInstance;
  };
}

const OpenStackInstanceCurrentFlavor = (props: OpenStackInstanceCurrentFlavorProps) => (
  <p>
    <strong>{props.translate('Current flavor')}: </strong>
    {props.context.resource.flavor_name} ({formatFlavor(props.context.resource)})
  </p>
);

export default connectAngularComponent(withTranslation(OpenStackInstanceCurrentFlavor), ['context']);
