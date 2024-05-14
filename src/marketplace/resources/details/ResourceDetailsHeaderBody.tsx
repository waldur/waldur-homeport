import { FunctionComponent } from 'react';

import { Resource } from '../types';

import { EndDateField } from './EndDateField';
import { OfferingDetailsField } from './OfferingDetailsField';

interface ResourceDetailsHeaderBodyProps {
  resource: Resource;
  offering;
}

export const ResourceDetailsHeaderBody: FunctionComponent<
  ResourceDetailsHeaderBodyProps
> = ({ resource, offering }) => {
  return (
    <>
      {resource.description ? <p>{resource.description}</p> : null}
      <OfferingDetailsField offering={offering} />
      <EndDateField resource={resource} />
    </>
  );
};
