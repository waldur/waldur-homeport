import { Button } from 'react-bootstrap';
import SVG from 'react-inlinesvg';

import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';

const Icon = require('./filter-icon.svg');

export const TableFilterButton = ({ onClick }) => {
  return (
    <Tip id="table-filter-toggle-tip" label={translate('Set filters')}>
      <Button
        variant="light"
        className="btn-icon btn-toggle-filters"
        onClick={onClick}
      >
        <span className="svg-icon svg-icon-2 svg-icon-dark">
          <SVG src={Icon} />
        </span>
      </Button>
    </Tip>
  );
};