import {Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  HasManyRepositoryFactory,
  repository,
} from '@loopback/repository';
import {BolsiyoDbDataSource} from '../datasources';
import {Category, Product, ProductLog, ProductRelations} from '../models';
import {CategoryRepository} from './category.repository';
import {ProductLogRepository} from './product-log.repository';

export class ProductRepository extends DefaultCrudRepository<
  Product,
  typeof Product.prototype.id,
  ProductRelations
> {
  public readonly productLogs: HasManyRepositoryFactory<
    ProductLog,
    typeof Product.prototype.id
  >;

  public readonly category: BelongsToAccessor<
    Category,
    typeof Product.prototype.id
  >;

  constructor(
    @inject('datasources.bolsiyoDB') dataSource: BolsiyoDbDataSource,
    @repository.getter('ProductLogRepository')
    protected productLogRepositoryGetter: Getter<ProductLogRepository>,
    @repository.getter('CategoryRepository')
    CategoryRepositoryGetter: Getter<CategoryRepository>,
  ) {
    super(Product, dataSource);

    (this.modelClass as any).observe('persist', async (ctx: any) => {
      delete ctx.data.stock;
    });

    this.productLogs = this.createHasManyRepositoryFactoryFor(
      'productLogs',
      productLogRepositoryGetter,
    );

    this.category = this.createBelongsToAccessorFor(
      'category',
      CategoryRepositoryGetter,
    );

    this.registerInclusionResolver(
      'productLogs',
      this.productLogs.inclusionResolver,
    );

    this.registerInclusionResolver('category', this.category.inclusionResolver);
  }
}
