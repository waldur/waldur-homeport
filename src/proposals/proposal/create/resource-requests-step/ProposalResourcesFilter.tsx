import { FC } from 'react';

import { CallOfferingFilter } from './CallOfferingFilter';

export const FORM_ID = 'ProposalResourcesFilter';

interface OwnProps {
  offerings?: Parameters<typeof CallOfferingFilter>['0']['options'];
}

export const ProposalResourcesFilter: FC<OwnProps> = ({ offerings }) => (
  <CallOfferingFilter options={offerings} />
);
