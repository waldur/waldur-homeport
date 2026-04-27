import { Transition } from '@uirouter/react';
import { projectsRetrieve } from 'waldur-js-client';
import { Project } from 'waldur-js-client';

import { getCustomer } from '@/customer/utils';
import { router } from '@/router';
import store from '@/store/store';
import { setCurrentCustomer, setCurrentProject } from '@/workspace/actions';

export function loadProject(transition: Transition) {
  if (!transition.params().uuid) {
    return router.stateService.go('errorPage.notFound');
  }

  async function loadData() {
    try {
      const includeTerminated =
        transition.params().include_terminated === 'true';
      const project = await projectsRetrieve({
        path: { uuid: transition.params().uuid },
        query: includeTerminated ? ({ include_terminated: true } as any) : {},
      });
      const customer = await getCustomer(project.data.customer_uuid, [
        'url',
        'uuid',
        'created',
        'display_name',
        'image',
        'blocked',
        'archived',
        'projects_count',
        'name',
        'native_name',
        'abbreviation',
        'customer_credit',
        'is_service_provider',
        'user_email_patterns',
        'user_affiliations',
        'user_identity_sources',
      ]);
      store.dispatch(setCurrentCustomer(customer));
      store.dispatch(setCurrentProject(project.data as unknown as Project));
    } catch (error) {
      if (error.response?.status === 404) {
        router.stateService.go('errorPage.notFound');
      }
    }
  }
  return loadData();
}
