import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { useEffect } from 'react';

import { CALL_VALIDATION_STATE } from '@/proposals/workflow-check/WorkflowCheckPanel';

/**
 * The validation was once a tab of the call's Manage and Edit pages
 * (`?tab=validation&validation_tab=…`); links to it land on the Validation
 * page, on the same section.
 */
export const useValidationRedirect = () => {
  const { params } = useCurrentStateAndParams();
  const router = useRouter();
  useEffect(() => {
    if (params.tab === 'validation') {
      router.stateService.go(
        CALL_VALIDATION_STATE,
        { tab: params.validation_tab || 'check', validation_tab: null },
        { location: 'replace' },
      );
    }
  }, [params.tab, params.validation_tab, router]);
};
