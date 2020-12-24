import { StateDeclaration as BaseStateDeclaration } from '@uirouter/core';
import { ComponentType } from 'react';

import { PluginConfiguration } from '@waldur/auth/types';

interface DataDeclaration {
  /** State is disabled as long as its feature is disabled */
  feature: string;
  /** Related sidebar item is expanded if its key matches current state sidebarKey */
  sidebarKey: string;
  /** Body class name is applied to body element automatically */
  bodyClass: string;
  /** Authenticated view is protected from anonymous user.
   * When anonymous user tries to access protected state, he is redirected to login view.
   */
  auth: boolean;
  /** Anonymous view is protected from authenticated user.
   * When authenticated user tries to access protected state, error page is shown.
   */
  anonymous: boolean;
  erred: boolean;
  /** Breadcrumbs component is concealed as long as this parameter is set to true. */
  hideBreadcrumbs: boolean;
  /** Page header component is concealed as long as this parameter is set to true. */
  hideHeader: boolean;
  /** Workspace declaration is used by workspace selector. */
  workspace: string;
  /** Page class name is applied to page wrapper element automatically */
  pageClass: string;
}

export interface StateDeclaration extends BaseStateDeclaration {
  component: ComponentType<any>;
  data?: Partial<DataDeclaration>;
}

export interface LanguageOption {
  code: string;
  label: string;
  display_code?: string;
}

export interface ApplicationConfigurationOptions extends Record<string, any> {
  apiEndpoint: string;
  plugins?: PluginConfiguration;
  languageChoices: LanguageOption[];
  defaultLanguage: string;
}

// Polyfill taken from https://stackoverflow.com/a/63984409
export type Await<T> = T extends PromiseLike<infer U> ? U : T;
