import './vendor';
import './globals';
import '../../assets/sass/style.scss';
import '../../svgfonts.font';

import featuresModule from './components/features/module';
import teamModule from './components/team/module';
import issuesModule from './components/issues/module';
import userModule from './components/user/module';
import providersModule from './components/providers/module';
import projectModule from './components/project/module';
import navigationModule from './components/navigation/module';
import resourceModule from './components/resource/module';
import resourceImportModule from './components/resource-import/module';
import billingModule from './components/billing/module';
import expertsModule from './components/experts/module';
import authModule from './components/auth/module';
import invitationsModule from './components/invitations/module';
import appstoreModule from './components/appstore/module';
import formModule from './components/form/module';
import awsModule from './components/aws/module';
import openstackModule from './components/openstack/module';
import digitaloceanModule from './components/digitalocean/module';
import customerModule from './components/customer/module';
import paymentsModule from './components/payments/module';
import eventsModule from './components/events/module';
import routesModule from './components/routes/module';
import offeringsModule from './components/offering/module';
import helpModule from './components/help/module';
import costPlanningModule from './components/cost-planning/module';
import coreModule from './components/core/module';
import dashboardModule from './components/dashboard/module';
import filtersModule from './components/core/filters';
import quotasModule from './components/quotas/module';
import tableModule from './components/table/module';
import i18nModule from './components/i18n/module';
import modalModule from './components/modal/module';
import bootstrap from './components/core/bootstrap';
import errorModule from './components/error/module';
import configModule from './components/configs/module';
import controllersModule from './components/controllers/module';
import servicesModule from './components/services/module';
import freeipaModule from './components/freeipa/module';
import rootModule from './components/module';
import priceModule from './components/price/module';
import ansibleModule from './components/ansible/module';
import introModule from './components/intro/module';
import analyticsRoutes from './components/analytics/routes';
import azureModule from './components/azure/module';
import slurmModule from './components/slurm/module';
import paypalModule from './components/paypal/module';
import storeModule from './components/store/module';
import jiraModule from './components/jira/module';
import workspaceModule from './components/workspace/module';
import formReactModule from './components/form-react/module';
import rijkscloudModule from './components/rijkscloud/module';
import marketplaceModule from './components/marketplace/module';

const appModule = angular.module('waldur', [
  'satellizer',
  'ui.router',
  'ngCookies',
  'ngResource',
  'duScroll',
  'ui.gravatar',
  'ui.select',
  'angularMoment',
  'ngAnimate',
  'pascalprecht.translate',
  'flash',
  'angulartics',
  'angulartics.google.analytics',
  'blockUI',
  'ngSanitize',
  'angular-cron-jobs',
  'ui.bootstrap',
  'ui.slimscroll',
  'angular-bind-html-compile',
  'oc.lazyLoad',
  'angular-intro',
]);

rootModule(appModule);
featuresModule(appModule);
teamModule(appModule);
issuesModule(appModule);
userModule(appModule);
providersModule(appModule);
projectModule(appModule);
navigationModule(appModule);
resourceModule(appModule);
resourceImportModule(appModule);
billingModule(appModule);
authModule(appModule);
expertsModule(appModule);
invitationsModule(appModule);
appstoreModule(appModule);
formModule(appModule);
formReactModule(appModule);
priceModule(appModule);
awsModule(appModule);
openstackModule(appModule);
digitaloceanModule(appModule);
customerModule(appModule);
paymentsModule(appModule);
eventsModule(appModule);
routesModule(appModule);
offeringsModule(appModule);
helpModule(appModule);
costPlanningModule(appModule);
coreModule(appModule);
dashboardModule(appModule);
filtersModule(appModule);
quotasModule(appModule);
tableModule(appModule);
i18nModule(appModule);
modalModule(appModule);
configModule(appModule);
controllersModule(appModule);
servicesModule(appModule);
freeipaModule(appModule);
ansibleModule(appModule);
introModule(appModule);
azureModule(appModule);
slurmModule(appModule);
paypalModule(appModule);
storeModule(appModule);
jiraModule(appModule);
workspaceModule(appModule);
rijkscloudModule(appModule);
marketplaceModule(appModule);
appModule.config(analyticsRoutes);

function requirePlugins(module) {
  const context = require.context('./plugins', true, /module\.js$/);
  context.keys().forEach(key => {
    const plugin = context(key).default;
    plugin(module);
  });
}

requirePlugins(appModule);

// Errors module should be the last, because it contains special route.
// Route with url='*path' allows to display error page without redirect.
errorModule(appModule);

bootstrap('waldur');
