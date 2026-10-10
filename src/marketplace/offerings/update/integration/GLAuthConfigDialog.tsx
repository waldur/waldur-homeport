import { FC, useState } from 'react';
import { ProviderOfferingDetails as Offering } from 'waldur-js-client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from 'waldur-ui';

import { CopyToClipboard } from '@/core/CopyToClipboard';
import { MonacoEditor } from '@/form/MonacoEditor';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

import { GLAuthTreeView, type GlauthTree } from './GLAuthTreeView';

type View = 'toml' | 'tree';

type OwnProps = {
  resolve: {
    offering: Offering;
    config: string;
    tree: GlauthTree | null;
  };
};

export const GLAuthConfigDialog: FC<OwnProps> = (props) => {
  const [view, setView] = useState<View>('toml');
  const hasConfig =
    props.resolve.config && typeof props.resolve.config === 'string';
  const hasTree = Boolean(props.resolve.tree);

  return (
    <ModalDialog
      title={translate('GLAuth configuration for {offering}', {
        offering: props.resolve.offering.name,
      })}
      actions={
        view === 'toml' &&
        hasConfig && (
          <CopyToClipboard
            value={props.resolve.config}
            label={translate('Copy')}
            className="w-150px"
          />
        )
      }
      footer={
        <CloseDialogButton label={translate('Close')} className="w-150px" />
      }
    >
      <Tabs
        mount="visited"
        value={view}
        onValueChange={(k) => k && setView(k as View)}
      >
        <TabsList className="mb-5">
          <TabsTrigger value="toml">{translate('TOML config')}</TabsTrigger>
          <TabsTrigger value="tree" disabled={!hasTree}>
            {translate('Directory')}
          </TabsTrigger>
        </TabsList>
        <>
          <TabsContent value="toml">
            {hasConfig ? (
              <div className="border rounded overflow-hidden">
                <MonacoEditor
                  value={props.resolve.config}
                  language="ini"
                  height={400}
                  readOnly
                />
              </div>
            ) : (
              <p className="text-quaternary">
                {translate('No configuration has been set.')}
              </p>
            )}
          </TabsContent>
          <TabsContent value="tree">
            {hasTree ? (
              <GLAuthTreeView tree={props.resolve.tree as GlauthTree} />
            ) : (
              <p className="text-quaternary">
                {translate('No tree data available.')}
              </p>
            )}
          </TabsContent>
        </>
      </Tabs>
    </ModalDialog>
  );
};
