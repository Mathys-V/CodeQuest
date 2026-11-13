import { Controller, GET } from '@nestjs/common';

@Controller()
export class AppController {
  @GET('health')
  getHealth() {
    return {
      status: 'ok',
      service: 'CodeQuest API',
      timestamp: new Date().toISOString(),
    };
  }
}
