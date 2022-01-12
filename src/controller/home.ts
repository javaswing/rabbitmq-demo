import { Controller, Get, Inject, Provide } from '@midwayjs/decorator';
import { QueueName, RabbitmqService } from '../service/rabbitmq';

@Provide()
@Controller('/')
export class HomeController {
  @Inject()
  rabbitmq: RabbitmqService;

  @Get('/')
  async home() {
    this.rabbitmq.sendToQueue(QueueName.Direct, 'hello world');
  }
}
