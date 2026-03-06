const YAHOO_EXCHANGE_SUFFIXES: Record<string, string> = {
  TYO: ".T",
  STO: ".ST",
  SWX: ".SW",
  CPH: ".CO",
  LON: ".L",
  EPA: ".PA",
}

export function normalizeTickerForYahoo(rawTicker: string): string {
  const trimmed = rawTicker.trim()
  if (!trimmed) return ""

  const [exchangePart, symbolPart] = trimmed.includes(":")
    ? trimmed.split(":", 2)
    : ["", trimmed]

  const exchange = exchangePart.trim().toUpperCase()
  const symbol = symbolPart.trim().toUpperCase()
  if (!symbol) return ""

  const suffix = YAHOO_EXCHANGE_SUFFIXES[exchange]
  if (suffix) {
    return `${symbol}${suffix}`
  }

  return symbol
}
