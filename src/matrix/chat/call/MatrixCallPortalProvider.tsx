import {
  FC,
  PropsWithChildren,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  MIN_MARGIN,
  WIDGET_HEIGHT,
  WIDGET_WIDTH,
} from './MatrixCallFloatingWidget';
import {
  MatrixCallPortalContext,
  PopOutCandidate,
  PortalSlotEntry,
  WidgetPosition,
} from './MatrixCallPortalContext';

const STORAGE_KEY = 'waldur_matrix_call_widget_pos';
const DEFAULT_POSITION: WidgetPosition = { x: 24, y: 24 };

function clampPosition(x: number, y: number): WidgetPosition {
  if (typeof window === 'undefined') return { x, y };
  const maxX = Math.max(MIN_MARGIN, window.innerWidth - WIDGET_WIDTH);
  const maxY = Math.max(MIN_MARGIN, window.innerHeight - WIDGET_HEIGHT);
  return {
    x: Math.min(Math.max(x, MIN_MARGIN), maxX),
    y: Math.min(Math.max(y, MIN_MARGIN), maxY),
  };
}

function loadPosition(): WidgetPosition {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_POSITION;
    const parsed = JSON.parse(raw);
    if (
      typeof parsed?.x === 'number' &&
      typeof parsed?.y === 'number' &&
      Number.isFinite(parsed.x) &&
      Number.isFinite(parsed.y)
    ) {
      return clampPosition(parsed.x, parsed.y);
    }
  } catch {
    // sessionStorage may throw in restricted contexts; fall through.
  }
  return DEFAULT_POSITION;
}

export const MatrixCallPortalProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  const [registeredSlot, setRegisteredSlot] = useState<PortalSlotEntry | null>(
    null,
  );
  const [widgetPosition, setWidgetPositionState] =
    useState<WidgetPosition>(loadPosition);
  const [isInDocumentPiP, setIsInDocumentPiP] = useState(false);
  const [popOutCandidate, setPopOutCandidate] = useState<PopOutCandidate>(null);
  const returnListenersRef = useRef<Set<() => void>>(new Set());
  const popOutListenersRef = useRef<Set<() => void>>(new Set());

  const registerSlot = useCallback((roomId: string, el: HTMLDivElement) => {
    setRegisteredSlot({ roomId, el });
  }, []);

  const unregisterSlot = useCallback((roomId: string) => {
    setRegisteredSlot((prev) => (prev?.roomId === roomId ? null : prev));
  }, []);

  const setWidgetPosition = useCallback((pos: WidgetPosition) => {
    setWidgetPositionState(pos);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
    } catch {
      // ignored — restricted storage
    }
  }, []);

  const onReturnToCall = useCallback((cb: () => void) => {
    returnListenersRef.current.add(cb);
    return () => {
      returnListenersRef.current.delete(cb);
    };
  }, []);

  const requestReturnToCall = useCallback(() => {
    returnListenersRef.current.forEach((cb) => cb());
  }, []);

  const onTogglePopOut = useCallback((cb: () => void) => {
    popOutListenersRef.current.add(cb);
    return () => {
      popOutListenersRef.current.delete(cb);
    };
  }, []);

  const requestTogglePopOut = useCallback(() => {
    popOutListenersRef.current.forEach((cb) => cb());
  }, []);

  const value = useMemo(
    () => ({
      registeredSlot,
      registerSlot,
      unregisterSlot,
      widgetPosition,
      setWidgetPosition,
      isInDocumentPiP,
      setIsInDocumentPiP,
      onReturnToCall,
      requestReturnToCall,
      onTogglePopOut,
      requestTogglePopOut,
      popOutCandidate,
      setPopOutCandidate,
    }),
    [
      registeredSlot,
      registerSlot,
      unregisterSlot,
      widgetPosition,
      setWidgetPosition,
      isInDocumentPiP,
      onReturnToCall,
      requestReturnToCall,
      onTogglePopOut,
      requestTogglePopOut,
      popOutCandidate,
    ],
  );

  return (
    <MatrixCallPortalContext.Provider value={value}>
      {children}
    </MatrixCallPortalContext.Provider>
  );
};
