import * as React from 'react';

import { Tooltip } from '@waldur/core/Tooltip';
import { formatFlavor } from '@waldur/resource/utils';

export const ResourceSummaryField = ({ translate, resource }) => {
  const label = resource.flavor_name ?
    translate('Flavor name: {flavor_name}, image name: {image_name}', resource) :
    translate('Image name: {image_name}', resource);
  return (
    <span>
      {formatFlavor(resource)}
      {' '}
      <Tooltip id="resourceSummary" label={label}>
        <i className="fa fa-info-circle"/>
      </Tooltip>
    </span>
  );
};
