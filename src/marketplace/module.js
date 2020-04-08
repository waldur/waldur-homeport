import marketplaceCartModule from './cart/module';
import marketplaceCategory from './category/CategoryPage';
import marketplaceAttributeFilterListDialog from './category/filters/AttributeFilterListDialog';
import marketplaceCompare from './compare/ComparisonContainer';
import marketplaceOffering from './details/DetailsPage';
import marketplaceOfferingPlanDescription from './details/plan/PlanDescription';
import marketplacePlanDetailsButton from './details/plan/PlanDetailsButton';
import marketplacePlanDetailsDialog from './details/plan/PlanDetailsDialog';
import registerExtensionPoint from './extension-point';
import marketplaceLanding from './landing/LandingPageContainer';
import marketplaceOfferingsModule from './offerings/module';
import marketplaceOrdersModule from './orders/module';
import providersService from './providers-service';
import marketplaceResourceModule from './resources/module';
import routes from './routes';
import marketplaceProvidersModule from './service-providers/module';
import registerSidebarExtension from './sidebar';

export default module => {
  module.component('marketplaceLanding', marketplaceLanding);
  module.component('marketplaceCompare', marketplaceCompare);
  module.component('marketplaceOffering', marketplaceOffering);
  module.component(
    'marketplaceOfferingPlanDescription',
    marketplaceOfferingPlanDescription,
  );
  module.component(
    'marketplacePlanDetailsButton',
    marketplacePlanDetailsButton,
  );
  module.component(
    'marketplacePlanDetailsDialog',
    marketplacePlanDetailsDialog,
  );
  module.component('marketplaceCategory', marketplaceCategory);
  module.component(
    'marketplaceAttributeFilterListDialog',
    marketplaceAttributeFilterListDialog,
  );
  module.service('providersService', providersService);
  module.config(routes);
  module.run(registerSidebarExtension);
  module.run(registerExtensionPoint);
  marketplaceCartModule(module);
  marketplaceOfferingsModule(module);
  marketplaceOrdersModule(module);
  marketplaceProvidersModule(module);
  marketplaceResourceModule(module);
};
