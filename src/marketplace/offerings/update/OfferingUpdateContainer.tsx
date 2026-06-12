import classNames from 'classnames';
import { FC } from 'react';
import {
  PluginComponent,
  ProviderOfferingDetails as Offering,
} from 'waldur-js-client';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { Category } from '@/marketplace/types';

interface OwnProps {
  data: {
    offering: Offering;
    category: Category;
    components: PluginComponent[];
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
    <div
      className={classNames(
        'provider-offering',
        data.offering.state === 'Unavailable' && 'disabled-view',
      )}
    >
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
