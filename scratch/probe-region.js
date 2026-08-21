const net = require('net');

const regions = [
  'aws-0-ap-southeast-1', 'aws-0-ap-southeast-2', 'aws-0-us-east-1',
  'aws-0-us-west-1', 'aws-0-eu-central-1', 'aws-0-eu-west-1',
  'aws-0-eu-west-2', 'aws-0-ap-northeast-1', 'aws-0-sa-east-1',
  'aws-0-ca-central-1', 'aws-0-us-east-2', 'aws-0-eu-west-3',
];

// PostgreSQL startup packet (SSLRequest): length=8, code=80877103
const sslRequest = Buffer.from([0, 0, 0, 8, 4, 210, 22, 47]);

function probe(region, port) {
  return new Promise((resolve) => {
    const sock = net.connect({ host: `${region}.pooler.supabase.com`, port, timeout: 8000 });
    const onData = (data) => {
      sock.destroy();
      // 'S' means SSL supported
      resolve({ region, port, status: data[0] === 83 ? 'SSL-OK' : `resp:${data[0].toString(16)}` });
    };
    sock.on('connect', () => {
      sock.setTimeout(5000, () => { sock.destroy(); resolve({ region, port, status: 'timeout' }); });
      sock.on('data', onData);
      sock.write(sslRequest);
    });
    sock.on('error', (e) => resolve({ region, port, status: e.code }));
    sock.on('timeout', () => { sock.destroy(); resolve({ region, port, status: 'timeout' }); });
  });
}

(async () => {
  for (const region of regions) {
    const r = await probe(region, 6543);
    if (r.status === 'SSL-OK') {
      console.log(`[+] ${region}:6543 SSL-OK (likely project region)`);
      const s = await probe(region, 5432);
      console.log(`    ${region}:5432 -> ${s.status}`);
    } else {
      console.log(`[-] ${region}:6543 ${r.status}`);
    }
  }
})();