import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent } from 'react';

import { useTitle } from '@waldur/navigation/title';

import { ResourceDetailsView } from './ResourceDetailsView';

export const ResourceDetailsPage: FunctionComponent<{ result }> = ({
  result,
}) => {
  const { state } = useCurrentStateAndParams();

  useTitle(result.resource.category_title);

  return <ResourceDetailsView {...result} state={state} />;
};
