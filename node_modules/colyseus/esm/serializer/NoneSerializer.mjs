class NoneSerializer {
    constructor() {
        this.id = 'none';
    }
    reset(data) {
        // tslint:disable-line
    }
    getFullState(client) {
        return null;
    }
    applyPatches(clients, state) {
        return false;
    }
}

export { NoneSerializer };
//# sourceMappingURL=NoneSerializer.mjs.map
