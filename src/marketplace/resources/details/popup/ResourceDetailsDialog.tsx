import { CopySimpleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Tab, Tabs } from 'react-bootstrap';

import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { ActionDialogProps } from '@/resource/actions/types';

import { ResourceDetailsTable } from './ResourceDetailsTable';

export const ResourceDetailsDialog: FC<ActionDialogProps> = ({
  resolve: { resource },
}) => {
  return (
    <ModalDialog
      title={translate('Resource details')}
      subtitle={translate('Key information about the resource.')}
      closeButton
      iconNode={<CopySimpleIcon weight="bold" />}
      iconColor="success"
      bodyClassName="h-350px"
    >
      <Tabs defaultActiveKey={1} unmountOnExit={true} className="nav-line-tabs">
        <Tab eventKey={1} title={translate('Details')}>
          <ResourceDetailsTable resource={resource} />
        </Tab>
      </Tabs>
    </ModalDialog>
  );
};
