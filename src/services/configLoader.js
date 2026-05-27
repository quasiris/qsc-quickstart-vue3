const CONFIG_FILENAME = 'config.json'

const ENV_API_BASES = {
  prod: 'https://qsc.quasiris.de',
  dev: 'https://qsc-dev.quasiris.de',
}

export function getApiBaseForEnv (env) {
  const base = ENV_API_BASES[env]
  if (!base) {
    throw new Error(`Unknown environment: ${env}`)
  }
  return base
}

export function getAssetCode (searchCode) {
  return `${searchCode}-quickstart`
}

export function getRemoteConfigUrl (tenant, searchCode, env) {
  const base = getApiBaseForEnv(env)
  return `${base}/cdn/qsc/${encodeURIComponent(tenant)}/${encodeURIComponent(getAssetCode(searchCode))}/${CONFIG_FILENAME}`
}

export function normalizeRemoteConfig (raw, { tenant, searchCode, env }) {
  const config = { ...raw }
  const document = { ...(config.document || {}) }

  if (config.template && !document.template) {
    document.template = config.template
  }

  delete config.template
  config.document = document
  config.tenant = tenant
  config.searchCode = searchCode
  config.env = env
  config.isRemote = true
  config.id = `${tenant}:${searchCode}`

  return config
}

export async function fetchRemoteConfig (tenant, searchCode, env) {
  const url = getRemoteConfigUrl(tenant, searchCode, env)
  const response = await fetch(url, { cache: 'no-store' })

  if (!response.ok) {
    const error = new Error(`Config not found (${response.status})`)
    error.status = response.status
    throw error
  }

  const raw = await response.json()
  return normalizeRemoteConfig(raw, { tenant, searchCode, env })
}

export function resolveLocalConfig (pathname, configs) {
  const path = pathname || '/'
  let matched = configs[0]

  for (const configItem of configs) {
    if (path.includes(`/${configItem.id}`) || path.endsWith(`/${configItem.id}`)) {
      matched = configItem
      break
    }
  }

  return { ...matched, isRemote: false }
}

export function getBasePath (config, route) {
  if (config?.isRemote && (config.env || route?.params?.e) && (config.tenant || route?.params?.tenant) && (config.searchCode || route?.params?.code)) {
    const env = config.env || route.params.e
    const tenant = config.tenant || route.params.tenant
    const code = config.searchCode || route.params.code
    return `/d/${env}/${tenant}/${code}`
  }

  if (!config?.id || config.id === '1') {
    return '/'
  }

  return `/${config.id}`
}

export function isRemoteRoute (route) {
  return Boolean(route?.params?.e && route?.params?.tenant && route?.params?.code)
}
