import { getItem, removeItem, setItem } from '@waldur/auth/AuthStorage';

const CUSTOMER_KEY = 'waldur/workspace/customer';
const PROJECT_KEY = 'waldur/workspace/project';
const IMPERSONATED_KEY = 'waldur/workspace/impersonated';

class WorkspaceStorageClass {
  setCustomerId = (customerId: string) => {
    setItem(CUSTOMER_KEY, customerId);
  };

  setProjectId = (projectId: string) => {
    setItem(PROJECT_KEY, projectId);
  };

  setImpersonatedUserUuid = (userUuid: string) => {
    setItem(IMPERSONATED_KEY, userUuid);
  };

  getCustomerId = (): string => getItem(CUSTOMER_KEY);

  getProjectId = (): string => getItem(PROJECT_KEY);

  getImpersonatedUserUuid = (): string => getItem(IMPERSONATED_KEY);

  clearCustomerId = () => removeItem(CUSTOMER_KEY);

  clearProjectId = () => removeItem(PROJECT_KEY);

  clearImpersonatedUserUuid = () => removeItem(IMPERSONATED_KEY);
}

export const WorkspaceStorage = new WorkspaceStorageClass();
