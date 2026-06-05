import { PictureInPictureIcon } from '@phosphor-icons/react';
import {
  FC,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { translate } from '@/i18n';

import { MatrixCallPortalContext } from './MatrixCallPortalContext';
import { useMatrixCall } from './useMatrixCall';

interface MatrixCallDockSlotProps {
  roomId: string | null;
}

export const MatrixCallDockSlot: FC<MatrixCallDockSlotProps> = ({ roomId }) => {
  const { callState, callRoomId } = useMatrixCall();
  const { registerSlot, unregisterSlot, isInDocumentPiP, requestTogglePopOut } =
    useContext(MatrixCallPortalContext);
  const slotRef = useRef<HTMLDivElement>(null);
  // Optimistic: assume the slot is visible until the observer says otherwise.
  // Defaulting to false would leave a one-frame window where MatrixCallHost
  // falls back to the floating widget before registerSlot lands.
  const [isVisible, setIsVisible] = useState(true);

  const shouldDock =
    callState !== 'idle' && callRoomId !== null && roomId === callRoomId;

  // display:none ancestors (e.g. inactive UnifiedChatDrawer tab) report as
  // not intersecting, so the slot unregisters and the host falls back to
  // the floating widget.
  useEffect(() => {
    if (!shouldDock || isInDocumentPiP || !slotRef.current) {
      setIsVisible(false);
      return;
    }
    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }
    const el = slotRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [shouldDock, isInDocumentPiP]);

  // useLayoutEffect so registration lands before paint — otherwise
  // MatrixCallHost paints the floating widget for one frame before re-rendering
  // with the registered slot.
  useLayoutEffect(() => {
    if (
      !shouldDock ||
      isInDocumentPiP ||
      !roomId ||
      !isVisible ||
      !slotRef.current
    )
      return;
    registerSlot(roomId, slotRef.current);
    return () => {
      unregisterSlot(roomId);
    };
  }, [
    shouldDock,
    isInDocumentPiP,
    roomId,
    isVisible,
    registerSlot,
    unregisterSlot,
  ]);

  if (!shouldDock) return null;

  // Call is in a Document PiP window — show a placeholder with a "Dock back"
  // button so the user can recover the call view into the drawer.
  if (isInDocumentPiP) {
    return (
      <div
        data-testid="dock-slot-pip-placeholder"
        className="overflow-hidden d-flex flex-column align-items-center justify-content-center gap-2 h-100 w-100 bg-light-secondary"
      >
        <PictureInPictureIcon size={32} className="text-muted" weight="thin" />
        <div className="text-muted text-center px-3">
          {translate('Call is playing in Picture-in-Picture')}
        </div>
        <button
          type="button"
          className="btn btn-sm btn-primary"
          onClick={requestTogglePopOut}
        >
          {translate('Dock back to chat')}
        </button>
      </div>
    );
  }

  // The slot itself is layout-neutral (100% of its parent). The drawer
  // controls the visible split between call and chat via its outer wrapper.
  return (
    <div
      ref={slotRef}
      data-testid="dock-slot"
      className="overflow-hidden d-flex h-100 w-100"
    />
  );
};
