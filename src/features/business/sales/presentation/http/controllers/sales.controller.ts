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
import { CreateSaleDto } from '../../../application/dto/create-sale.dto';
import { CreateSale } from '../../../application/use-cases/create-sale.use-case';
import { GetSaleById } from '../../../application/use-cases/get-sale-by-id.use-case';

@ApiTags('sales')
@Controller('sales')
export class SalesController {
  constructor(
    private readonly createSale: CreateSale,
    private readonly getSaleById: GetSaleById,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear una venta' })
  @ApiCreatedResponse({ description: 'Venta creada' })
  @ApiResponse({ status: 400, description: 'La venta no puede estar vacía' })
  @ApiResponse({ status: 404, description: 'Cliente o producto no encontrado' })
  @ApiResponse({ status: 409, description: 'Stock insuficiente' })
  create(@Body() dto: CreateSaleDto) {
    return this.createSale.execute(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una venta por id' })
  @ApiResponse({ status: 200, description: 'Venta encontrada' })
  @ApiResponse({ status: 404, description: 'Venta no encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.getSaleById.execute(id);
  }
}
