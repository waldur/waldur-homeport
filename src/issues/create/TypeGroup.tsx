import * as React from 'react';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { getUser } from '@waldur/workspace/selectors';

import { getShowAllTypes, getIssueTypes } from '../types/utils';

import { LayoutWrapper } from './LayoutWrapper';
import { TypeField } from './TypeField';

export const TypeGroup = ({ disabled, layout }) => {
  const user = useSelector(getUser);
  const showAllTypes = getShowAllTypes(user);
  const issueTypes = React.useMemo(() => getIssueTypes(showAllTypes), [
    showAllTypes,
  ]);
  return (
    <LayoutWrapper
      layout={layout}
      header={
        <>
          {translate('Request type')}
          <span className="text-danger">*</span>
        </>
      }
      body={<TypeField issueTypes={issueTypes} disabled={disabled} />}
    />
  );
};
