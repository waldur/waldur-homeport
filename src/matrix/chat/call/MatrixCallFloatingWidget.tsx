import { ArrowSquareInIcon } from '@phosphor-icons/react';
import {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { BaseButton } from 'waldur-ui';

import { useDrawer } from '@/drawer/actions';
import { translate } from '@/i18n';
import { openSupportDrawer } from '@/support/openSupportDrawer';

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
      openSupportDrawer(openDrawer, { defaultRoomUuid: callRoomUuid });
    }
  }, [requestReturnToCall, callRoomUuid, openDrawer]);

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
      className="matrix-call-widget shadow rounded-lg flex flex-col bg-primary border-[1px] border-secondary fixed z-[1080]"
      style={{
        right: effectivePos.x,
        bottom: effectivePos.y,
        width: WIDGET_WIDTH,
        height: WIDGET_HEIGHT,
      }}
    >
      <div
        className="flex items-center gap-2 px-2 py-1 border-b-[1px] border-b-secondary"
        style={{ cursor: 'grab', userSelect: 'none', touchAction: 'none' }}
        onPointerDown={onPointerDown}
      >
        <span className="grow truncate">{roomName}</span>
        <BaseButton
          variant="tertiary"
          size="sm"
          onClick={handleReturnToCall}
          tooltip={translate('Return to call in chat')}
          iconNode={<ArrowSquareInIcon size={14} weight="bold" />}
        />
      </div>
      <div
        ref={portalTargetRef}
        data-testid="call-widget-portal-target"
        className="grow overflow-hidden"
      />
    </div>
  );
});

MatrixCallFloatingWidget.displayName = 'MatrixCallFloatingWidget';
