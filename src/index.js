import './vendor';
import './globals';
import './sass/style.scss';
import '../svgfonts.font';

import featuresModule from './features/module';
import teamModule from './team/module';
import issuesModule from './issues/module';
import userModule from './user/module';
import providersModule from './providers/module';
import projectModule from './project/module';
import navigationModule from './navigation/module';
import resourceModule from './resource/module';
import resourceImportModule from './resource-import/module';
import billingModule from './billing/module';
import bookingModule from './booking/module';
import authModule from './auth/module';
import invitationsModule from './invitations/module';
import appstoreModule from './appstore/module';
import formModule from './form/module';
import awsModule from './aws/module';
import openstackModule from './openstack/module';
import digitaloceanModule from './digitalocean/module';
import customerModule from './customer/module';
import paymentsModule from './payments/module';
import eventsModule from './events/module';
import routesModule from './routes/module';
import offeringsModule from './offering/module';
import helpModule from './help/module';
import costPlanningModule from './cost-planning/module';
import coreModule from './core/module';
import filtersModule from './core/filters';
import quotasModule from './quotas/module';
import tableModule from './table/module';
import i18nModule from './i18n/module';
import modalModule from './modal/module';
import bootstrap from './core/bootstrap';
import errorModule from './error/module';
import configModule from './configs/module';
import controllersModule from './controllers/module';
import servicesModule from './services/module';
import freeipaModule from './freeipa/module';
import rootModule from './module';
import priceModule from './price/module';
import ansibleModule from './ansible/module';
import introModule from './intro/module';
import analyticsRoutes from './analytics/routes';
import azureModule from './azure/module';
import slurmModule from './slurm/module';
import paypalModule from './paypal/module';
import storeModule from './store/module';
import jiraModule from './jira/module';
import workspaceModule from './workspace/module';
import formReactModule from './form-react/module';
import rijkscloudModule from './rijkscloud/module';
import marketplaceModule from './marketplace/module';
import vmwareModule from './vmware/module';

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
bookingModule(appModule);
authModule(appModule);
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
vmwareModule(appModule);
appModule.config(analyticsRoutes);

if (process.env.NODE_ENV !== 'production') {
  const storybookModule = require('./marketplace/storybook.js').default;
  storybookModule(appModule);
}

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
