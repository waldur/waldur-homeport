import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';
import useAsync from 'react-use/lib/useAsync';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate, withTranslation } from '@waldur/i18n';
import { getCategories } from '@waldur/marketplace-checklist/api';
import { Checklist } from '@waldur/marketplace-checklist/types';
import { ChecklistCard } from '@waldur/user/list/ChecklistCard';

export const ChecklistsList = withTranslation(() => {
  const { loading, value: checklists, error } = useAsync(getCategories, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <h3 className="text-center">
        {translate('Unable to load marketplace checklists.')}
      </h3>
    );
  }

  return (
    <Row>
      {checklists.map((checklist: Checklist, index: number) =>
        checklist.checklists_count !== 0 ? (
          <Col key={index} md={2} sm={6}>
            <ChecklistCard checklist={checklist} />
          </Col>
        ) : null,
      )}
    </Row>
  );
});
