import {Getter, inject} from '@loopback/core';
import {
  DefaultCrudRepository,
  HasManyRepositoryFactory,
  repository,
} from '@loopback/repository';
import {BolsiyoDbDataSource} from '../datasources';
import {Category, CategoryRelations, Product} from '../models';
import {ProductRepository} from './product.repository';

export class CategoryRepository extends DefaultCrudRepository<
  Category,
  typeof Category.prototype.id,
  CategoryRelations
> {
  public readonly products: HasManyRepositoryFactory<
    Product,
    typeof Category.prototype.id
  >;

  constructor(
    @inject('datasources.bolsiyoDB') dataSource: BolsiyoDbDataSource,
    @repository.getter('ProductRepository')
    protected productRepositoryGetter: Getter<ProductRepository>,
  ) {
    super(Category, dataSource);
    this.products = this.createHasManyRepositoryFactoryFor(
      'products',
      productRepositoryGetter,
    );
    this.registerInclusionResolver('products', this.products.inclusionResolver);
  }
}
