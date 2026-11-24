const amqp = require('amqplib');

async function setup() {
  const connection = await amqp.connect(process.env.RABBITMQ_URL);
  const channel = await connection.createChannel();

  // Exchange de dead-letter
  await channel.assertExchange('notifications.dlx', 'direct', {
    durable: true,
  });

  // Fila de dead-letter
  await channel.assertQueue('notifications_dlq', { durable: true });

  await channel.bindQueue(
    'notifications_dlq',
    'notifications.dlx',
    'notifications.failed',
  );

  // Fila principal com dead-letter configurado
  await channel.assertQueue('notifications_queue', {
    durable: true,
    arguments: {
      'x-dead-letter-exchange': 'notifications.dlx',
      'x-dead-letter-routing-key': 'notifications.failed',
    },
  });

  console.log('Filas configuradas');

  await channel.close();
  await connection.close();
}

setup().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});