import * as React from 'react';

import { Tooltip } from '@waldur/core/Tooltip';

interface ReferralTypeIconProps {
  resourceType: string;
}

export const ReferralTypeIcon = (props: ReferralTypeIconProps) => {
  /* Available values of resource type:
   * https://schema.datacite.org/meta/kernel-4.1/include/datacite-resourceType-v4.1.xsd
   */
  const resourceTypeDict = {
    Audiovisual: 'fa fa-volume-up',
    Collection: 'fa fa-object-group',
    DataPaper: 'fa fa-server',
    Dataset: 'fa fa-database',
    Event: 'fa fa-calendar',
    Image: 'fa fa-image',
    InteractiveResource: 'fa fa-users',
    Model: 'fa fa-clone',
    PhysicalObject: 'fa fa-cube',
    Service: 'fa fa-ambulance',
    Software: 'fa fa-laptop',
    Sound: 'fa fa-microphone',
    Text: 'fa fa-file-text-o',
    Workflow: 'fa fa-briefcase',
    Other: 'fa fa-sign-out',
    Default: 'fa fa-question-circle-o',
  };
  return (
    <Tooltip label={props.resourceType} id="resource-type-label">
      <i
        className={
          resourceTypeDict[props.resourceType]
            ? resourceTypeDict[props.resourceType]
            : resourceTypeDict.Default
        }
      />{' '}
    </Tooltip>
  );
};
