import { FC, useState } from 'react';
import { Nav, Tab } from 'react-bootstrap';

import { CopyToClipboard } from '@/core/CopyToClipboard';
import { MonacoField } from '@/form/MonacoField';
import { translate } from '@/i18n';
import { Offering } from '@/marketplace/types';
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
            className="btn-tertiary w-150px"
          />
        )
      }
      footer={
        <CloseDialogButton label={translate('Close')} className="w-150px" />
      }
    >
      <Tab.Container activeKey={view} onSelect={(k) => k && setView(k as View)}>
        <Nav variant="tabs" className="nav-line-tabs mb-5">
          <Nav.Item>
            <Nav.Link eventKey="toml">{translate('TOML config')}</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="tree" disabled={!hasTree}>
              {translate('Directory')}
            </Nav.Link>
          </Nav.Item>
        </Nav>
        <Tab.Content>
          <Tab.Pane eventKey="toml" mountOnEnter={false}>
            {hasConfig ? (
              <MonacoField
                input={{ onChange: null, value: props.resolve.config }}
                readOnly
              />
            ) : (
              <p className="text-quaternary">
                {translate('No configuration has been set.')}
              </p>
            )}
          </Tab.Pane>
          <Tab.Pane eventKey="tree" mountOnEnter unmountOnExit={false}>
            {hasTree ? (
              <GLAuthTreeView tree={props.resolve.tree as GlauthTree} />
            ) : (
              <p className="text-quaternary">
                {translate('No tree data available.')}
              </p>
            )}
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </ModalDialog>
  );
};
