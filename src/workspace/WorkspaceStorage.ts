import { getItem, removeItem, setItem } from '@waldur/auth/AuthStorage';

const CUSTOMER_KEY = 'waldur/workspace/customer';

const PROJECT_KEY = 'waldur/workspace/project';

class WorkspaceStorageClass {
  setCustomerId = (customerId: string) => {
    setItem(CUSTOMER_KEY, customerId);
  };

  setProjectId = (projectId: string) => {
    setItem(PROJECT_KEY, projectId);
  };

  getCustomerId = (): string => getItem(CUSTOMER_KEY);

  getProjectId = (): string => getItem(PROJECT_KEY);

  clearCustomerId = () => removeItem(CUSTOMER_KEY);

  clearProjectId = () => removeItem(PROJECT_KEY);
}

export const WorkspaceStorage = new WorkspaceStorageClass();
