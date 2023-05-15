const getParsed = (key: string) => {
  const item = localStorage.getItem(key);
  if (item) {
    try {
      return JSON.parse(item);
    } catch (error) {
      localStorage.removeItem(key);
    }
  }
  return null;
};

const CUSTOMER_KEY = 'waldur/workspace/customer';

const PROJECT_KEY = 'waldur/workspace/project';

const SIDEBAR_KEY = 'waldur/workspace/sidebar';

class WorkspaceStorageClass {
  setCustomerId = (customerId: string) => {
    localStorage.setItem(CUSTOMER_KEY, customerId);
  };

  setProjectId = (projectId: string) => {
    localStorage.setItem(PROJECT_KEY, projectId);
  };

  getCustomerId = (): string => localStorage.getItem(CUSTOMER_KEY);

  getProjectId = (): string => localStorage.getItem(PROJECT_KEY);

  clearCustomerId = () => localStorage.removeItem(CUSTOMER_KEY);

  clearProjectId = () => localStorage.removeItem(PROJECT_KEY);

  setSidebarStatus = (state: { title; value }[]) => {
    localStorage.setItem(SIDEBAR_KEY, JSON.stringify(state));
  };

  getSidebarStatus = (): { title; value }[] => getParsed(SIDEBAR_KEY);

  clearSidebarStatus = () => localStorage.removeItem(SIDEBAR_KEY);
}

export const WorkspaceStorage = new WorkspaceStorageClass();
