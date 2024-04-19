import { Button } from 'react-bootstrap';

import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';

export const AddCommentButton = ({ onClick }) => {
  return (
    <Tip id="form-add-comment-tooltip" label={translate('Add comment')}>
      <Button variant="flush" onClick={onClick}>
        <span className="svg-icon svg-icon-muted svg-icon-4x">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              opacity="0.3"
              d="M2 4V16C2 16.6 2.4 17 3 17H13L16.6 20.6C17.1 21.1 18 20.8 18 20V17H21C21.6 17 22 16.6 22 16V4C22 3.4 21.6 3 21 3H3C2.4 3 2 3.4 2 4Z"
              fill="currentColor"
            />
            <rect
              x="14.2891"
              y="18.2033"
              width="8"
              height="2"
              rx="1"
              transform="rotate(-90 10.8891 17.8033)"
              fill="currentColor"
            ></rect>
            <rect
              x="8.21041"
              y="9.3047"
              width="8"
              height="2"
              rx="1"
              fill="currentColor"
            ></rect>
          </svg>
        </span>
      </Button>
    </Tip>
  );
};
