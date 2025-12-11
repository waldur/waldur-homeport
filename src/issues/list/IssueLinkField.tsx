import React, { FunctionComponent } from 'react';

import { Link } from '@waldur/core/Link';

interface IssueLinkProps {
  label?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  target?: string;
  onClick?: (e?) => void;
  row?: any;
}

export const IssueLinkField: FunctionComponent<IssueLinkProps> = (props) => {
  const toParams = { issue_uuid: props.row.uuid };

  return (
    <Link
      state="support.detail"
      params={toParams}
      label={props.label}
      target={props.target}
      onClick={props.onClick}
      className={props.className}
    >
      {props.children}
    </Link>
  );
};
