import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BarbershopConfig } from '../entity/barbershop-config.entity';
import { CreateConfigBarberDto } from '../dto/create-configBarber.dto';

@Injectable()
export class BarbershopConfigService {
  constructor(
    @InjectRepository(BarbershopConfig)
    private readonly configRepository: Repository<BarbershopConfig>,
  ) {}

  async getConfig(): Promise<BarbershopConfig | null> {
    return this.configRepository.findOneBy({});
  }

  async createOrUpdateConfig(configData: CreateConfigBarberDto): Promise<BarbershopConfig> {

    const isCreate = !(await this.configRepository.findOneBy({}));
    if (isCreate) {
      if (
        !configData.name ||
        !configData.address ||
        !configData.openHour ||
        !configData.closeHour ||
        !configData.workDays ||
        !Array.isArray(configData.workDays) ||
        configData.workDays.length === 0
      ) {
        throw new BadRequestException('Todos los campos son obligatorios para crear la configuración por primera vez.');
      }
    }
    
    let config = await this.configRepository.findOneBy({});
    if (config) {
      Object.assign(config, configData);
    } else {
      config = this.configRepository.create(configData);
    }
    return this.configRepository.save(config);
  }


}
