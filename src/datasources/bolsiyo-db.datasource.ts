import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'bolsiyoDB',
  connector: 'mysql',
  url: '',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || '3306',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'bolsiyoDB',
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class BolsiyoDbDataSource
  extends juggler.DataSource
  implements LifeCycleObserver
{
  static dataSourceName = 'bolsiyoDB';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.bolsiyoDB', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
