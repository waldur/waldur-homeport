import currentStateService from './current-state-service';
import defaultPriceListItemsService from './default-price-list-items-service';
import joinService from './join-service';
import joinServiceProjectLinkService from './join-service-project-link-service';
import priceEstimationService from './price-estimation-service';
import priceListItemsService from './price-list-items-service';
import projectPermissionsService from './project-permissions-service';
import quotasService from './quotas-service';

export default module => {
  module.service('currentStateService', currentStateService);
  module.service('defaultPriceListItemsService', defaultPriceListItemsService);
  module.service('joinService', joinService);
  module.service('joinServiceProjectLinkService', joinServiceProjectLinkService);
  module.service('priceEstimationService', priceEstimationService);
  module.service('priceListItemsService', priceListItemsService);
  module.service('projectPermissionsService', projectPermissionsService);
  module.service('quotasService', quotasService);
};
