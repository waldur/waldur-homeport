import { Library } from '@waldur/python-management/types/Library';

export class VirtualEnvironment {
  constructor(public name: string, public uuid: string, public installedLibraries: Library[]) {}
}
