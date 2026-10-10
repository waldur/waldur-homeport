// The worker that encrypts and decrypts call media: LiveKit's own, bundled by
// Vite as a same-origin module worker (see useEncryptedRoom), made to keep
// decrypting every participant.
import 'livekit-client/e2ee-worker';

import { keepDecrypting } from './keepDecrypting';

keepDecrypting(self as any);
