import { QuestionIcon } from '@phosphor-icons/react';

import { Tooltip } from 'waldur-ui';

export const BackendIdTip = ({ backendId }) =>
  backendId ? (
    <>
      {' '}
      <Tooltip label={backendId}>
        <QuestionIcon weight="bold" />
      </Tooltip>
    </>
  ) : null;
