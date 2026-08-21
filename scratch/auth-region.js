const net = require('net');
const tls = require('tls');

const PASSWORD = 'Avu6ITcgKRgi8n53';
const USER = 'postgres.qzpkiwxnxveimqpnukwz';
const DB = 'postgres';

function authenticate(region) {
  return new Promise((resolve) => {
    const plain = net.connect({ host: `${region}.pooler.supabase.com`, port: 6543, timeout: 9000 });
    let settled = false;
    const done = (result) => { if (!settled) { settled = true; resolve({ region, result }); } };

    plain.on('connect', () => {
      plain.write(Buffer.from([0, 0, 0, 8, 4, 210, 22, 47]));
    });
    plain.on('data', (data) => {
      if (data[0] === 83) {
        const tlsSock = tls.connect({ socket: plain, rejectUnauthorized: false }, () => {
          const userBuf = Buffer.from(`user\0${USER}\0database\0${DB}\0\0`);
          const len = 4 + 4 + userBuf.length;
          const start = Buffer.alloc(len);
          start.writeInt32BE(len, 0);
          start.writeInt32BE(196608, 4);
          userBuf.copy(start, 8);
          tlsSock.write(start);
        });
        tlsSock.on('data', (d) => {
          const code = d[0];
          if (code === 82) {
            const pwBuf = Buffer.from(`p\0${PASSWORD}\0`);
            const msg = Buffer.alloc(4 + pwBuf.length);
            msg.writeInt32BE(4 + pwBuf.length, 0);
            pwBuf.copy(msg, 4);
            tlsSock.write(msg);
          } else if (code === 69) {
            done('AUTH ERROR: ' + d.toString('utf8', 1, Math.min(d.length, 150)).replace(/\0/g, ' '));
            tlsSock.destroy();
          } else if (code === 75 || code === 90) {
            done('AUTH SUCCESS');
            tlsSock.end();
          } else {
            done('resp ' + code.toString(16));
            tlsSock.destroy();
          }
        });
        tlsSock.on('error', (e) => done('TLS error: ' + e.message));
      } else {
        done('no-ssl ' + data[0].toString(16));
      }
    });
    plain.on('error', (e) => done('TCP: ' + e.code));
    plain.on('timeout', () => { plain.destroy(); done('timeout'); });
  });
}

(async () => {
  const regions = [
    'aws-0-ap-southeast-1', 'aws-0-ap-southeast-2', 'aws-0-us-east-1',
    'aws-0-us-west-1', 'aws-0-eu-central-1', 'aws-0-eu-west-1',
    'aws-0-eu-west-2', 'aws-0-ap-northeast-1', 'aws-0-sa-east-1',
    'aws-0-ca-central-1', 'aws-0-us-east-2', 'aws-0-eu-west-3',
    'aws-0-ap-south-1', 'aws-0-me-south-1', 'aws-0-af-south-1',
  ];
  const results = await Promise.all(regions.map(authenticate));
  for (const r of results) {
    console.log(`[${r.region}] ${r.result}`);
  }
})();