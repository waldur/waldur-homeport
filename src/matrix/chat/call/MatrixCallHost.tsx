import {
  FC,
  lazy,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import { translate } from '@/i18n';

import { useAllMatrixRooms } from '../useAllMatrixRooms';

import { MatrixCallFloatingWidget } from './MatrixCallFloatingWidget';
import { MatrixCallPortalContext } from './MatrixCallPortalContext';
import { isCallFullscreenActive } from './useFullscreen';
import { useMatrixCall } from './useMatrixCall';

// The call view is the only consumer of livekit-client; fetched on the first
// call rather than shipped to everyone who has chat enabled.
const MatrixCallView = lazy(() => import('./MatrixCallView'));

// Copy every same-origin stylesheet from the main document into the PiP
// window so LiveKit and Bootstrap render the way they do in-page. Cross-origin
// sheets are re-linked by href; anything else falls through silently.
// TODO: profile under Bootstrap + LiveKit + Metronic load to see if the
// inline cssRules copy hitches the main thread on first PiP open; if so,
// flip to <link rel="stylesheet"> cloning for any sheet with an `href`.
function cloneStylesheetsInto(doc: Document) {
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      const rules = Array.from(sheet.cssRules);
      const css = rules.map((r) => r.cssText).join('\n');
      const style = doc.createElement('style');
      style.textContent = css;
      doc.head.appendChild(style);
    } catch {
      if (sheet.href) {
        const link = doc.createElement('link');
        link.rel = 'stylesheet';
        link.href = sheet.href;
        doc.head.appendChild(link);
      }
    }
  }
}

export const MatrixCallHost: FC = () => {
  const { callState, callRoomId } = useMatrixCall();
  const { registeredSlot, setIsInDocumentPiP, onTogglePopOut } = useContext(
    MatrixCallPortalContext,
  );
  const [widgetTarget, setWidgetTarget] = useState<HTMLDivElement | null>(null);
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  // Bumped on fullscreenchange so the relocation effect re-evaluates once the
  // call's fullscreen ends and the element can be re-homed.
  const [relocateTick, setRelocateTick] = useState(0);
  const requestingPipRef = useRef(false);
  const { rooms } = useAllMatrixRooms();

  const containerNode = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const el = document.createElement('div');
    el.dataset.testid = 'call-host-container';
    el.style.width = '100%';
    el.style.height = '100%';
    el.style.display = 'flex';
    el.style.flexDirection = 'column';
    return el;
  }, []);

  const useDock =
    callState !== 'idle' &&
    callRoomId !== null &&
    registeredSlot !== null &&
    registeredSlot.roomId === callRoomId;

  const widgetTargetRef = useCallback((el: HTMLDivElement | null) => {
    setWidgetTarget(el);
  }, []);

  const callRoom = useMemo(() => {
    if (!callRoomId) return null;
    return rooms.find((r: any) => r.room_id === callRoomId) ?? null;
  }, [rooms, callRoomId]);

  const roomName = (callRoom as any)?.room_name || translate('Call');

  // Document PiP outranks in-page destinations. Otherwise pick dock vs widget.
  const destination = pipWindow
    ? pipWindow.document.body
    : useDock
      ? registeredSlot!.el
      : widgetTarget;

  // Re-run the relocation once a fullscreen session ends, so the call re-homes
  // into its current destination.
  useEffect(() => {
    const onFs = () => setRelocateTick((t) => t + 1);
    document.addEventListener('fullscreenchange', onFs);
    document.addEventListener('webkitfullscreenchange', onFs);
    return () => {
      document.removeEventListener('fullscreenchange', onFs);
      document.removeEventListener('webkitfullscreenchange', onFs);
    };
  }, []);

  useEffect(() => {
    if (!containerNode || !destination) return;
    // Never move the call element while it (or a descendant) is fullscreened —
    // re-parenting a fullscreened node drops it out of fullscreen and strands
    // it in the new destination. The element re-homes when fullscreen ends
    // (relocateTick bumps on fullscreenchange). Use the intent flag (not just
    // document.fullscreenElement) to also cover the async requestFullscreen
    // window where the element isn't fullscreen yet.
    if (isCallFullscreenActive()) return;
    if (containerNode.parentElement === destination) return;
    destination.appendChild(containerNode);
    containerNode.querySelectorAll('video, audio').forEach((node) => {
      const media = node as HTMLMediaElement;
      const stream = media.srcObject;
      if (stream) {
        media.srcObject = null;
        media.srcObject = stream;
      }
      media.play?.().catch(() => {
        // Autoplay may reject; that's fine.
      });
    });
  }, [destination, containerNode, relocateTick]);

  useEffect(() => {
    return () => {
      containerNode?.remove();
    };
  }, [containerNode]);

  // Pop-out toggle dispatched from the floating widget.
  useEffect(() => {
    const handle = async () => {
      if (pipWindow) {
        pipWindow.close();
        return;
      }
      // Document PiP only — the whole call view (grid, carousel, controls,
      // everyone's tiles) goes into the OS window. No single-video fallback.
      const dpip = (window as any).documentPictureInPicture;
      if (!dpip?.requestWindow) return;
      if (requestingPipRef.current) return;
      requestingPipRef.current = true;
      try {
        // Roomy landscape window: tall enough that LiveKit's grid lays the
        // tiles out the way it does docked, instead of paginating as it did in
        // the short default window.
        const win: Window = await dpip.requestWindow({
          width: 960,
          height: 720,
        });
        cloneStylesheetsInto(win.document);
        win.document.body.style.margin = '0';
        win.document.body.style.height = '100vh';
        win.document.body.style.background = 'var(--bs-body-bg, #1e1e1e)';
        const onUnload = () => {
          setPipWindow(null);
          setIsInDocumentPiP(false);
        };
        win.addEventListener('pagehide', onUnload, { once: true });
        setPipWindow(win);
        setIsInDocumentPiP(true);
      } catch {
        // requestWindow can reject without a user gesture or with policy
        // denials; nothing useful to do besides silently leave the call docked.
      } finally {
        requestingPipRef.current = false;
      }
    };
    return onTogglePopOut(() => {
      void handle();
    });
  }, [onTogglePopOut, pipWindow, setIsInDocumentPiP]);

  if (callState === 'idle' || !containerNode) return null;

  // Hide the floating widget chrome when the call lives in a Document PiP
  // window — the OS window is the entire UI in that mode.
  const showWidget = !useDock && !pipWindow;

  // Keys keep React reconciling the portal under the same fiber regardless of
  // whether the widget is rendered alongside it — otherwise a position shift
  // would re-mount MatrixCallView and tear down the LiveKit connection.
  return (
    <>
      {showWidget && (
        <MatrixCallFloatingWidget
          key="widget"
          ref={widgetTargetRef}
          roomName={roomName}
        />
      )}
      {createPortal(
        <Suspense fallback={null}>
          <MatrixCallView
            compact={showWidget}
            fullscreenTarget={containerNode}
          />
        </Suspense>,
        containerNode,
        'call-view',
      )}
    </>
  );
};
