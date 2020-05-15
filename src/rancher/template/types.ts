import { Namespace, RancherProject } from '../types';

export interface FormData {
  name: string;
  description: string;
  version: string;
  useNewNamespace: boolean;
  newNamespace?: string;
  namespace: Namespace;
  project: RancherProject;
  answers: object;
}
