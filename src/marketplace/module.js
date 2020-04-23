import marketplaceAttributeFilterListDialog from './category/filters/AttributeFilterListDialog';
import marketplaceOfferingPlanDescription from './details/plan/PlanDescription';
import marketplacePlanDetailsDialog from './details/plan/PlanDetailsDialog';
import registerExtensionPoint from './extension-point';
import marketplaceOfferingsModule from './offerings/module';
import marketplaceOrdersModule from './orders/module';
import providersService from './providers-service';
import marketplaceResourceModule from './resources/module';
import routes from './routes';
import marketplaceProvidersModule from './service-providers/module';
import registerSidebarExtension from './sidebar';

export default module => {
  module.component(
    'marketplaceOfferingPlanDescription',
    marketplaceOfferingPlanDescription,
  );
  module.component(
    'marketplacePlanDetailsDialog',
    marketplacePlanDetailsDialog,
  );
  module.component(
    'marketplaceAttributeFilterListDialog',
    marketplaceAttributeFilterListDialog,
  );
  module.service('providersService', providersService);
  module.config(routes);
  module.run(registerSidebarExtension);
  module.run(registerExtensionPoint);
  marketplaceOfferingsModule(module);
  marketplaceOrdersModule(module);
  marketplaceProvidersModule(module);
  marketplaceResourceModule(module);
};
