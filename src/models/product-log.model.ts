import {Entity, model, property} from '@loopback/repository';

export const PRODUCT_LOG_TYPES = {
  ADD: 'ADD',
  REMOVE: 'REMOVE',
};

@model()
export class ProductLog extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'number',
    required: true,
  })
  amount: number;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      enum: [PRODUCT_LOG_TYPES.ADD, PRODUCT_LOG_TYPES.REMOVE],
    },
  })
  type: string;

  @property({
    type: 'date',
    default: () => new Date(),
  })
  createdAt?: string;

  @property({
    type: 'number',
    required: true,
  })
  productId: number;
  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<ProductLog>) {
    super(data);
  }
}

export interface ProductLogRelations {
  // describe navigational properties here
}

export type ProductLogWithRelations = ProductLog & ProductLogRelations;
