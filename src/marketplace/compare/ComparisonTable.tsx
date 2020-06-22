import * as React from 'react';
import { useSelector } from 'react-redux';

import { range } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { ComparisonSections } from '@waldur/marketplace/compare/ComparisonSections';
import { COMPARISON_COLUMNS } from '@waldur/marketplace/compare/store/constants';
import { useTitle } from '@waldur/navigation/title';

import { ComparisonItem } from './ComparisonItem';
import { ComparisonItemPlaceholder } from './ComparisonItemPlaceholder';
import { getItems } from './store/selectors';

import './ComparisonTable.scss';

export const ComparisonTable: React.FC<{}> = () => {
  const items = useSelector(getItems);
  useTitle(translate('Compare items'));
  return (
    <div className="h-scrollable">
      <table
        className="table table-bordered table-hover"
        style={{ tableLayout: 'fixed' }}
      >
        <tbody>
          <tr>
            <td style={{ width: 200 }} />
            {items.map((item, index) => (
              <td key={index} style={{ width: 230 }}>
                <ComparisonItem item={item} />
              </td>
            ))}
            {items.length < 4 &&
              range(COMPARISON_COLUMNS - items.length).map((index) => (
                <ComparisonItemPlaceholder key={index} />
              ))}
          </tr>
          <ComparisonSections items={items} />
        </tbody>
      </table>
    </div>
  );
};
