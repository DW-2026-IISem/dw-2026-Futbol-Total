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
import { CreateClientDto } from '../../../application/dto/create-client.dto';
import { CreateClient } from '../../../application/use-cases/create-client.use-case';
import { GetClientById } from '../../../application/use-cases/get-client-by-id.use-case';
import { ListClients } from '../../../application/use-cases/list-clients.use-case';

@ApiTags('clients')
@Controller('clients')
export class ClientsController {
  constructor(
    private readonly createClient: CreateClient,
    private readonly listClients: ListClients,
    private readonly getClientById: GetClientById,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar clientes' })
  @ApiResponse({ status: 200, description: 'Clientes encontrados' })
  async findAll() {
    const items = await this.listClients.execute();
    return { items, meta: { total: items.length } };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un cliente por id' })
  @ApiResponse({ status: 200, description: 'Cliente encontrado' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.getClientById.execute(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un cliente' })
  @ApiCreatedResponse({ description: 'Cliente creado' })
  @ApiResponse({ status: 409, description: 'Email duplicado' })
  create(@Body() dto: CreateClientDto) {
    return this.createClient.execute(dto);
  }
}
