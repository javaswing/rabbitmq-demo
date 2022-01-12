import {
  Provide,
  Scope,
  ScopeEnum,
  Init,
  Autoload,
  Destroy,
  Config,
} from '@midwayjs/decorator';
import * as amqp from 'amqp-connection-manager';

export enum ExchangeType {
  Direct = 'demo.direct.exchange',
}

export enum QueueName {
  Direct = 'directQueue',
}

@Autoload()
@Provide()
@Scope(ScopeEnum.Singleton) // Singleton 单例，全局唯一（进程级别）
export class RabbitmqService {
  @Config('rabbitMQ')
  private rabbitmq;

  private connection: amqp.AmqpConnectionManager;

  private channelWrapper;

  @Init()
  async init() {
    this.connection = await amqp.connect(this.rabbitmq.url);
    // 创建channel
    this.channelWrapper = this.connection.createChannel({
      json: true,
      setup: (channel: amqp.Channel) => {
        const directModel = this.createDirectModel(channel);
        return Promise.all([directModel]);
      },
    });
  }

  private async createDirectModel(channel: amqp.Channel) {
    console.log('createDirectModel start');
    // 创建交换机
    // 可以在界面的Exchanges中看到对应创建的交换机
    const directExchange = await channel.assertExchange(
      ExchangeType.Direct,
      'direct'
    );
    /**
     * 创建队列
     * 1、name: 队列名称
     * 2、durable: 是否持久化
     * 3、exclusive: 是否独享、排外的。如果设置为true，定义为排他队列。则只有创建者可以使用此队列。也就是private私有的。
     * 4、autoDelete: 是否自动删除。也就是临时队列。当最后一个消费者断开连接后，会自动删除。
     */
    const queue = await channel.assertQueue(QueueName.Direct, {
      durable: true,
      exclusive: false,
      autoDelete: false,
    });

    // 绑定关系
    await channel.bindQueue(queue.queue, directExchange.exchange, 'direct');
    console.log('createDirectModel end');
  }

  // 发送消息
  public async sendToQueue(queueName: QueueName, data: any) {
    return this.channelWrapper.sendToQueue(queueName, data);
  }

  @Destroy()
  async close() {
    await this.channelWrapper.close();
    await this.connection.close();
  }
}
