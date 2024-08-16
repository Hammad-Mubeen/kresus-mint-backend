const amqp = require("amqplib");
const sniff = require("../utils/sniff");
const { AMQP_URL } = process.env;

const queueName = "datablitzer";

async function start() {
  const connection = await amqp.connect(AMQP_URL);
  const channel = await connection.createChannel();
  await channel.assertQueue(queueName);

  channel.consume(queueName, async (message) => {
    const data = JSON.parse(message.content.toString());
    await sniff.sniffUrl(data);

    channel.ack(message);
  });
}
start().catch(console.error);

module.exports = {
  publishData: async (data) => {
    const connection = await amqp.connect(AMQP_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(queueName);
    await channel.publish("", queueName, Buffer.from(data));
  },
};
