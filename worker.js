export class Room {
  constructor(state) { this.state = state; }
  async fetch(req) {
    if (req.headers.get('Upgrade') !== 'websocket') return new Response('MiniGTA relay OK');
    if (this.state.getWebSockets().length >= 4) return new Response('room full', { status: 403 });
    const [client, server] = Object.values(new WebSocketPair());
    this.state.acceptWebSocket(server);
    return new Response(null, { status: 101, webSocket: client });
  }
  webSocketMessage(ws, msg) {
    if (typeof msg !== 'string' || msg.length > 2000) return;
    for (const w of this.state.getWebSockets()) if (w !== ws) { try { w.send(msg); } catch (e) {} }
  }
  webSocketClose(ws) { try { ws.close(1000); } catch (e) {} }
}
export default {
  async fetch(req, env) {
    const room = (new URL(req.url).searchParams.get('room') || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
    if (!room) return new Response('MiniGTA relay OK');
    return env.ROOM.get(env.ROOM.idFromName(room)).fetch(req);
  }
};
