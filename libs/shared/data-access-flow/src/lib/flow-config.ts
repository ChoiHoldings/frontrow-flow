import { AnyJson, IJsonObject } from '@ismedia/shared/util-core'

export const flowConfigGet = (flowConfig: AnyJson, path: string): string | undefined => {
  return configGet(flowConfig, path, '') || undefined
}

/**
 * Get value from provided scope and path.
 * @param scope - scope value.
 * @param {string} path - path of value in flow.json
 * @param fallback - fallback value.
 */
export const configGet = (scope: AnyJson, path: string, fallback: string): string => {
  const pathArr = path.split('/')
  let obj = scope
  for (const pathKey of pathArr) {
    if (typeof obj !== 'object') {
      break
    }
    obj = (obj as IJsonObject)[pathKey]
  }
  if (!obj || typeof obj !== 'string') {
    console.warn(`Config "${path}" not found, fallback="${fallback}"`)
    return fallback
  }
  return obj
}
