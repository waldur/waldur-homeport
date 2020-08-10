import * as classNames from 'classnames';
import * as React from 'react';
import { useSelector } from 'react-redux';
import { formValueSelector } from 'redux-form';

import { translate } from '@waldur/i18n';
import { FORM_ID } from '@waldur/marketplace/details/constants';
import { NodeRole } from '@waldur/rancher/types';

export const LonghornWorkerWarning = ({ nodeIndex }) => {
  const roles: Array<NodeRole> = useSelector((state) =>
    formValueSelector(FORM_ID)(state, `attributes.nodes[${nodeIndex}].roles`),
  );
  const longhornSelected = useSelector((state) =>
    formValueSelector(FORM_ID)(state, `attributes.install_longhorn`),
  );
  const flavor = useSelector((state) =>
    formValueSelector(FORM_ID)(state, `attributes.nodes[${nodeIndex}].flavor`),
  );
  if (
    !roles.includes('worker') ||
    !flavor ||
    (flavor.cores >= 4 && flavor.ram >= 4 * 1024)
  ) {
    return null;
  }
  return (
    <p
      className={classNames('help-block m-b-none', {
        'text-danger': longhornSelected,
        'text-muted': !longhornSelected,
      })}
    >
      {longhornSelected
        ? translate(
            'The worker node is expected to have at least 4 vCPU and 4 GB RAM to run Longhorn.',
          )
        : translate(
            'A minimal expected configuration of worker is 4 vCPU and 4 GB RAM.',
          )}
    </p>
  );
};
