"use client"

import React, { useMemo, useState, useEffect } from "react"
import { Map as MapGL, Source, Layer, NavigationControl, FullscreenControl } from "react-map-gl/mapbox"
import type { Center } from "@/lib/types"
import "mapbox-gl/dist/mapbox-gl.css"

interface CentersChoroplethMapProps {
  centers: Center[]
  allCenters?: Center[]
  heightClass?: string
}

interface Admin1Properties {
  name?: string
  name_en?: string
  admin?: string
  iso_3166_2?: string
  stateName?: string
  countryName?: string
  stateKey?: string
  count?: number
  accountsCount?: number
  headcount?: number
  [key: string]: unknown
}

interface Admin1Feature {
  type: "Feature"
  properties: Admin1Properties
  geometry: {
    type: "Polygon" | "MultiPolygon"
    coordinates: any
  }
}

interface Admin1FeatureCollection {
  type: "FeatureCollection"
  features: Admin1Feature[]
}

const COLOR_SCALE = [
  "#FFF2BB",
  "#FFEEA2",
  "#FFE573",
  "#FFE056",
  "#FFDB39",
  "#F7CA02",
  "#FFB649",
  "#FFA92A",
  "#F59302",
  "#FF8000",
]

const COUNTRY_ALIASES: Record<string, string> = {
  "usa": "united states of america",
  "us": "united states of america",
  "u s a": "united states of america",
  "united states": "united states of america",
  "uk": "united kingdom",
  "u k": "united kingdom",
  "uae": "united arab emirates",
  "russia": "russian federation",
  "czech republic": "czechia",
  "south korea": "republic of korea",
  "north korea": "democratic people's republic of korea",
  "viet nam": "vietnam",
}

