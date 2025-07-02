import {
  activeEditor$,
  cancelLinkEdit$,
  editorRootElementRef$,
  iconComponentFor$,
  linkDialogState$,
  onWindowChange$,
  removeLink$,
  switchFromPreviewToLinkEdit$,
  updateLink$,
  useCellValues,
  usePublisher,
  useTranslation,
} from '@mdxeditor/editor';
import * as Popover from '@radix-ui/react-popover';
import * as Tooltip from '@radix-ui/react-tooltip';
import classNames from 'classnames';
import { useState, FC, useEffect, forwardRef } from 'react';
import { Modal, Button, FormLabel } from 'react-bootstrap';
import { Field, Form } from 'react-final-form';

import { translate } from '@waldur/i18n';

import { StringField } from './StringField';

const LinkEditForm = ({ initialUrl, onCancel }) => {
  const updateLink = usePublisher(updateLink$);

  return (
    <Form
      onSubmit={(values) => {
        updateLink({
          title: '',
          url: values.url,
        });
      }}
      initialValues={{ url: initialUrl || '' }}
      render={({ handleSubmit }) => (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
            e.stopPropagation();
          }}
          onReset={(e) => {
            e.stopPropagation();
            onCancel();
          }}
        >
          <FormLabel>URL</FormLabel>
          <Field
            component={StringField as any}
            name="url"
            id="url"
            placeholder="https://..."
            autoFocus
            className="mb-5"
          />

          <div>
            <Button
              variant="outline btn-outline-default"
              type="reset"
              size="sm"
            >
              {translate('Cancel')}
            </Button>
            <Button type="submit" size="sm" className="ms-2">
              {translate('Save')}
            </Button>
          </div>
        </form>
      )}
    />
  );
};

const LinkDialogPreview: FC = () => {
  const [
    editorRootElementRef,
    activeEditor,
    iconComponentFor,
    linkDialogState,
  ] = useCellValues(
    editorRootElementRef$,
    activeEditor$,
    iconComponentFor$,
    linkDialogState$,
  );
  const publishWindowChange = usePublisher(onWindowChange$);
  const switchFromPreviewToLinkEdit = usePublisher(
    switchFromPreviewToLinkEdit$,
  );
  const removeLink = usePublisher(removeLink$);

  useEffect(() => {
    const update = () => {
      activeEditor?.getEditorState().read(() => {
        publishWindowChange(true);
      });
    };

    window.addEventListener('resize', update);
    window.addEventListener('scroll', update);

    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update);
    };
  }, [activeEditor, publishWindowChange]);

  const [copyUrlTooltipOpen, setCopyUrlTooltipOpen] = useState(false);

  const t = useTranslation();

  const theRect = linkDialogState.rectangle;

  const urlIsExternal =
    linkDialogState.type === 'preview' &&
    linkDialogState.url.startsWith('http');

  return (
    <Popover.Root open={linkDialogState.type === 'preview'}>
      <Popover.Anchor
        data-visible={linkDialogState.type === 'preview'}
        className="linkDialogAnchor"
        style={{
          top: `${theRect?.top ?? 0}px`,
          left: `${theRect?.left ?? 0}px`,
          width: `${theRect?.width ?? 0}px`,
          height: `${theRect?.height ?? 0}px`,
        }}
      />

      <Popover.Portal container={editorRootElementRef?.current}>
        <Popover.Content
          className="linkDialogPopoverContent"
          sideOffset={5}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
          }}
          key={linkDialogState.linkNodeKey}
        >
          {linkDialogState.type === 'preview' && (
            <>
              <a
                className="linkDialogPreviewAnchor"
                href={linkDialogState.url}
                {...(urlIsExternal
                  ? { target: '_blank', rel: 'noreferrer' }
                  : {})}
                title={
                  urlIsExternal
                    ? t('linkPreview.open', `Open {{url}} in new window`, {
                        url: linkDialogState.url,
                      })
                    : linkDialogState.url
                }
              >
                <span>{linkDialogState.url}</span>
                {urlIsExternal && iconComponentFor('open_in_new')}
              </a>

              <ActionButton
                onClick={() => {
                  switchFromPreviewToLinkEdit();
                }}
                title={t('linkPreview.edit', translate('Edit link URL'))}
                aria-label={t('linkPreview.edit', translate('Edit link URL'))}
              >
                {iconComponentFor('edit')}
              </ActionButton>
              <Tooltip.Provider>
                <Tooltip.Root open={copyUrlTooltipOpen}>
                  <Tooltip.Trigger asChild>
                    <ActionButton
                      title={t(
                        'linkPreview.copyToClipboard',
                        translate('Copy to clipboard'),
                      )}
                      aria-label={t(
                        'linkPreview.copyToClipboard',
                        translate('Copy to clipboard'),
                      )}
                      onClick={() => {
                        void window.navigator.clipboard
                          .writeText(linkDialogState.url)
                          .then(() => {
                            setCopyUrlTooltipOpen(true);
                            setTimeout(() => {
                              setCopyUrlTooltipOpen(false);
                            }, 1000);
                          });
                      }}
                    >
                      {copyUrlTooltipOpen
                        ? iconComponentFor('check')
                        : iconComponentFor('content_copy')}
                    </ActionButton>
                  </Tooltip.Trigger>
                  <Tooltip.Portal container={editorRootElementRef?.current}>
                    <Tooltip.Content className="tooltipContent" sideOffset={5}>
                      {t('linkPreview.copied', translate('Copied!'))}
                      <Tooltip.Arrow />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </Tooltip.Provider>

              <ActionButton
                title={t('linkPreview.remove', translate('Remove link'))}
                aria-label={t('linkPreview.remove', translate('Remove link'))}
                onClick={() => {
                  removeLink();
                }}
              >
                {iconComponentFor('link_off')}
              </ActionButton>
            </>
          )}
          <Popover.Arrow className="popoverArrow" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

const InsertLinkPopover = () => {
  const [linkDialogState] = useCellValues(linkDialogState$);
  const cancelLinkEdit = usePublisher(cancelLinkEdit$);

  return (
    <>
      <Modal
        show={linkDialogState.type === 'edit'}
        centered
        onHide={cancelLinkEdit}
      >
        {linkDialogState.type === 'edit' && (
          <Modal.Body>
            <LinkEditForm
              initialUrl={linkDialogState.url}
              onCancel={cancelLinkEdit}
            />
          </Modal.Body>
        )}
      </Modal>
      <LinkDialogPreview />
    </>
  );
};

const ActionButton = forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<'button'>
>(({ className, ...props }, ref) => {
  return (
    <button
      className={classNames('actionButton', className)}
      ref={ref}
      {...props}
    />
  );
});

export default InsertLinkPopover;
