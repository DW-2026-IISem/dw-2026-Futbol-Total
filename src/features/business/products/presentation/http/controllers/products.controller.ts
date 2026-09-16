import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateProductDto } from '../../../application/dto/create-product.dto';
import { CreateProduct } from '../../../application/use-cases/create-product.use-case';
import { GetProductById } from '../../../application/use-cases/get-product-by-id.use-case';
import { ListProducts } from '../../../application/use-cases/list-products.use-case';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly createProduct: CreateProduct,
    private readonly listProducts: ListProducts,
    private readonly getProductById: GetProductById,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar productos' })
  @ApiResponse({ status: 200, description: 'Productos encontrados' })
  async findAll() {
    const items = await this.listProducts.execute();
    return { items, meta: { total: items.length } };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un producto por id' })
  @ApiResponse({ status: 200, description: 'Producto encontrado' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.getProductById.execute(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un producto' })
  @ApiCreatedResponse({ description: 'Producto creado' })
  @ApiResponse({ status: 404, description: 'Tipo de producto inexistente' })
  @ApiResponse({ status: 409, description: 'Tipo de producto inactivo' })
  create(@Body() dto: CreateProductDto) {
    return this.createProduct.execute(dto);
  }
}
