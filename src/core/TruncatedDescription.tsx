import { truncate } from 'lodash-es';
import { useToggle } from 'react-use';

import { translate } from '@waldur/i18n';

const OFFSET = 20;

export const TruncatedDescription = ({ text = '', max = 150 }) => {
  const [collapsed, setCollapsed] = useToggle(true);

  // Instead of showing the 'Show more` button for just a few more characters, show the full text.
  if (text.length <= max + OFFSET) {
    return text;
  }

  return (
    <div>
      {collapsed ? truncate(text, { length: max }) : text}
      <button
        type="button"
        className="text-anchor fw-bold"
        onClick={setCollapsed}
      >
        &nbsp;
        {collapsed ? translate('Show more') : translate('Show less')}
      </button>
    </div>
  );
};
