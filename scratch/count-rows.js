const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const tables = ['User', 'ServiceProvider', 'Booking', 'Dispute', 'Notification'];
  for (const t of tables) {
    try {
      const count = await p[t].count();
      console.log(`${t}: ${count}`);
    } catch (e) {
      console.log(`${t}: ERROR ${e.message.split('\n')[0]}`);
    }
  }
  await p.$disconnect();
})();