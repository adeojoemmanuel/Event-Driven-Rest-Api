import { Kafka, KafkaMessage } from 'kafkajs';
const kafka = new Kafka({ brokers: ['localhost:9092'] });

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'user-group' });

export const KafkaProducer = {
  async init() {
    await producer.connect();
  },
  async sendMessage(topic: string, message: string) {
    await producer.send({
      topic,
      messages: [{ value: message }],
    });
  },
};

export const KafkaConsumer = {
  async init() {
    await consumer.connect();
    await consumer.subscribe({ topic: 'user-events' });

    await consumer.run({
      eachMessage: async ({ message }: { message: KafkaMessage }) => {
        if (message.value !== null) {
          console.log(`Received message: ${message.value.toString()}`);
        } else {
          console.warn('Received message with null value');
        }
      },
    });
  },
};
