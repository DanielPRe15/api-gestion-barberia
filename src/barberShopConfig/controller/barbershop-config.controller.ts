import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { BarbershopConfigService } from '../services/barbershop-config.service';
import { BarbershopConfig } from '../entity/barbershop-config.entity';
import { CreateConfigBarberDto } from '../dto/create-configBarber.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';

@UseGuards(AuthGuard)
@Controller('barbershop-config')
export class BarbershopConfigController {
  constructor(private readonly configService: BarbershopConfigService) {}

  @Get()
  async getConfig(): Promise<BarbershopConfig | null> {
    return this.configService.getConfig();
  }

  @Post()
  async createOrUpdateConfig(@Body() data: CreateConfigBarberDto): Promise<BarbershopConfig> {
    return this.configService.createOrUpdateConfig(data);
  }
}
