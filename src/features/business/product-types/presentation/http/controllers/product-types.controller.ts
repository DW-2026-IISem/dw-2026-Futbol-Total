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
import { CreateProductTypeDto } from '../../../application/dto/create-product-type.dto';
import { CreateProductType } from '../../../application/use-cases/create-product-type.use-case';
import { GetProductTypeById } from '../../../application/use-cases/get-product-type-by-id.use-case';
import { ListProductTypes } from '../../../application/use-cases/list-product-types.use-case';

@ApiTags('product-types')
@Controller('product-types')
export class ProductTypesController {
  constructor(
    private readonly createProductType: CreateProductType,
    private readonly listProductTypes: ListProductTypes,
    private readonly getProductTypeById: GetProductTypeById,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar tipos de producto' })
  @ApiResponse({ status: 200, description: 'Tipos de producto encontrados' })
  async findAll() {
    const items = await this.listProductTypes.execute();
    return { items, meta: { total: items.length } };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un tipo de producto por id' })
  @ApiResponse({ status: 200, description: 'Tipo de producto encontrado' })
  @ApiResponse({ status: 404, description: 'Tipo de producto no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.getProductTypeById.execute(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un tipo de producto' })
  @ApiCreatedResponse({ description: 'Tipo de producto creado' })
  @ApiResponse({ status: 409, description: 'Nombre duplicado' })
  create(@Body() dto: CreateProductTypeDto) {
    return this.createProductType.execute(dto);
  }
}