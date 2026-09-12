import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { CreateClientDto } from '../../../application/dto/create-client.dto.js';
import { CreateClientUseCase } from '../../../application/use-cases/create-client.use-case.js';

@Controller('api/clients')
export class ClientsController {
  constructor(private readonly createClientUseCase: CreateClientUseCase) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateClientDto) {
    return this.createClientUseCase.execute(dto);
  }
}