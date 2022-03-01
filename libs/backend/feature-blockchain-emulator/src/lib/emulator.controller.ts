import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger'
import { Logger, Controller, Get, Query } from '@nestjs/common'
import { ResetTargets } from './reset-targets'
import { EmulatorService } from './emulator.service'

@ApiTags('Emulator reset controller')
@Controller()
export class EmulatorController {
  constructor(private readonly emulatorService: EmulatorService) {}

  @ApiOperation({ summary: 'Reset emulator' })
  @ApiResponse({ status: 200, description: 'The emulator has been successfully reset' })
  @ApiQuery({ name: 't', enum: ResetTargets, isArray: true })
  @Get('/rs')
  async resetEmulator(@Query('t') targets: ResetTargets) {
    if (targets?.includes(ResetTargets.Emulator)) {
      Logger.debug('Resetting emulator...')
      await this.emulatorService.resetEmulator()
      Logger.debug('Finished resetting emulator')
    }
  }
}
