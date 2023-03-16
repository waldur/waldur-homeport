import { StateDeclaration as BaseStateDeclaration } from '@uirouter/core';
import { ComponentType } from 'react';

import { PluginConfiguration } from '@waldur/auth/types';

interface DataDeclaration {
  /** State is disabled as long as its feature is disabled */
  feature: string;
  /** Authenticated view is protected from anonymous user.
   * When anonymous user tries to access protected state, he is redirected to login view.
   */
  auth: boolean;
  /** Anonymous view is protected from authenticated user.
   * When authenticated user tries to access protected state, error page is shown.
   */
  anonymous: boolean;
  erred: boolean;
  /** Page header component is concealed as long as this parameter is set to true. */
  hideHeader: boolean;
  hideHeaderMenu: boolean;
  /** Workspace declaration is used by workspace selector. */
  workspace: string;
  skipAuth: boolean;
  title?(): string;
  breadcrumb?(): string;
  skipBreadcrumb?: boolean;
  priority?: number;
  permissions: Array<(state) => boolean>;
  useExtraTabs?: boolean;
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

export interface ApplicationConfigurationOptions {
  apiEndpoint: string;
  plugins?: PluginConfiguration;
  // Language choices and default language are fetched from MasterMind
  languageChoices?: LanguageOption[];
  defaultLanguage?: string;
  FEATURES?: Record<string, boolean>;
  marketplaceLandingPageTitle: string;
  pageSizes: number[];
  pageSize: number;
  defaultErrorMessage: string;
  buildId: string;
  accountingMode: string;
  defaultPullInterval: number;
  countersTimerInterval: number;
  roles: Record<string, string>;
  invitationRedirectTime: number;
  excludedAttachmentTypes: string[];
  enforceLatinName: boolean;
  authStorage: string;
}

// Polyfill taken from https://stackoverflow.com/a/63984409
export type Await<T> = T extends PromiseLike<infer U> ? U : T;
