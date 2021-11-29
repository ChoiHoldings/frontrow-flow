import { ChildProcess, spawn } from 'child_process'

const DEFAULT_HTTP_PORT = 8080
const DEFAULT_GRPC_PORT = 3569

export type EmulatorLogFilter = (message: string) => string | undefined

type LogType = 'info' | 'warn' | 'error' | 'log'

interface EmulatorOptions {
  logFilter?: EmulatorLogFilter
}

/** Class representing emulator */
export class Emulator {
  logFilter?: EmulatorLogFilter
  startFailed: boolean
  process?: ChildProcess

  /**
   * Create an emulator.
   */
  constructor(options?: EmulatorOptions) {
    const resolvedOptions = options ?? {}
    this.logFilter = resolvedOptions.logFilter
    this.startFailed = false
  }

  /**
   * Set logging flag.
   * @param {boolean} logging - whether logs shall be printed
   */
  setLogFilter(logFilter: EmulatorLogFilter) {
    this.logFilter = logFilter
  }

  /**
   * Log message with a specific type.
   * @param {*} message - message to put into log output
   * @param {"log"|"error"} type - type of the message to output
   */
  log(message: string, bypassFilter = false, type: LogType = 'log') {
    if (bypassFilter || !this.logFilter) {
      console[type](message)
    } else {
      const filtered = this.logFilter(message)
      if (filtered !== undefined) {
        console[type](filtered)
      }
    }
  }

  /**
   * Start emulator.
   * @param {number} port - port to use for accessApi
   */
  start = async (port = DEFAULT_HTTP_PORT): Promise<boolean> => {
    const offset = port - DEFAULT_HTTP_PORT
    const grpc = DEFAULT_GRPC_PORT + offset

    this.process = spawn('flow', [
      'emulator',
      '-v',
      '--grpc-debug',
      '--http-port',
      port.toString(),
      '--port',
      grpc.toString(),
    ])
    if (!this.process || !this.process.stdin || !this.process.stdout) {
      throw new Error('Emulator failed to start')
    }

    return new Promise((resolve, reject) => {
      this.process?.stdout?.on('data', (data) => {
        if (data.includes('Starting HTTP server')) {
          this.log('EMULATOR IS UP! Listening for events!', true)
          resolve(true)
        } else {
          this.log(data.toString())
        }
      })

      this.process?.stderr?.on('data', (data) => {
        this.log(`ERROR: ${data}`, true, 'error')
        this.startFailed = true
        this.process?.kill()
      })

      this.process?.on('close', (code) => {
        if (this.startFailed) {
          this.log(`emulator closed with code ${code}`, true)
          this.process = undefined
          reject()
        }
      })
    })
  }

  waitForClose = (): Promise<void> => {
    return new Promise((resolve) => {
      this.process?.on('close', (_code) => {
        console.log('CLOSED', _code)
        resolve()
      })
    })
  }

  stop = (): Promise<string> => {
    return new Promise((resolve, _reject) => {
      if (this.process) {
        this.process.on('exit', (code) => {
          this.process = undefined
          resolve(`Emulator stopped with code ${code}`)
        })
        this.process.kill('SIGKILL')
      }
    })
  }
}

export default new Emulator()
