import { FC, useRef, useState, useEffect } from 'react';

import { Badge, LinkButton, ModalBody, ModalTitle } from 'waldur-ui';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

import { SafeMarkdown } from './SafeMarkdown';

interface TruncatedMarkdownProps {
  text: string;
  maxHeight?: number;
  title?: string;
  smallTitles?: boolean;
  showInternalBadge?: boolean;
}

interface FullMarkdownModalProps {
  resolve: {
    text: string;
    title: string;
    smallTitles?: boolean;
    showInternalBadge?: boolean;
  };
}

const FullMarkdownModal: FC<FullMarkdownModalProps> = ({ resolve }) => {
  return (
    <ModalBody>
      <ModalTitle as="h5" className="mb-2.5 text-[15px] leading-[1.555]">
        {resolve.title}
        {resolve.showInternalBadge && (
          <>
            {' '}
            <Badge variant="warning" shape="pill" tone="outline">
              {translate('Internal')}
            </Badge>
          </>
        )}
      </ModalTitle>
      <SafeMarkdown text={resolve.text} smallTitles={resolve.smallTitles} />
    </ModalBody>
  );
};

export const TruncatedMarkdown: FC<TruncatedMarkdownProps> = ({
  text,
  maxHeight = 120,
  title = translate('Content'),
  smallTitles,
  showInternalBadge = false,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);
  const { openDialog } = useModal();

  useEffect(() => {
    const checkTruncation = () => {
      if (contentRef.current) {
        const element = contentRef.current;
        const isOverflowing = element.scrollHeight > maxHeight;
        setIsTruncated(isOverflowing);
      }
    };

    checkTruncation();

    // Re-check on window resize
    const handleResize = () => {
      checkTruncation();
    };

    window.addEventListener('resize', handleResize);

    // Small delay to ensure DOM is fully rendered
    const timeoutId = setTimeout(checkTruncation, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [text, maxHeight]);

  const handleShowMore = () => {
    openDialog(FullMarkdownModal, {
      resolve: { text, title, smallTitles, showInternalBadge },
      size: 'lg',
    });
  };

  return (
    <div>
      <div
        ref={contentRef}
        className="overflow-hidden relative"
        style={{ maxHeight: isTruncated ? `${maxHeight}px` : 'none' }}
      >
        <SafeMarkdown text={text} smallTitles={smallTitles} />
        {isTruncated && (
          <div
            className="absolute flex items-end justify-center h-10 bottom-0 start-0 end-0 pb-2"
            style={{
              background: 'linear-gradient(transparent, var(--bg-primary))',
            }}
          />
        )}
      </div>
      {isTruncated && (
        <LinkButton className="mt-1.5" onClick={handleShowMore}>
          {translate('Show more')}
        </LinkButton>
      )}
    </div>
  );
};
