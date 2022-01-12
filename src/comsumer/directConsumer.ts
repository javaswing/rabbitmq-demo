import {
  Consumer,
  Inject,
  MSListenerType,
  Provide,
  RabbitMQListener,
} from '@midwayjs/decorator';
import { Context } from '@midwayjs/rabbitmq';
import { ConsumeMessage } from 'amqplib';
import { QueueName } from '../service/rabbitmq';

@Provide()
@Consumer(MSListenerType.RABBITMQ)
export class DirectConsumer {
  @Inject()
  ctx: Context;

  @RabbitMQListener(QueueName.Direct)
  async consume(msg: ConsumeMessage) {
    console.log("[x] %s: '%s", msg.fields.routingKey, msg.content.toString());
    setTimeout(() => {
      this.ctx.ack(msg);
    }, 5000);
  }
}
