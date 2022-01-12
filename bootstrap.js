const WebFramework = require('@midwayjs/web').Framework;
const RabbitMQFramework = require('@midwayjs/rabbitmq').Framework;

const web = new WebFramework().configure({
  port: 7001,
});

const { Bootstrap } = require('@midwayjs/bootstrap');
Bootstrap.load(web)
  .load(config => {
    return new RabbitMQFramework().configure({
      url: config.rabbitMQ.url,
    });
  })
  .run();
