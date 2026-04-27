import {
  BillingTypeEnum,
  PublicOfferingDetails,
  Resource,
} from 'waldur-js-client';

import { LoadingSpinnerSimple } from '@/core/LoadingSpinner';

interface EnhancedProps {
  row: Resource;
  data: PublicOfferingDetails[];
  type: BillingTypeEnum;
  isLoading: boolean;
}

export const withResourceComponentsLoader = <P extends object>(
  WrappedComponent: React.ComponentType<P & { row: Resource; component?: any }>,
) => {
  const EnhancedField: React.FC<EnhancedProps & P> = ({
    row,
    data,
    type,
    isLoading,
    ...restProps
  }: EnhancedProps) => {
    if (isLoading) {
      return <LoadingSpinnerSimple />;
    }
    // FIX THIS: use the first limit/usage-based component for now
    const components =
      data.find((offering) => offering.uuid === row.offering_uuid)
        ?.components || [];
    const component = components.find((comp) => comp.billing_type === type);

    return (
      <WrappedComponent {...(restProps as P)} row={row} component={component} />
    );
  };

  return EnhancedField;
};
