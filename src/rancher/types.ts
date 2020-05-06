export interface Namespace {
  name: string;
  uuid: string;
}

export interface RancherProject {
  name: string;
  uuid: string;
  namespaces: Namespace[];
}
