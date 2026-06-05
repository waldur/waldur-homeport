import { createContext } from 'react';

export interface PortalSlotEntry {
  roomId: string;
  el: HTMLDivElement;
}

export interface WidgetPosition {
  x: number;
  y: number;
}

export type PopOutCandidate = 'screen_share' | 'camera' | null;

interface MatrixCallPortalContextValue {
  registeredSlot: PortalSlotEntry | null;
  registerSlot: (roomId: string, el: HTMLDivElement) => void;
  unregisterSlot: (roomId: string) => void;
  widgetPosition: WidgetPosition;
  setWidgetPosition: (pos: WidgetPosition) => void;
  /** Whether the host has the call mounted in a Document PiP window. */
  isInDocumentPiP: boolean;
  setIsInDocumentPiP: (v: boolean) => void;
  onReturnToCall: (cb: () => void) => () => void;
  requestReturnToCall: () => void;
  /** Widget asks the host to enter/exit PiP (document if available, else video). */
  onTogglePopOut: (cb: () => void) => () => void;
  requestTogglePopOut: () => void;
  /**
   * What MatrixCallView currently has worth popping out. The widget only
   * shows its "Pop out" button when this is non-null and picks the matching
   * `<video>` element accordingly.
   */
  popOutCandidate: PopOutCandidate;
  setPopOutCandidate: (c: PopOutCandidate) => void;
}

const noop = () => {};

export const MatrixCallPortalContext =
  createContext<MatrixCallPortalContextValue>({
    registeredSlot: null,
    registerSlot: noop,
    unregisterSlot: noop,
    widgetPosition: { x: 24, y: 24 },
    setWidgetPosition: noop,
    isInDocumentPiP: false,
    setIsInDocumentPiP: noop,
    onReturnToCall: () => noop,
    requestReturnToCall: noop,
    onTogglePopOut: () => noop,
    requestTogglePopOut: noop,
    popOutCandidate: null,
    setPopOutCandidate: noop,
  });
