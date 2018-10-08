import store from '@waldur/store/store';
import { setCurrentProject } from '@waldur/workspace/actions';

export function storeProject(project) {
  localStorage.setItem('currentProject', JSON.stringify(project));
}

export function loadProject() {
  const project = localStorage.getItem('currentProject');
  if (project) {
    try {
      store.dispatch(setCurrentProject(JSON.parse(project)));
    } catch (error) {
      // tslint:disable-next-line
      console.log('Error parsing project data', error);
    }
  }
}
