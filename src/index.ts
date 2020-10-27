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
import coreModule from './core/module';
import customerModule from './customer/module';
import digitaloceanModule from './digitalocean/module';
import featuresModule from './features/module';
import i18nModule from './i18n/module';
import invitationsModule from './invitations/module';
import './invoices/module';
import issuesModule from './issues/module';
import rootModule from './module';
import offeringsModule from './offering/module';
import openstackModule from './openstack/module';
import './project/module';
import rancherModule from './rancher/module';
import resourceModule from './resource/module';
import registerRoutes from './routes';
import slurmModule from './slurm/module';
import storeModule from './store/module';
import userModule from './user/module';

import './azure/module';
import './booking/marketplace';
import './marketplace/sidebar';
import './marketplace-script/marketplace';
import './marketplace-checklist/sidebar-extension';
import './paypal/events';
import './vmware/module';

const appModule = angular.module('waldur', [
  'ui.router',
  UI_ROUTER_REACT_HYBRID,
  'ui.router.state.events',
  'ngCookies',
  'ui.select',
  'ngAnimate',
  'pascalprecht.translate',
  'angulartics',
  'angulartics.google.analytics',
  'ngSanitize',
  'ui.bootstrap',
  'angular-bind-html-compile',
]);

rootModule(appModule);
featuresModule(appModule);
issuesModule(appModule);
userModule(appModule);
resourceModule(appModule);
authModule(appModule);
invitationsModule(appModule);
openstackModule(appModule);
digitaloceanModule();
customerModule(appModule);
offeringsModule();
coreModule(appModule);
i18nModule(appModule);
configModule(appModule);
slurmModule();
storeModule(appModule);
rancherModule();

function requirePlugins(module) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  const context = require.context('./plugins', true, /module\.js$/);
  context.keys().forEach((key) => {
    const plugin = context(key).default;
    plugin(module);
  });
}

requirePlugins(appModule);

registerRoutes(appModule);

bootstrap('waldur');
