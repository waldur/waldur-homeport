import { AuthService } from '@waldur/auth/AuthService';
import store from '@waldur/store/store';
import {
  setCurrentCustomer,
  setCurrentProject,
} from '@waldur/workspace/actions';
import { Customer, Project } from '@waldur/workspace/types';

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

class WorkspaceStorageClass {
  setCustomer = (customer: Customer) => {
    localStorage.setItem('nav.customer', JSON.stringify(customer));
  };
  setProject = (project: Project) => {
    localStorage.setItem('nav.project', JSON.stringify(project));
  };

  getCustomer = (): Customer => getParsed('nav.customer');
  getProject = (): Project => getParsed('nav.project');

  setSidebarStatus = (state: { title; value }[]) => {
    localStorage.setItem('nav.sidebar', JSON.stringify(state));
  };
  getSidebarStatus = (): { title; value }[] => getParsed('nav.sidebar');
  clearSidebarStatus = () => localStorage.removeItem('nav.sidebar');
}

export const WorkspaceStorage = new WorkspaceStorageClass();

export const initWorkspace = () => {
  if (AuthService.isAuthenticated()) {
    const customer = WorkspaceStorage.getCustomer();
    if (customer) store.dispatch(setCurrentCustomer(customer));

    const project = WorkspaceStorage.getProject();
    if (project) store.dispatch(setCurrentProject(project));
  }
};
