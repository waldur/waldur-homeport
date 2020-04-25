import { StateDeclaration as BaseStateDeclaration } from '@uirouter/core';

interface DataDeclaration {
  /** Page title is rendered as page header component and as document head */
  pageTitle: string;
  /** State is disabled as long as its feature is disabled */
  feature: string;
  /** Related sidebar item is expanded if its key matches current state sidebarKey */
  sidebarKey: string;
  /** Page header component is concealed as long as this parameter is set to false */
  renderDocumentTitle: boolean;
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

interface DataStateDeclaration extends BaseStateDeclaration {
  data?: Partial<DataDeclaration>;
}

interface TemplateStateDeclaration extends DataStateDeclaration {
  template?: string;
  templateUrl?: string;
  controller?: Function;
}

interface ComponentStateDeclaration extends DataStateDeclaration {
  component?: React.ComponentType<{}>;
}

export type StateDeclaration =
  | ComponentStateDeclaration
  | TemplateStateDeclaration;
