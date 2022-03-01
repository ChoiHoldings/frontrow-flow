import axios, { AxiosInstance } from 'axios'

export class EmulatorResetService {
  private resetApi: AxiosInstance

  constructor(emulatorReset: string) {
    this.resetApi = axios.create({
      baseURL: emulatorReset,
      timeout: 6000, // ms
    })
  }

  async resetEmulator() {
    const response = this.resetApi.get('/rs?t[]=emulator', { timeout: 10000 })
    return response
  }
}
