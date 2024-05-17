import { FC } from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { Category, Offering, PluginMetadata } from '@waldur/marketplace/types';

interface OwnProps {
  data: {
    offering: Offering;
    category: Category;
    components: PluginMetadata['components'];
  };
  refetch;
  isLoading;
  isRefetching;
  error;
  tabSpec;
}

export const OfferingUpdateContainer: FC<OwnProps> = (props) => {
  const data = props.data;

  if (props.isLoading) {
    return <LoadingSpinner />;
  }
  if (props.error) {
    return <h3>{translate('Unable to load offering details.')}</h3>;
  }
  if (!props.data) {
    return null;
  }

  return props.tabSpec ? (
    <div className="provider-offering">
      <props.tabSpec.component
        offering={data.offering}
        category={data.category}
        components={data.components}
        refetch={props.refetch}
        loading={props.isRefetching}
      />
    </div>
  ) : null;
};
