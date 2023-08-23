import {authenticate} from '@loopback/authentication';
import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param, response} from '@loopback/rest';
import {Product} from '../models';
import {ProductRepository} from '../repositories';
import {convertDateStringToMySQLDateTime} from '../utils/utils';

@authenticate('jwt')
export class ReportController {
  constructor(
    @repository(ProductRepository)
    protected productRepository: ProductRepository,
  ) {}

  @get('/report')
  @response(200, {
    description: 'Report of products',
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
    @param.query.string('from') from?: string,
    @param.query.string('to') to?: string,
  ): Promise<any> {
    let fromToExpression = ``;

    if (from && to) {
      fromToExpression = `AND p.chargedAt BETWEEN '${convertDateStringToMySQLDateTime(
        from,
      )}' AND '${convertDateStringToMySQLDateTime(to)}'`;
    } else if (from) {
      fromToExpression = `AND p.chargedAt >= '${convertDateStringToMySQLDateTime(
        from,
      ).toString()}'`;
    } else if (to) {
      fromToExpression = `AND p.chargedAt <= '${convertDateStringToMySQLDateTime(
        to,
      )}'`;
    }

    return this.productRepository.execute(
      `
        SELECT
          p.id AS productId,
          p.name AS productName,
          c.id AS categoryId,
          c.name AS categoryName,
          IFNULL(pIn.amount, 0) - IFNULL(pOut.amount, 0) AS stock
        FROM
          Product p
        INNER JOIN
          Category c
        ON p.categoryId = c.id
        LEFT JOIN(
          SELECT
            productId,
            SUM(amount) as amount
          FROM
            ProductLog
          WHERE
            type = "ADD"
          GROUP BY productId
        ) pIn ON p.id = pIn.productId
        LEFT JOIN(
          SELECT
            productId,
            SUM(amount) as amount
              FROM
                ProductLog
              WHERE
                type = "DELETE"
              GROUP BY productId
        ) pOut ON p.id = pOut.productId
        WHERE
          p.deleted = false
          ${fromToExpression}
      `,
    );
  }
}
