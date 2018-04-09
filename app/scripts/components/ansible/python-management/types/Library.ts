import { OptionDs } from '@waldur/form-react/autosuggest-field/OptionDs';

export class Library {
  uuid: string;
  name: OptionDs;
  version: OptionDs;

  constructor(name: string, version: string, uuid?: string) {
    this.name = new OptionDs(name, name);
    this.version = new OptionDs(version, version);
    this.uuid = uuid;
  }
}
