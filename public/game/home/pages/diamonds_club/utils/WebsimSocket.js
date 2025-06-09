const WebsimSocket = window.WebsimSocket || class {
    constructor() {
        console.warn('Dummy WebsimSocket initialized');
    }
    initialize() { return Promise.resolve(); }
    updateRoomState() {}
    updatePresence() {}
    subscribePresence(cb) {}
    subscribeRoomState(cb) {}
    subscribePresenceUpdateRequests(cb) {}
    onmessage = null;
    on() {}
    emit() {}
};

export default WebsimSocket;
