import { InjectedFormProps } from 'redux-form';
import {
  CategoryGroup as WaldurCategoryGroup,
  MarketplaceCategory as WaldurCategory,
  OrderDetails,
  PublicOfferingDetails,
  ProviderOfferingDetails as Offering,
  ProviderPlanDetails as Plan,
} from 'waldur-js-client';
import { Project } from 'waldur-js-client';

import { Customer } from '@waldur/workspace/types';

export {
  OfferingComponent,
  ServiceProvider,
  CategoryColumn,
  ProviderOfferingDetails as Offering,
  ProviderPlanDetails as Plan,
} from 'waldur-js-client';

export interface CategoryGroup extends WaldurCategoryGroup {
  /** generated on frontend side */
  categories?: Category[];
  offering_count?: number;
  resource_count?: number;
}

export interface Category extends WaldurCategory {
  /** generated on frontend side */
  resource_count?: number;
}

export interface OfferingConfigurationFormProps extends InjectedFormProps {
  offering: Offering;
  project?: Project;
  plan?: Plan;
  initialLimits?: AttributesType;
  customer?: Customer;
  limits: string[];
  previewMode?: boolean;
}

export interface OrderDetailsProps {
  order: OrderDetails;
  offering: PublicOfferingDetails;
  limits?: string[];
}

export interface AttributesType {
  [key: string]: any;
}
