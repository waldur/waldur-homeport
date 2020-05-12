import { UI_ROUTER_REACT_HYBRID } from '@uirouter/react-hybrid';
import * as angular from 'angular';
import '@uirouter/angularjs/release/stateEvents';

import './vendor';
import './globals';
import './sass/style.scss';
import '../svgfonts.font';

import authModule from './auth/module';
import configModule from './configs/module';
import bootstrap from './core/bootstrap';
import filtersModule from './core/filters';
import coreModule from './core/module';
import customerModule from './customer/module';
import digitaloceanModule from './digitalocean/module';
import errorModule from './error/module';
import eventsModule from './events/module';
import featuresModule from './features/module';
import formReactModule from './form-react/module';
import formModule from './form/module';
import freeipaModule from './freeipa/module';
import helpModule from './help/module';
import i18nModule from './i18n/module';
import introModule from './intro/module';
import invitationsModule from './invitations/module';
import invoicesModule from './invoices/module';
import issuesModule from './issues/module';
import jiraModule from './jira/module';
import marketplaceChecklistModule from './marketplace-checklist/module';
import marketplaceModule from './marketplace/module';
import modalModule from './modal/module';
import rootModule from './module';
import navigationModule from './navigation/module';
import offeringsModule from './offering/module';
import openstackModule from './openstack/module';
import paypalModule from './paypal/module';
import priceModule from './price/module';
import projectModule from './project/module';
import rancherModule from './rancher/module';
import resourceModule from './resource/module';
import routesModule from './routes/module';
import servicesModule from './services/module';
import slurmModule from './slurm/module';
import storeModule from './store/module';
import userModule from './user/module';
import workspaceModule from './workspace/module';

import './azure/module';
import './booking/marketplace';
import './marketplace-script/marketplace';
import './vmware/module';

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
invoicesModule(appModule);
authModule(appModule);
invitationsModule(appModule);
formModule(appModule);
formReactModule(appModule);
priceModule(appModule);
openstackModule(appModule);
digitaloceanModule(appModule);
customerModule(appModule);
eventsModule(appModule);
routesModule(appModule);
offeringsModule(appModule);
helpModule(appModule);
coreModule(appModule);
filtersModule(appModule);
i18nModule(appModule);
modalModule(appModule);
configModule(appModule);
servicesModule(appModule);
freeipaModule(appModule);
introModule(appModule);
slurmModule(appModule);
paypalModule(appModule);
storeModule(appModule);
jiraModule(appModule);
workspaceModule(appModule);
marketplaceModule(appModule);
rancherModule(appModule);
marketplaceChecklistModule(appModule);

function requirePlugins(module) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
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
