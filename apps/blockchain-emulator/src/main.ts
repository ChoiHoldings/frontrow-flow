import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { blockchainEmulatorConfig } from '@ismedia/backend/util-app-config'
import { BlockchainEmulatorAppModule } from './app/app.module'

async function bootstrap() {
  const app = await NestFactory.create(BlockchainEmulatorAppModule, {
    logger: [
      // 'log',
      'error',
      'warn',
      // Activate this level see debug messages
      'debug',
    ],
  })
  const port = blockchainEmulatorConfig.get('port')

  const options = new DocumentBuilder()
    .setTitle('Blockchain Emulator Test Helper')
    .setDescription(
      'Responsible for running and resetting the blockchain emulator. Used by E2E tests to ensure ' +
        'that each test starts off with a new clean state and there is no interdependency ' +
        'between the tests.',
    )
    .setVersion('1.0')
    .build()
  const document = SwaggerModule.createDocument(app, options)
  SwaggerModule.setup('docs', app, document)

  await app.listen(port, () => {
    Logger.log(`Listening on http://localhost:${port}`)
  })
}

bootstrap()
