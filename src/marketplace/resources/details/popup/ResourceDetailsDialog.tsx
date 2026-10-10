import { CopySimpleIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { Tabs, TabsList, TabsTrigger, TabsContent } from 'waldur-ui';

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
      iconNode={<CopySimpleIcon weight="bold" />}
      iconColor="success"
      bodyClassName="h-350px"
    >
      <Tabs mount="active" defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">{translate('Details')}</TabsTrigger>
        </TabsList>
        <div className="tab-content">
          <TabsContent value="details">
            <ResourceDetailsTable resource={resource} />
          </TabsContent>
        </div>
      </Tabs>
    </ModalDialog>
  );
};
