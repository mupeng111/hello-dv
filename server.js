// 中性测试应用 hello-app：GET / , GET /ip , WS /ws 回显，/outbound 测出站 11111
const http = require('http');
const net = require('net');
const { WebSocketServer } = require('ws');
const PORT = process.env.PORT || 3000;
function getIp() {
  return new Promise((resolve) => {
    const req = http.get('http://api.ipify.org', (res) => {
      let d=''; res.on('data', c=>d+=c); res.on('end', ()=>resolve(d.trim()));
    });
    req.on('error', ()=>resolve('error'));
    req.setTimeout(8000, ()=>{ req.destroy(); resolve('timeout'); });
  });
}
function testOutbound(host, port, timeoutMs=8000) {
  return new Promise((resolve) => {
    const s = new net.Socket();
    let done=false;
    const finish=(ok,detail)=>{ if(done) return; done=true; try{s.destroy();}catch(e){} resolve({ok, detail}); };
    s.setTimeout(timeoutMs);
    s.on('timeout', ()=>finish(false,'timeout'));
    s.on('error', (e)=>finish(false, e.code+': '+e.message));
    s.connect(port, host, ()=>finish(true,'connected'));
  });
}
const server = http.createServer(async (req, res) => {
  if (req.url === '/') { res.writeHead(200, {'Content-Type':'text/plain'}); res.end('ok'); return; }
  if (req.url === '/ip') { const ip = await getIp(); res.writeHead(200, {'Content-Type':'text/plain'}); res.end(ip); return; }
  if (req.url === '/outbound') {
    const r11111 = await testOutbound('nz.woairenqi.eu.cc', 11111);
    const r443 = await testOutbound('nz.woairenqi.eu.cc', 443);
    res.writeHead(200, {'Content-Type':'application/json'});
    res.end(JSON.stringify({ outbound_11111: r11111, outbound_443: r443, at: new Date().toISOString() }));
    return;
  }
  res.writeHead(404); res.end('not found');
});
const wss = new WebSocketServer({ server, path: '/ws' });
wss.on('connection', (ws) => { ws.on('message', (m)=>ws.send('echo:'+m.toString())); });
server.listen(PORT, '0.0.0.0', ()=>console.log('Listening on 0.0.0.0:'+PORT));
