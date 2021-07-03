import { Schema } from '@colyseus/schema';
import fossilDelta from 'fossil-delta';
import msgpack from 'notepack.io';
import { Protocol } from '../Protocol.mjs';
import jsonPatch from 'fast-json-patch';
import { debugPatch } from '../Debug.mjs';

class FossilDeltaSerializer {
    constructor() {
        this.id = 'fossil-delta';
    }
    reset(newState) {
        this.previousState = newState;
        this.previousStateEncoded = msgpack.encode(this.previousState);
    }
    getFullState(_) {
        return this.previousStateEncoded;
    }
    applyPatches(clients, previousState) {
        const hasChanged = this.hasChanged(previousState);
        if (hasChanged) {
            this.patches.unshift(Protocol.ROOM_STATE_PATCH);
            let numClients = clients.length;
            while (numClients--) {
                const client = clients[numClients];
                client.enqueueRaw(this.patches);
            }
        }
        return hasChanged;
    }
    hasChanged(newState) {
        const currentState = newState;
        let changed = false;
        let currentStateEncoded;
        /**
         * allow optimized state changes when using `Schema` class.
         */
        if (newState instanceof Schema) {
            if (newState['$changes'].changes.size > 0) { // tslint:disable-line
                changed = true;
                currentStateEncoded = msgpack.encode(currentState);
            }
        }
        else {
            currentStateEncoded = msgpack.encode(currentState);
            changed = !currentStateEncoded.equals(this.previousStateEncoded);
        }
        if (changed) {
            this.patches = fossilDelta.create(this.previousStateEncoded, currentStateEncoded);
            //
            // debugging
            //
            if (debugPatch.enabled) {
                debugPatch('%d bytes, %j', this.patches.length, jsonPatch.compare(msgpack.decode(this.previousStateEncoded), currentState));
            }
            this.previousState = currentState;
            this.previousStateEncoded = currentStateEncoded;
        }
        return changed;
    }
}

export { FossilDeltaSerializer };
//# sourceMappingURL=FossilDeltaSerializer.mjs.map
