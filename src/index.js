/* eslint-disable */

import { UI_ROUTER_REACT_HYBRID } from '@uirouter/react-hybrid';
import '@uirouter/angularjs/release/stateEvents';

import './vendor';
import './globals';
import './sass/style.scss';
import '../svgfonts.font';

import featuresModule from './features/module';
import issuesModule from './issues/module';
import userModule from './user/module';
import projectModule from './project/module';
import navigationModule from './navigation/module';
import resourceModule from './resource/module';
import billingModule from './billing/module';
import bookingModule from './booking/module';
import authModule from './auth/module';
import invitationsModule from './invitations/module';
import formModule from './form/module';
import openstackModule from './openstack/module';
import digitaloceanModule from './digitalocean/module';
import customerModule from './customer/module';
import paymentsModule from './payments/module';
import eventsModule from './events/module';
import routesModule from './routes/module';
import offeringsModule from './offering/module';
import helpModule from './help/module';
import coreModule from './core/module';
import filtersModule from './core/filters';
import quotasModule from './quotas/module';
import i18nModule from './i18n/module';
import modalModule from './modal/module';
import bootstrap from './core/bootstrap';
import errorModule from './error/module';
import configModule from './configs/module';
import servicesModule from './services/module';
import freeipaModule from './freeipa/module';
import rootModule from './module';
import priceModule from './price/module';
import introModule from './intro/module';
import azureModule from './azure/module';
import slurmModule from './slurm/module';
import paypalModule from './paypal/module';
import storeModule from './store/module';
import jiraModule from './jira/module';
import workspaceModule from './workspace/module';
import formReactModule from './form-react/module';
import marketplaceModule from './marketplace/module';
import vmwareModule from './vmware/module';
import rancherModule from './rancher/module';
import marketplaceScriptModule from './marketplace-script/module';
import marketplaceChecklistModule from './marketplace-checklist/module';

const appModule = angular.module('waldur', [
  'satellizer',
  'ui.router',
  UI_ROUTER_REACT_HYBRID,
  'ui.router.state.events',
  'ngCookies',
  'ngResource',
  'ui.select',
  'ngAnimate',
  'pascalprecht.translate',
  'flash',
  'angulartics',
  'angulartics.google.analytics',
  'ngSanitize',
  'angular-cron-jobs',
  'ui.bootstrap',
  'angular-bind-html-compile',
  'angular-intro',
]);

rootModule(appModule);
featuresModule(appModule);
issuesModule(appModule);
userModule(appModule);
projectModule(appModule);
navigationModule(appModule);
resourceModule(appModule);
billingModule(appModule);
bookingModule(appModule);
authModule(appModule);
invitationsModule(appModule);
formModule(appModule);
formReactModule(appModule);
priceModule(appModule);
openstackModule(appModule);
digitaloceanModule(appModule);
customerModule(appModule);
paymentsModule(appModule);
eventsModule(appModule);
routesModule(appModule);
offeringsModule(appModule);
helpModule(appModule);
coreModule(appModule);
filtersModule(appModule);
quotasModule(appModule);
i18nModule(appModule);
modalModule(appModule);
configModule(appModule);
servicesModule(appModule);
freeipaModule(appModule);
introModule(appModule);
azureModule(appModule);
slurmModule(appModule);
paypalModule(appModule);
storeModule(appModule);
jiraModule(appModule);
workspaceModule(appModule);
marketplaceModule(appModule);
vmwareModule(appModule);
rancherModule(appModule);
marketplaceScriptModule(appModule);
marketplaceChecklistModule(appModule);

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
