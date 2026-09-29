import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { useFormState } from 'react-final-form';
import { Resource } from 'waldur-js-client';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { getDerivedLimitInputs } from '@/marketplace/common/derivedLimits';
import { checkOrderCanBeApproved } from '@/marketplace/orders/actions/selectors';
import { ChangeLimitsComponent } from '@/marketplace/resources/change-limits/ChangeLimitsComponent';
import { loadData } from '@/marketplace/resources/change-limits/utils';
import { useUser } from '@/workspace/hooks';

/**
 * What a changed formula input does to the resource's limits and price. The
 * server orders the change with the limits it derives from the new value; this
 * shows them before the customer submits.
 */
export const FormulaChangePreview: FC<{ resource: Resource; name: string }> = ({
  resource,
  name,
}) => {
  const { values } = useFormState({ subscription: { values: true } });
  const query = useQuery({
    queryKey: ['FormulaChangePreview', resource.uuid],
    queryFn: () => loadData(resource.uuid),
  });
  const user = useUser();

  const value = values.attributes?.[name];
  const inputs = useMemo(
    () =>
      getDerivedLimitInputs(resource, query.data?.offering, { [name]: value }),
    [resource, query.data, name, value],
  );

  if (query.isLoading) {
    return <LoadingSpinner />;
  }
  if (!query.data) {
    return null;
  }
  return (
    <div className="mt-6">
      <p className="text-muted">
        {translate(
          'The change is ordered with the limits calculated from the new value:',
        )}
      </p>
      <ChangeLimitsComponent
        data={query.data}
        // The resource's own scope: the dialog may be opened from another
        // workspace, such as the provider's.
        orderCanBeApproved={checkOrderCanBeApproved(
          user,
          { uuid: resource.customer_uuid },
          { uuid: resource.project_uuid },
        )}
        inputs={inputs}
        readOnly
      />
    </div>
  );
};
