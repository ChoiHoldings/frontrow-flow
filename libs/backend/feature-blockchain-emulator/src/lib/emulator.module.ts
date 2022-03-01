import { Module } from '@nestjs/common'
import { EmulatorResetService } from './emulator-reset.service'
import { EmulatorController } from './emulator.controller'
import { EmulatorService } from './emulator.service'

@Module({
  providers: [
    EmulatorResetService,
    {
      provide: EmulatorService,
      useFactory: async () => {
        const emulatorService = new EmulatorService()
        await emulatorService.init()
        return emulatorService
      },
    },
  ],
  controllers: [EmulatorController],
})
export class BlockchainEmulatorModule {}
