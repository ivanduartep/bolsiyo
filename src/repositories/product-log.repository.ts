import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {BolsiyoDbDataSource} from '../datasources';
import {ProductLog, ProductLogRelations} from '../models';

export class ProductLogRepository extends DefaultCrudRepository<
  ProductLog,
  typeof ProductLog.prototype.id,
  ProductLogRelations
> {
  constructor(
    @inject('datasources.bolsiyoDB') dataSource: BolsiyoDbDataSource,
  ) {
    super(ProductLog, dataSource);
  }
}
