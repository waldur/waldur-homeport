import { FunctionComponent } from 'react';

import { Call } from '../types';

interface PublicCallDetailsProps {
  call: Call;
  refresh;
  tabSpec;
}

export const PublicCallDetails: FunctionComponent<PublicCallDetailsProps> = ({
  call,
  tabSpec,
}) => {
  return tabSpec ? <tabSpec.component call={call} /> : null;
};
