export interface JupyterHubUserOptionalConstructor {
  uuid?: string;
  username?: string;
  password?: string;
  admin?: boolean;
  whitelisted?: boolean;
}

export class JupyterHubUser {
  uuid: string;
  username: string;
  password: string;
  admin: boolean;
  whitelisted: boolean;

  constructor(args: JupyterHubUserOptionalConstructor) {
    this.uuid = args.uuid;
    this.username = args.username;
    this.password = args.password;
    this.admin = args.admin;
    this.whitelisted = args.whitelisted;
  }
}
