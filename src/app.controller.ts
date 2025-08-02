import { Controller, Get } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { getSystemInfoJson } from './utils/system-info';

@ApiExcludeController()
@Controller()
export class AppController {
  constructor() {}

  @Get()
  getHello() {
    return {
      success: true,
      message: 'Server is operational',
      meta: getSystemInfoJson(),
    };
  }
}
