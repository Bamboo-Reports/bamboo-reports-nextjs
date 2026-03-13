type MapViewMode = "state" | "city"

const DEFAULT_STYLE_IDS: Record<MapViewMode, string> = {
  state: "019ce66f-f725-7e90-8ee4-73d922c757ae",
  city: "019ce66d-62cb-7eea-86d1-74e365735ec1",
}

function normalizeEnvValue(value: string | undefined): string | null {
  if (typeof value !== "string") return null
  const normalized = value.trim()
  return normalized || null
}

function extractStyleId(value: string | null): string | null {
  if (!value) return null

  // Accept direct style IDs or MapTiler map URLs and normalize to a style ID.
  const matches = value.match(/\/maps\/([^/?#]+)/i)
  if (matches?.[1]) return matches[1]

  return value
}

function getStyleIdForMode(mode: MapViewMode): string {
  const modeStyleId =
    mode === "state"
      ? normalizeEnvValue(process.env.NEXT_PUBLIC_MAPTILER_STATE_STYLE_ID)
      : normalizeEnvValue(process.env.NEXT_PUBLIC_MAPTILER_CITY_STYLE_ID)
  const legacyStyleId = normalizeEnvValue(process.env.NEXT_PUBLIC_MAPTILER_STYLE_ID)

  return (
    extractStyleId(modeStyleId) ??
    extractStyleId(legacyStyleId) ??
    DEFAULT_STYLE_IDS[mode]
  )
}

export function getMaptilerStyleUrl(mode: MapViewMode, apiKey: string): string {
  const styleId = getStyleIdForMode(mode)
  return `https://api.maptiler.com/maps/${styleId}/style.json?key=${apiKey}`
}

export function getMaptilerCountriesTilesUrl(apiKey: string): string {
  return `https://api.maptiler.com/tiles/countries/tiles.json?key=${apiKey}`
}

