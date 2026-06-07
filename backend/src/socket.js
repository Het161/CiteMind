// Holds the Socket.io server instance so any service can emit to a site room.
let io = null;

export function setIo(instance) {
  io = instance;
}

export function emitToSite(siteId, event, payload) {
  if (io) io.to(String(siteId)).emit(event, payload);
}
