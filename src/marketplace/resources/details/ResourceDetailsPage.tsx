import { FC } from 'react';
import { Resource } from 'waldur-js-client';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { Offering } from '@/marketplace/types';

interface OwnProps {
  data: {
    resource: Resource;
    resourceScope: any;
    offering: Offering;
  };
  refetch;
  isLoading;
  error;
  tabSpec;
}

export const ResourceDetailsPage: FC<OwnProps> = (props) => {
  const data = props.data;

  if (props.isLoading) {
    return <LoadingSpinner />;
  }
  if (props.error) {
    return <h3>{translate('Unable to load resource details.')}</h3>;
  }
  if (!data || !props.tabSpec) {
    return null;
  }

  return (
    <div
      className={
        data.offering.state === 'Unavailable' ? 'disabled-view' : undefined
      }
    >
      <props.tabSpec.component
        {...data}
        title={props.tabSpec.title}
        refetch={props.refetch}
      />
    </div>
  );
};
