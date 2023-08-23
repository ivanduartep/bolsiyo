import {authenticate} from '@loopback/authentication';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {Product} from '../models';
import {CategoryRepository, ProductRepository} from '../repositories';

@authenticate('jwt')
export class ProductController {
  constructor(
    @repository(ProductRepository)
    public productRepository: ProductRepository,
    @repository(CategoryRepository)
    public categoryRepository: CategoryRepository,
  ) {}

  @post('/products')
  @response(200, {
    description: 'Product model instance',
    content: {'application/json': {schema: getModelSchemaRef(Product)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Product, {
            title: 'NewProduct',
            exclude: ['id'],
          }),
        },
      },
    })
    product: Omit<Product, 'id'>,
  ): Promise<Product> {
    // check if category exists
    return this.categoryRepository.findById(product.categoryId).then(() => {
      return this.productRepository.create(product);
    });
  }

  @get('/products/count')
  @response(200, {
    description: 'Product model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Product) where?: Where<Product>): Promise<Count> {
    // Filter out soft deleted entries
    return this.productRepository.count({
      ...where,
      deleted: false,
    });
  }

  @get('/products')
  @response(200, {
    description: 'Array of Product model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Product, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Product) filter?: Filter<Product>,
  ): Promise<Product[]> {
    filter = filter || {};
    filter.where = filter.where || {};
    filter.where = {
      ...filter.where,
      deleted: false,
    };
    filter.include = filter.include || [];
    filter.include = [...filter.include, 'productLogs'];

    return this.productRepository.find(filter);
  }

  @patch('/products')
  @response(200, {
    description: 'Product PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Product, {partial: true}),
        },
      },
    })
    product: Product,
    @param.where(Product) where?: Where<Product>,
  ): Promise<Count> {
    return this.productRepository.updateAll(product, where);
  }

  @get('/products/{id}')
  @response(200, {
    description: 'Product model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Product, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Product, {exclude: 'where'})
    filter?: FilterExcludingWhere<Product>,
  ): Promise<Product | null> {
    const where = {
      deleted: false,
      id,
    };
    return this.productRepository.findOne({
      ...filter,
      where,
      include: ['productLogs'],
    });
  }

  @patch('/products/{id}')
  @response(204, {
    description: 'Product PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Product, {partial: true}),
        },
      },
    })
    product: Product,
  ): Promise<void> {
    await this.productRepository.updateById(id, product);
  }

  @put('/products/{id}')
  @response(204, {
    description: 'Product PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() product: Product,
  ): Promise<void> {
    await this.productRepository.replaceById(id, product);
  }

  @del('/products/{id}')
  @response(204, {
    description: 'Product DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.productRepository.updateById(id, {
      deleted: true,
      deletedAt: new Date().toDateString(),
    });
  }
}
