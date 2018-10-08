import { Library } from '@waldur/ansible/python-management/types/Library';

export class VirtualEnvironment {

  public requirements: string;

  constructor(public name: string, public uuid: string, public installedLibraries: Library[], public jupyterHubGlobal: boolean) {
  }
}
