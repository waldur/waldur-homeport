import { Transition } from '@uirouter/react';
import { projectsRetrieve } from 'waldur-js-client';

import { queryClient } from '@/core/queryClient';
import { getCustomer } from '@/customer/utils';
import { translate } from '@/i18n';
import {
  fetchProjectMatrixRooms,
  projectMatrixRoomsKey,
} from '@/matrix/chat/useProjectMatrixRooms';
import { isMatrixChatEnabled } from '@/matrix/utils';
import { router } from '@/router';
import { NotifyService } from '@/store/notify';
import store from '@/store/store';
import { setCurrentCustomer, setCurrentProject } from '@/workspace/actions';

async function primeProjectMatrixRooms(projectUuid: string) {
  if (!isMatrixChatEnabled()) return;
  try {
    await queryClient.fetchQuery({
      queryKey: projectMatrixRoomsKey(projectUuid),
      queryFn: () => fetchProjectMatrixRooms(projectUuid),
    });
  } catch (error) {
    // Graceful degradation: surface the failure but leave the cache UNSET.
    // Writing [] here would be indistinguishable from "no rooms exist" and the
    // synchronous route predicate would hard-hide Communication on a transient
    // error. Leaving it unset lets a later fetch (or refetch) recover.
    NotifyService.errorResponse(
      error,
      translate('Unable to load project chat rooms.'),
    );
  }
}

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
      const [customer] = await Promise.all([
        getCustomer(project.data.customer_uuid, [
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
        ]),
        primeProjectMatrixRooms(project.data.uuid),
      ]);
      store.dispatch(setCurrentCustomer(customer));
      store.dispatch(setCurrentProject(project.data));
    } catch (error) {
      if (error.response?.status === 404) {
        router.stateService.go('errorPage.notFound');
      }
    }
  }
  return loadData();
}
