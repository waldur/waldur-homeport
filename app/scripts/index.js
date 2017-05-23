import 'angular-cron-jobs';
import 'angular-cron-jobs/dist/angular-cron-jobs.css';

import sparkline from './components/sparkline/module';
import featuresModule from './components/features/module';
import teamModule from './components/team/module';
import issuesModule from './components/issues/module';
import userModule from './components/user/module';
import providersModule from './components/providers/module';
import projectModule from './components/project/module';
import navigationModule from './components/navigation/module';
import resourceModule from './components/resource/module';
import billingModule from './components/billing/module';
import authModule from './components/auth/module';
import invitationsModule from './components/invitations/module';
import appstoreModule from './components/appstore/module';
import formModule from './components/form/module';
import awsModule from './components/aws/module';
import openstackModule from './components/openstack/module';
import digitaloceanModule from './components/digitalocean/module';
import premiumSupportModule from './components/premiumSupport/module';
import customerModule from './components/customer/module';
import plansModule from './components/plans/module';
import paymentsModule from './components/payments/module';
import eventsModule from './components/events/module';
import alertsModule from './components/alerts/module';
import routesModule from './components/routes/module';
import analyticsModule from './components/analytics/module';
import offeringsModule from './components/offering/module';
import helpModule from './components/help/module';
import costPlanningModule from './components/cost-planning/module';
import coreModule from './components/core/module';
import dashboardModule from './components/dashboard/module';
import filtersModule from './components/core/filters';
import quotasModule from './components/quotas/module';
import tableModule from './components/table/module';
import i18nModule from './components/i18n/module';
import bootstrap from './components/core/bootstrap';
import errorModule from './components/error/module';
import { configModule, gravatarModule } from './components/configs/module';
import controllersModule from './components/controllers/module';
import directivesModule from './components/directives/module';
import servicesModule from './components/services/module';
import appModule from './components/module';

const ncSaasModule = angular.module('ncsaas', [
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
  'ngFileUpload',
  'xeditable',
  'blockUI',
  'ngSanitize',
  'leaflet-directive',
  'angular-cron-jobs',
  'ui.bootstrap',
  'ui.slimscroll',
  'angular-bind-html-compile'
]);

appModule(ncSaasModule);
sparkline(ncSaasModule);
featuresModule(ncSaasModule);
teamModule(ncSaasModule);
issuesModule(ncSaasModule);
userModule(ncSaasModule);
providersModule(ncSaasModule);
projectModule(ncSaasModule);
navigationModule(ncSaasModule);
resourceModule(ncSaasModule);
billingModule(ncSaasModule);
authModule(ncSaasModule);
invitationsModule(ncSaasModule);
appstoreModule(ncSaasModule);
formModule(ncSaasModule);
awsModule(ncSaasModule);
openstackModule(ncSaasModule);
digitaloceanModule(ncSaasModule);
premiumSupportModule(ncSaasModule);
customerModule(ncSaasModule);
plansModule(ncSaasModule);
paymentsModule(ncSaasModule);
eventsModule(ncSaasModule);
alertsModule(ncSaasModule);
routesModule(ncSaasModule);
analyticsModule(ncSaasModule);
offeringsModule(ncSaasModule);
helpModule(ncSaasModule);
costPlanningModule(ncSaasModule);
coreModule(ncSaasModule);
dashboardModule(ncSaasModule);
filtersModule(ncSaasModule);
quotasModule(ncSaasModule);
tableModule(ncSaasModule);
i18nModule(ncSaasModule);
errorModule(ncSaasModule);
configModule(ncSaasModule);
controllersModule(ncSaasModule);
directivesModule(ncSaasModule);
servicesModule(ncSaasModule);

bootstrap('ncsaas');

const uiGravatarModule = angular.module('ui.gravatar');
gravatarModule(uiGravatarModule);
