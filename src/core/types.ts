import { StateDeclaration as BaseStateDeclaration } from '@uirouter/core';
import { UIView } from '@uirouter/react';
import { ComponentType, LazyExoticComponent } from 'react';
import { RoleDetails } from 'waldur-js-client';

import { PluginConfiguration } from '@/auth/types';
import { FeaturesEnum } from '@/FeaturesEnums';

interface DataDeclaration {
  /** State is disabled as long as its feature is disabled */
  feature: FeaturesEnum;
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
  skipAuth: boolean;
  title?(): string;
  breadcrumb?(): string;
  skipBreadcrumb?: boolean;
  priority?: number;
  permissions: Array<(state) => boolean>;
  useExtraTabs?: boolean;
  skipHero?: boolean;
  workspace?: string;
}

export interface StateDeclaration extends BaseStateDeclaration {
  component: LazyExoticComponent<ComponentType<any>> | typeof UIView;
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
  /** Language choices and default language are fetched from MasterMind */
  languageChoices?: LanguageOption[];
  defaultLanguage?: string;
  FEATURES?: Record<string, Record<string, boolean>>;
  pageSize: number;
  buildId: string;
  accountingMode: 'billing' | 'accounting';
  roles: RoleDetails[];
  /**
    Provide exclude file types for issue attachments uploading
    Based on https://github.com/okonet/attr-accept
    Reffered to https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Input#Attributes
    Available value format:
    A file extension starting with the STOP character (U+002E). (e.g. .jpg, .png, .doc).
    A valid MIME type with no extensions.
    audio/* representing sound files.
    video/* representing video files.
    image/* representing image files.
  */
  excludedAttachmentTypes: string[];

  /** Ensure that customer, project and resource name contains only ASCII chars. */
  enforceLatinName: boolean;

  /** It can be either 'localStorage' or 'sessionStorage'. */
  authStorage: string;
}

export type AtLeast<T, K extends keyof T> = Partial<T> & Pick<T, K>;
