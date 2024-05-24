import { FC } from 'react';

import { ModelCard1 } from '@waldur/core/ModelCard1';

export const ServiceProviderCard: FC<{ provider }> = ({ provider }) => {
  return (
    <ModelCard1
      image={provider.image}
      title={provider.customer_name}
      subtitle={provider.customer_abbreviation}
      body={provider.description}
    />
  );
};
