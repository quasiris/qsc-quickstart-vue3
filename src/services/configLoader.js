const CONFIG_FILENAME = 'config.json'

export function getApiBase () {
  return process.env.VUE_APP_QSC_API_BASE || 'https://qsc.quasiris.de'
}

export function getAssetCode (searchCode) {
  return `${searchCode}-quickstart`
}

export function getRemoteConfigUrl (tenant, searchCode) {
  const base = getApiBase()
  return `${base}/cdn/qsc/${encodeURIComponent(tenant)}/${encodeURIComponent(getAssetCode(searchCode))}/${CONFIG_FILENAME}`
}

export function normalizeRemoteConfig (raw, { tenant, searchCode }) {
  const config = { ...raw }
  const document = { ...(config.document || {}) }

  if (config.template && !document.template) {
    document.template = config.template
  }

  delete config.template
  config.document = document
  config.tenant = tenant
  config.searchCode = searchCode
  config.isRemote = true
  config.id = `${tenant}:${searchCode}`

  return config
}

export async function fetchRemoteConfig (tenant, searchCode) {
  const url = getRemoteConfigUrl(tenant, searchCode)
  const response = await fetch(url, { cache: 'no-store' })

  if (!response.ok) {
    const error = new Error(`Config not found (${response.status})`)
    error.status = response.status
    throw error
  }

  const raw = await response.json()
  return normalizeRemoteConfig(raw, { tenant, searchCode })
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
  if (config?.isRemote && (config.tenant || route?.params?.tenant) && (config.searchCode || route?.params?.code)) {
    const tenant = config.tenant || route.params.tenant
    const code = config.searchCode || route.params.code
    return `/d/${tenant}/${code}`
  }

  if (!config?.id || config.id === '1') {
    return '/'
  }

  return `/${config.id}`
}

export function isRemoteRoute (route) {
  return Boolean(route?.params?.tenant && route?.params?.code)
}
