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
import featuresModule from './features/module';
import formModule from './form/module';
import freeipaModule from './freeipa/module';
import i18nModule from './i18n/module';
import introModule from './intro/module';
import invitationsModule from './invitations/module';
import invoicesModule from './invoices/module';
import issuesModule from './issues/module';
import jiraModule from './jira/module';
import rootModule from './module';
import navigationModule from './navigation/module';
import offeringsModule from './offering/module';
import openstackModule from './openstack/module';
import priceModule from './price/module';
import projectModule from './project/module';
import rancherModule from './rancher/module';
import resourceModule from './resource/module';
import registerRoutes from './routes';
import slurmModule from './slurm/module';
import storeModule from './store/module';
import userModule from './user/module';
import workspaceModule from './workspace/module';

import './azure/module';
import './booking/marketplace';
import './marketplace/sidebar';
import './marketplace-script/marketplace';
import './marketplace-checklist/sidebar-extension';
import './paypal/events';
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
priceModule(appModule);
openstackModule(appModule);
digitaloceanModule();
customerModule(appModule);
offeringsModule();
coreModule(appModule);
filtersModule(appModule);
i18nModule(appModule);
configModule(appModule);
freeipaModule(appModule);
introModule(appModule);
slurmModule(appModule);
storeModule(appModule);
jiraModule(appModule);
workspaceModule(appModule);
rancherModule();

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

registerRoutes(appModule);

bootstrap('waldur');
