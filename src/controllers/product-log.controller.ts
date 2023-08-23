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
  get,
  getModelSchemaRef,
  param,
  post,
  requestBody,
  response,
} from '@loopback/rest';
import {ProductLog} from '../models';
import {ProductLogRepository, ProductRepository} from '../repositories';

@authenticate('jwt')
export class ProductLogController {
  constructor(
    @repository(ProductLogRepository)
    public productLogRepository: ProductLogRepository,
    @repository(ProductRepository)
    public productRepository: ProductRepository,
  ) {}

  @post('/product-logs')
  @response(200, {
    description: 'ProductLog model instance',
    content: {'application/json': {schema: getModelSchemaRef(ProductLog)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ProductLog, {
            title: 'NewProductLog',
            exclude: ['id'],
          }),
        },
      },
    })
    productLog: Omit<ProductLog, 'id'>,
  ): Promise<ProductLog> {
    // check if product exists
    return this.productRepository.findById(productLog.productId).then(() => {
      this.productRepository.updateById(productLog.productId, {
        chargedAt: new Date().toDateString(),
      });
      return this.productLogRepository.create(productLog);
    });
  }

  @get('/product-logs/count')
  @response(200, {
    description: 'ProductLog model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(ProductLog) where?: Where<ProductLog>,
  ): Promise<Count> {
    return this.productLogRepository.count(where);
  }

  @get('/product-logs')
  @response(200, {
    description: 'Array of ProductLog model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(ProductLog, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(ProductLog) filter?: Filter<ProductLog>,
  ): Promise<ProductLog[]> {
    return this.productLogRepository.find(filter);
  }

  @get('/product-logs/{id}')
  @response(200, {
    description: 'ProductLog model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(ProductLog, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(ProductLog, {exclude: 'where'})
    filter?: FilterExcludingWhere<ProductLog>,
  ): Promise<ProductLog> {
    return this.productLogRepository.findById(id, filter);
  }
}
