import customerImageService from './customer-image-service';
import customerPermissionsService from './customer-permissions-service';
import customersService from './customers-service';
import PriceEstimatesService from './price-estimates-service';

export default module => {
  module.service('customerImageService', customerImageService);
  module.service('customerPermissionsService', customerPermissionsService);
  module.service('customersService', customersService);
  module.service('priceEstimatesService', PriceEstimatesService);
};
