import { getItem, removeItem, setItem } from '@waldur/auth/AuthStorage';

const getParsed = (key: string) => {
  const item = getItem(key);
  if (item) {
    try {
      return JSON.parse(item);
    } catch (error) {
      removeItem(key);
    }
  }
  return null;
};

const CUSTOMER_KEY = 'waldur/workspace/customer';

const PROJECT_KEY = 'waldur/workspace/project';

const SIDEBAR_KEY = 'waldur/workspace/sidebar';

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

  setSidebarStatus = (state: { title; value }[]) => {
    setItem(SIDEBAR_KEY, JSON.stringify(state));
  };

  getSidebarStatus = (): { title; value }[] => getParsed(SIDEBAR_KEY);

  clearSidebarStatus = () => removeItem(SIDEBAR_KEY);
}

export const WorkspaceStorage = new WorkspaceStorageClass();
