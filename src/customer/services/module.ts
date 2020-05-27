import { CustomerPermissionsService } from './CustomerPermissionsService';
import { CustomersService } from './CustomersService';
import PriceEstimatesService from './price-estimates-service';
import { ProjectPermissionsService } from './ProjectPermissionsService';

export default module => {
  module.constant('customerPermissionsService', CustomerPermissionsService);
  module.constant('projectPermissionsService', ProjectPermissionsService);
  module.constant('customersService', CustomersService);
  module.service('priceEstimatesService', PriceEstimatesService);
};
