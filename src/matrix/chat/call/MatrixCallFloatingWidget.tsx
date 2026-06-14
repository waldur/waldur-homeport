import { ArrowSquareInIcon } from '@phosphor-icons/react';
import {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { openUnifiedChatDrawer } from '@/chat/openUnifiedChatDrawer';
import { useDrawer } from '@/drawer/actions';
import { translate } from '@/i18n';

import { MatrixCallPortalContext } from './MatrixCallPortalContext';
import { useMatrixCall } from './useMatrixCall';

interface MatrixCallFloatingWidgetProps {
  roomName: string;
}

export const WIDGET_WIDTH = 320;
// Header (~32px) + LiveKit ControlBar (~50px) eat ~82px of chrome, leaving
// 180px for the video — which matches a 320-wide 16:9 frame exactly, so the
// compact tile fits under `object-fit: cover` with no crop and no letterbox.
export const WIDGET_HEIGHT = 262;
export const MIN_MARGIN = 8;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export const MatrixCallFloatingWidget = forwardRef<
  HTMLDivElement,
  MatrixCallFloatingWidgetProps
>(({ roomName }, portalTargetRef) => {
  const { callRoomUuid } = useMatrixCall();
  const { openDrawer } = useDrawer();
  const { widgetPosition, setWidgetPosition, requestReturnToCall } = useContext(
    MatrixCallPortalContext,
  );

  // If the drawer is closed, requestReturnToCall has no subscriber to act on.
  // Opening the drawer with the call's room as the default makes the matrix
  // panel mount on the right room and re-dock the call view.
  const handleReturnToCall = useCallback(() => {
    requestReturnToCall();
    if (callRoomUuid) {
      openUnifiedChatDrawer(openDrawer, { defaultRoomUuid: callRoomUuid });
    }
  }, [requestReturnToCall, callRoomUuid, openDrawer]);

  const widgetRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<{
    startClientX: number;
    startClientY: number;
    startPos: { x: number; y: number };
    pointerId: number;
  } | null>(null);
  const [draftPos, setDraftPos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const draftPosRef = useRef<{ x: number; y: number } | null>(null);

  const effectivePos = draftPos ?? widgetPosition;

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      dragStateRef.current = {
        startClientX: e.clientX,
        startClientY: e.clientY,
        startPos: { ...widgetPosition },
        pointerId: e.pointerId,
      };
    },
    [widgetPosition],
  );

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const state = dragStateRef.current;
      if (!state || e.pointerId !== state.pointerId) return;
      const dx = state.startClientX - e.clientX;
      const dy = state.startClientY - e.clientY;
      const maxX = Math.max(MIN_MARGIN, window.innerWidth - WIDGET_WIDTH);
      const maxY = Math.max(MIN_MARGIN, window.innerHeight - WIDGET_HEIGHT);
      const next = {
        x: clamp(state.startPos.x + dx, MIN_MARGIN, maxX),
        y: clamp(state.startPos.y + dy, MIN_MARGIN, maxY),
      };
      draftPosRef.current = next;
      setDraftPos(next);
    };

    const onUp = (e: PointerEvent) => {
      const state = dragStateRef.current;
      if (!state || e.pointerId !== state.pointerId) return;
      dragStateRef.current = null;
      const finalPos = draftPosRef.current;
      draftPosRef.current = null;
      setDraftPos(null);
      if (finalPos) setWidgetPosition(finalPos);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [setWidgetPosition]);

  return (
    <div
      ref={widgetRef}
      className="matrix-call-widget shadow"
      style={{
        position: 'fixed',
        right: effectivePos.x,
        bottom: effectivePos.y,
        width: WIDGET_WIDTH,
        height: WIDGET_HEIGHT,
        background: 'var(--bs-body-bg)',
        border: '1px solid var(--bs-border-color)',
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1080,
      }}
    >
      <div
        className="d-flex align-items-center gap-2 px-2 py-1 border-bottom"
        style={{ cursor: 'grab', userSelect: 'none', touchAction: 'none' }}
        onPointerDown={onPointerDown}
      >
        <span className="fw-semibold flex-grow-1 text-truncate">
          {roomName}
        </span>
        <button
          type="button"
          className="btn btn-sm btn-light"
          onClick={handleReturnToCall}
          aria-label={translate('Return to call')}
          title={translate('Return to call in chat')}
        >
          <ArrowSquareInIcon size={14} weight="bold" />
        </button>
      </div>
      <div
        ref={portalTargetRef}
        data-testid="call-widget-portal-target"
        className="flex-grow-1 overflow-hidden"
      />
    </div>
  );
});

MatrixCallFloatingWidget.displayName = 'MatrixCallFloatingWidget';
