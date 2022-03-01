import { Module } from '@nestjs/common'
import { BlockchainEmulatorModule } from '@ismedia/backend/feature-blockchain-emulator'

@Module({
  imports: [BlockchainEmulatorModule],
})
export class BlockchainEmulatorAppModule {}
