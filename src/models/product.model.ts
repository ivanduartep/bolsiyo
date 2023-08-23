import {
  Entity,
  belongsTo,
  hasMany,
  model,
  property,
} from '@loopback/repository';
import {Category, CategoryWithRelations} from './category.model';
import {PRODUCT_LOG_TYPES, ProductLog} from './product-log.model';

@model()
export class Product extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'number',
    required: true,
  })
  buyPrice: number;

  @property({
    type: 'number',
    required: true,
  })
  sellPrice: number;

  @property({
    type: 'date',
    default: () => new Date(),
  })
  createdAt: string;

  @property({
    type: 'date',
  })
  deletedAt?: string;

  @property({
    type: 'date',
    default: () => new Date(),
  })
  chargedAt: string;

  @property({
    type: 'boolean',
    default: false,
  })
  deleted?: boolean;

  @belongsTo(() => Category)
  categoryId: number;

  @hasMany(() => ProductLog)
  productLogs: ProductLog[];

  @property({
    type: 'number',
  })
  get stock(): number {
    let currentAmount = 0;

    if (this.productLogs) {
      this.productLogs.forEach(({amount, type}: ProductLog) => {
        if (type === PRODUCT_LOG_TYPES.ADD) {
          currentAmount += amount;
        } else if (type === PRODUCT_LOG_TYPES.REMOVE) {
          currentAmount -= amount;
        }
      });
    }
    return currentAmount;
  }

  [prop: string]: any;

  constructor(data?: Partial<Product>) {
    if (data) {
      delete (data as any).stock;
    }
    super(data);
  }
}

export interface ProductRelations {
  category?: CategoryWithRelations;
}

export type ProductWithRelations = Product & ProductRelations;
