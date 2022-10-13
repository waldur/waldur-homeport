import { FC, useState } from 'react';

const openstackIcon = require('@waldur/images/appstore/icon-openstack.png');

export const GroupSection: FC<{ title: string; summary?: string }> = ({
  title,
  summary,
  children,
}) => {
  const [toggle, setToggle] = useState(false);
  return (
    <tbody>
      <tr>
        <td>
          <img src={openstackIcon} width={25} />
        </td>
        <td>
          <td onClick={() => setToggle(!toggle)}>
            <strong>{title}</strong>{' '}
            <i
              className={toggle ? 'fa fa-angle-down' : 'fa fa-angle-right'}
            ></i>
          </td>
        </td>
        <td></td>
        <td>{summary}</td>
        <td></td>
      </tr>
      {toggle && children}
    </tbody>
  );
};