const normalizeValue = (value?: string | null) => {
  if (!value) return ""
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

const normalizeCountry = (value?: string | null) => {
  const normalized = normalizeValue(value)
  return COUNTRY_ALIASES[normalized] ?? normalized
}

const normalizeState = (value?: string | null) => {
  return normalizeValue(value)
    .replace(/\s+state$/g, "")
    .replace(/\s+province$/g, "")
    .trim()
}

const makeKey = (country: string, state: string) => `${country}|${state}`

const buildStateAggregates = (centers: Center[]) => {
  const countsByState = new Map<string, number>()
  const accountsByState = new Map<string, Set<string>>()
  const headcountByState = new Map<string, number>()

  centers.forEach((center) => {
    const state = normalizeState(center.center_state)
    const country = normalizeCountry(center.center_country)
    if (!state || !country) return
    const key = makeKey(country, state)
    countsByState.set(key, (countsByState.get(key) || 0) + 1)

    const accountName = center.account_global_legal_name
    if (accountName) {
      const accounts = accountsByState.get(key) ?? new Set<string>()
      accounts.add(accountName)
      accountsByState.set(key, accounts)
    }

    const employees = center.center_employees ?? 0
    headcountByState.set(key, (headcountByState.get(key) || 0) + employees)
  })

  return { countsByState, accountsByState, headcountByState }
}

const buildColorScale = (values: number[], maxOverride?: number) => {
  const computedMax = values.length > 0 ? Math.max(...values) : 0
  const computedMin = values.length > 0 ? Math.min(...values) : 0
  const maxValue = Math.max(maxOverride ?? 0, computedMax)
  const minValue = computedMin > 0 ? computedMin : 1

  if (maxValue <= 0) {
    return {
      expression: ["step", ["get", "count"], COLOR_SCALE[0], 1, COLOR_SCALE[1]] as any,
      legend: [
        { label: "0", color: COLOR_SCALE[0] },
        { label: "1+", color: COLOR_SCALE[1] },
      ],
    }
  }

  if (minValue >= maxValue) {
    const color = COLOR_SCALE[COLOR_SCALE.length - 1]
    return {
      expression: ["case", [">", ["get", "count"], 0], color, COLOR_SCALE[0]] as any,
      legend: [
        { label: minValue.toLocaleString(), color },
      ],
    }
  }

  const thresholds: number[] = []
  const steps = COLOR_SCALE.length
  const range = maxValue - minValue
  for (let i = 1; i < steps; i += 1) {
    const value = minValue + (range * i) / steps
    thresholds.push(Math.max(minValue, Math.ceil(value)))
  }

  const uniqueThresholds: number[] = []
  for (const value of thresholds) {
    if (uniqueThresholds.length === 0 || value > uniqueThresholds[uniqueThresholds.length - 1]) {
      uniqueThresholds.push(value)
    }
  }

  const bucketCount = uniqueThresholds.length + 1
  const maxColorIndex = COLOR_SCALE.length - 1
  const colors = Array.from({ length: bucketCount }, (_, index) => {
    if (bucketCount === 1) return COLOR_SCALE[maxColorIndex]
    const step = maxColorIndex / (bucketCount - 1)
    return COLOR_SCALE[Math.round(index * step)]
  })
  const expression: any[] = ["step", ["get", "count"], colors[0]]
  uniqueThresholds.forEach((threshold, index) => {
    expression.push(threshold, colors[index + 1])
  })

  const legend: Array<{ label: string; color: string }> = []
  const formatRange = (min: number, max: number | null) => {
    if (max === null) return `${min}+`
    if (min === max) return `${min}`
    return `${min}-${max}`
  }

  if (uniqueThresholds.length > 0) {
    const firstMax = uniqueThresholds[0] - 1
    if (firstMax >= minValue) {
      legend.push({
        label: formatRange(minValue, firstMax),
        color: colors[0],
      })
    }

    uniqueThresholds.forEach((threshold, index) => {
      const nextThreshold = uniqueThresholds[index + 1]
      const max = nextThreshold ? Math.max(threshold, nextThreshold - 1) : null
      legend.push({
        label: formatRange(threshold, max),
        color: colors[index + 1],
      })
    })
  }

  return { expression, legend }
}

export function CentersChoroplethMap({
  centers,
  allCenters,
  heightClass = "h-[750px]",
}: CentersChoroplethMapProps) {
  const [geojson, setGeojson] = useState<Admin1FeatureCollection | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [isMapReady, setIsMapReady] = useState(false)
  const [hoverInfo, setHoverInfo] = useState<{
    x: number
    y: number
    state: string
    country: string
    count: number
    accountsCount: number
    headcount: number
  } | null>(null)
  const mapRef = React.useRef<any>(null)
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    const fallback = setTimeout(() => setIsMapReady(true), 700)
    return () => clearTimeout(fallback)
  }, [])

  useEffect(() => {
    if (!isClient || typeof ResizeObserver === "undefined") return
    const container = containerRef.current
    if (!container) return

    const resizeMap = () => {
      if (mapRef.current?.resize) {
        mapRef.current.resize()
      }
    }

    const observer = new ResizeObserver(resizeMap)
    observer.observe(container)

    requestAnimationFrame(resizeMap)

    return () => observer.disconnect()
  }, [isClient])

  useEffect(() => {
    let isMounted = true
    fetch("/data/admin-1.geojson")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load admin-1 boundaries")
        }
        return res.json()
      })
      .then((data: Admin1FeatureCollection) => {
        if (!isMounted) return
        setGeojson(data)
      })
      .catch((err) => {
        console.error("[CentersChoroplethMap] Boundary load error:", err)
        if (!isMounted) return
        setError(err instanceof Error ? err.message : "Failed to load boundaries")
      })

    return () => {
      isMounted = false
    }
  }, [])

  const stateAggregates = useMemo(() => buildStateAggregates(centers), [centers])
  const scaleAggregates = useMemo(() => {
    const centersForScale = allCenters && allCenters.length > 0 ? allCenters : centers
    return buildStateAggregates(centersForScale)
  }, [allCenters, centers])

  const allowedCountries = useMemo(() => {
    const set = new Set<string>()
    centers.forEach((center) => {
      const country = normalizeCountry(center.center_country)
      if (country) {
        set.add(country)
      }
    })
    return set
  }, [centers])

  const countValues = useMemo(
    () => Array.from(scaleAggregates.countsByState.values()).filter((value) => value > 0),
    [scaleAggregates]
  )
  const { expression: fillColorExpression, legend } = useMemo(
    () => buildColorScale(countValues),
    [countValues]
  )

  const geojsonWithCounts = useMemo<Admin1FeatureCollection | null>(() => {
    if (!geojson) return null
    return {
      ...geojson,
      features: geojson.features
        .filter((feature) => {
          if (allowedCountries.size === 0) return true
          const countryName = (feature.properties?.admin || "").toString()
          const normalizedCountryName = normalizeCountry(countryName)
          if (!allowedCountries.has(normalizedCountryName)) return false
          const stateName = (feature.properties?.name_en || feature.properties?.name || "").toString()
          const stateKey = makeKey(normalizedCountryName, normalizeState(stateName))
          return (stateAggregates.countsByState.get(stateKey) || 0) > 0
        })
        .map((feature) => {
        const properties = feature.properties || {}
        const stateName = (properties.name_en || properties.name || "").toString()
        const countryName = (properties.admin || "").toString()
        const normalizedCountryName = normalizeCountry(countryName)
        const stateKey = makeKey(normalizedCountryName, normalizeState(stateName))
        const count = stateAggregates.countsByState.get(stateKey) || 0
        const accountsCount = stateAggregates.accountsByState.get(stateKey)?.size || 0
        const headcount = stateAggregates.headcountByState.get(stateKey) || 0
        return {
          ...feature,
          properties: {
            ...properties,
            stateName,
            countryName,
            stateKey,
            count,
            accountsCount,
            headcount,
          },
        }
      }),
    }
  }, [geojson, stateAggregates, allowedCountries])

  const bounds = useMemo(() => {
    const coords = centers
      .map((center) => ({ lat: center.lat, lng: center.lng }))
      .filter((c) => typeof c.lat === "number" && typeof c.lng === "number") as Array<{
      lat: number
      lng: number
    }>

    if (coords.length === 0) return null

    let minLat = coords[0].lat
    let maxLat = coords[0].lat
    let minLng = coords[0].lng
    let maxLng = coords[0].lng

    coords.forEach((coord) => {
      minLat = Math.min(minLat, coord.lat)
      maxLat = Math.max(maxLat, coord.lat)
      minLng = Math.min(minLng, coord.lng)
      maxLng = Math.max(maxLng, coord.lng)
    })

    return {
      minLat,
      maxLat,
      minLng,
      maxLng,
    }
  }, [centers])

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

  const handleRecenter = () => {
    const mapInstance = mapRef.current?.getMap?.() ?? mapRef.current
    if (!mapInstance) return

    if (bounds) {
      mapInstance.fitBounds(
        [
          [bounds.minLng, bounds.minLat],
          [bounds.maxLng, bounds.maxLat],
        ],
        { padding: 60, duration: 800 }
      )
      return
    }

    mapInstance.flyTo({
      center: [0, 15],
      zoom: 1.6,
      duration: 800,
    })
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center ${heightClass} bg-muted rounded-lg`}>
        <div className="text-center">
          <p className="text-lg font-semibold text-red-500 mb-2">Error Loading Map</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <p className="text-xs text-muted-foreground mt-2">Check browser console for details</p>
        </div>
      </div>
    )
  }

  if (!isClient) {
    return (
      <div className={`flex items-center justify-center ${heightClass} bg-muted rounded-lg`}>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    )
  }

  if (!mapboxToken) {
    console.error("[CentersChoroplethMap] Mapbox token is missing")
    return (
      <div className={`flex items-center justify-center ${heightClass} bg-muted rounded-lg`}>
        <div className="text-center">
          <p className="text-lg font-semibold text-muted-foreground mb-2">
            Mapbox Access Token Missing
          </p>
          <p className="text-sm text-muted-foreground">
            Please set NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN in your environment variables
          </p>
        </div>
      </div>
    )
  }

  if (!geojsonWithCounts) {
    return (
      <div className={`flex items-center justify-center ${heightClass} bg-muted rounded-lg`}>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Loading boundaries...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${heightClass} rounded-lg overflow-hidden outline-none`}
    >
      {!isMapReady && (
        <div className="absolute inset-0 bg-muted/70 animate-pulse pointer-events-none" />
      )}
      <MapGL
        ref={mapRef}
        style={{ width: "100%", height: "100%", opacity: isMapReady ? 1 : 0, transition: "opacity 150ms ease-out" }}
        initialViewState={{
          latitude: 15,
          longitude: 0,
          zoom: 1.6,
        }}
        mapStyle="mapbox://styles/abhishekfx/cltyaz9ek00nx01p783ygdi9z"
        mapboxAccessToken={mapboxToken}
        projection="mercator"
        onLoad={(e) => {
          setTimeout(() => {
            e.target.resize()
            if (bounds) {
              e.target.fitBounds(
                [
                  [bounds.minLng, bounds.minLat],
                  [bounds.maxLng, bounds.maxLat],
                ],
                { padding: 60, duration: 0 }
              )
            }
            setIsMapReady(true)
          }, 200)
        }}
        interactiveLayerIds={["admin1-fill"]}
        onMouseMove={(e) => {
          const feature = e.features?.[0] as Admin1Feature | undefined
          if (!feature) {
            setHoverInfo(null)
            return
          }
          const props = feature.properties || {}
          setHoverInfo({
            x: e.point.x,
            y: e.point.y,
            state: (props.stateName || props.name || "").toString(),
            country: (props.countryName || props.admin || "").toString(),
            count: Number(props.count) || 0,
            accountsCount: Number(props.accountsCount) || 0,
            headcount: Number(props.headcount) || 0,
          })
        }}
        onMouseLeave={() => setHoverInfo(null)}
        onError={(e) => {
          console.error("[CentersChoroplethMap] Map error:", e)
          setError(`Map error: ${e.error?.message || "Unknown error"}`)
        }}
      >
        <NavigationControl position="top-left" showCompass={true} showZoom={true} />
        <FullscreenControl position="top-left" />

        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={handleRecenter}
            className="bg-background hover:bg-muted border rounded-lg shadow-lg px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2"
            title="Recenter map"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Recenter
          </button>
        </div>

        <Source id="admin1" type="geojson" data={geojsonWithCounts}>
          <Layer
            id="admin1-fill"
            type="fill"
            paint={{
              "fill-color": fillColorExpression,
              "fill-opacity": 0.75,
            }}
          />
          <Layer
            id="admin1-outline"
            type="line"
            paint={{
              "line-color": "#ffffff",
              "line-width": 0.7,
              "line-opacity": 0.8,
            }}
          />
        </Source>

        {hoverInfo && (
          <div
            className="absolute z-50 pointer-events-none"
            style={{
              left: `${hoverInfo.x + 15}px`,
              top: `${hoverInfo.y + 15}px`,
            }}
          >
            <div className="bg-background border-2 border-orange-500/20 rounded-xl shadow-2xl min-w-[280px] overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3">
                <h3 className="font-bold text-white text-base leading-tight">
                  {hoverInfo.state || "Unknown State"}
                </h3>
                <p className="text-orange-100 text-xs mt-0.5">
                  {hoverInfo.country || "Unknown Country"}
                </p>
              </div>

              <div className="px-4 py-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-muted-foreground font-medium">Accounts</span>
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    {hoverInfo.accountsCount.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <span className="text-sm text-muted-foreground font-medium">Centers</span>
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    {hoverInfo.count.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1.5 border-t">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm text-muted-foreground font-medium">Headcount</span>
                  </div>
                  <span className="text-sm font-bold text-green-600">
                    {hoverInfo.headcount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {legend.length > 0 && (
          <div className="absolute bottom-4 left-4 z-10 rounded-lg border bg-background/95 p-3 shadow-sm">
            <div className="text-xs font-semibold text-muted-foreground mb-2">Centers per State</div>
            <div className="space-y-1">
              {legend.map((entry) => (
                <div key={`${entry.label}-${entry.color}`} className="flex items-center gap-2 text-xs">
                  <span className="h-3 w-3 rounded-sm border" style={{ backgroundColor: entry.color }} />
                  <span className="text-muted-foreground">{entry.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </MapGL>
    </div>
  )
}
