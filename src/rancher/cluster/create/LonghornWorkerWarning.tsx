import classNames from 'classnames';
import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { OpenStackFlavor } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { orderFormSelector } from '@waldur/marketplace/deploy/selectors';
import { type RootState } from '@waldur/store/reducers';

export const LonghornWorkerWarning: FunctionComponent<{}> = () => {
  const flavor: OpenStackFlavor = useSelector((state: RootState) =>
    orderFormSelector(state, `attributes.worker_nodes_flavor`),
  );
  const longhornSelected = useSelector((state: RootState) =>
    orderFormSelector(state, `attributes.install_longhorn`),
  );
  if (!flavor || (flavor.cores >= 4 && flavor.ram >= 4 * 1024)) {
    return null;
  }
  return (
    <Form.Text
      className={classNames('mb-0', {
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
    </Form.Text>
  );
};
