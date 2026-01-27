"use client"

import React, { useMemo, useState, useEffect } from "react"
import { Map as MapGL, Source, Layer, NavigationControl, FullscreenControl } from "@vis.gl/react-maplibre"
import type { Center } from "@/lib/types"
import "maplibre-gl/dist/maplibre-gl.css"

interface CentersChoroplethMapProps {
  centers: Center[]
  allCenters?: Center[]
  heightClass?: string
}

interface Admin1Properties {
  name?: string
  level_0?: string
  level?: number
  [key: string]: unknown
}

interface Admin1Feature {
  type?: "Feature"
  properties?: Admin1Properties
  geometry?: {
    type: "Polygon" | "MultiPolygon"
    coordinates: any
  }
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

const normalizeIso2 = (value?: string | null) => (value || "").trim().toUpperCase()
const normalizeStateKey = (value?: string | null) => (value || "").trim().toLowerCase()
const makeKey = (countryIso2: string, stateKey: string) => `${countryIso2}|${stateKey}`

const buildStateAggregates = (centers: Center[]) => {
  const countsByState = new Map<string, number>()
  const accountsByState = new Map<string, Set<string>>()
  const headcountByState = new Map<string, number>()
  const countryNamesByIso = new Map<string, string>()

  centers.forEach((center) => {
    const state = normalizeStateKey(center.center_state)
    const countryIso2 = normalizeIso2(center.center_country_iso2)
    if (!state || !countryIso2) return
    const key = makeKey(countryIso2, state)
    countsByState.set(key, (countsByState.get(key) || 0) + 1)

    const accountName = center.account_global_legal_name
    if (accountName) {
      const accounts = accountsByState.get(key) ?? new Set<string>()
      accounts.add(accountName)
      accountsByState.set(key, accounts)
    }

    const employees = center.center_employees ?? 0
    headcountByState.set(key, (headcountByState.get(key) || 0) + employees)

    if (center.center_country) {
      countryNamesByIso.set(countryIso2, center.center_country)
    }
  })

  return { countsByState, accountsByState, headcountByState, countryNamesByIso }
}

const buildColorScale = (values: number[], countExpression: any) => {
  const computedMax = values.length > 0 ? Math.max(...values) : 0
  const computedMin = values.length > 0 ? Math.min(...values) : 0
  const maxValue = Math.max(0, computedMax)
  const minValue = computedMin > 0 ? computedMin : 1

  if (maxValue <= 0) {
    return {
      expression: ["step", countExpression, COLOR_SCALE[0], 1, COLOR_SCALE[1]] as any,
      legend: [
        { label: "0", color: COLOR_SCALE[0] },
        { label: "1+", color: COLOR_SCALE[1] },
      ],
    }
  }

  if (minValue >= maxValue) {
    const color = COLOR_SCALE[COLOR_SCALE.length - 1]
    return {
      expression: ["case", [">", countExpression, 0], color, COLOR_SCALE[0]] as any,
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
  const expression: any[] = ["step", countExpression, colors[0]]
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

  const stateAggregates = useMemo(() => buildStateAggregates(centers), [centers])
  const scaleAggregates = useMemo(() => {
    const centersForScale = allCenters && allCenters.length > 0 ? allCenters : centers
    return buildStateAggregates(centersForScale)
  }, [allCenters, centers])

  const countValues = useMemo(
    () => Array.from(scaleAggregates.countsByState.values()).filter((value) => value > 0),
    [scaleAggregates]
  )

  const featureKeyExpression = useMemo(
    () => (["concat", ["get", "level_0"], "|", ["downcase", ["coalesce", ["get", "name"], ""]]] as any),
    []
  )

  const stateKeysWithCounts = useMemo(() => {
    const keys: string[] = []
    stateAggregates.countsByState.forEach((value, key) => {
      if (value > 0) keys.push(key)
    })
    return keys
  }, [stateAggregates])

  const countExpression = useMemo(() => {
    if (stateKeysWithCounts.length === 0) return ["literal", 0] as any
    const expression: any[] = ["match", featureKeyExpression]
    stateAggregates.countsByState.forEach((value, key) => {
      if (value > 0) {
        expression.push(key, value)
      }
    })
    expression.push(0)
    return expression
  }, [featureKeyExpression, stateAggregates, stateKeysWithCounts])

  const { expression: fillColorExpression, legend } = useMemo(
    () => buildColorScale(countValues, countExpression),
    [countValues, countExpression]
  )

  const layerFilter = useMemo(() => {
    if (stateKeysWithCounts.length === 0) {
      return ["==", 0, 1] as any
    }
    return ["all", ["==", ["get", "level"], 1], ["in", featureKeyExpression, ["literal", stateKeysWithCounts]]] as any
  }, [featureKeyExpression, stateKeysWithCounts])

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

  const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY
  const maptilerStyleId = process.env.NEXT_PUBLIC_MAPTILER_STYLE_ID || "streets"
  const mapStyle = maptilerKey
    ? `https://api.maptiler.com/maps/${maptilerStyleId}/style.json?key=${maptilerKey}`
    : ""
  const countriesTileUrl = maptilerKey
    ? `https://api.maptiler.com/tiles/countries/tiles.json?key=${maptilerKey}`
    : ""

  const handleRecenter = () => {
    const mapInstance = mapRef.current?.getMap?.() ?? mapRef.current
    if (!mapInstance) return

    mapInstance.flyTo({
      center: [78.9629, 20.5937],
      zoom: 3.5,
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

  if (!maptilerKey) {
    console.error("[CentersChoroplethMap] MapTiler key is missing")
    return (
      <div className={`flex items-center justify-center ${heightClass} bg-muted rounded-lg`}>
        <div className="text-center">
          <p className="text-lg font-semibold text-muted-foreground mb-2">
            MapTiler API Key Missing
          </p>
          <p className="text-sm text-muted-foreground">
            Please set NEXT_PUBLIC_MAPTILER_KEY in your environment variables
          </p>
        </div>
      </div>
    )
  }

  if (stateKeysWithCounts.length === 0) {
    return (
      <div className={`flex items-center justify-center ${heightClass} bg-muted rounded-lg`}>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">No state boundaries to display.</p>
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
        mapStyle={mapStyle}
        projection="mercator"
        onLoad={(e) => {
          setTimeout(() => {
            e.target.resize()
            handleRecenter()
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
          const stateName = (props.name || "").toString()
          const iso2 = (props.level_0 || "").toString()
          const key = makeKey(iso2, normalizeStateKey(stateName))
          const count = stateAggregates.countsByState.get(key) || 0
          const accountsCount = stateAggregates.accountsByState.get(key)?.size || 0
          const headcount = stateAggregates.headcountByState.get(key) || 0
          const countryName = stateAggregates.countryNamesByIso.get(iso2) || iso2
          setHoverInfo({
            x: e.point.x,
            y: e.point.y,
            state: stateName || "Unknown State",
            country: countryName || "Unknown Country",
            count,
            accountsCount,
            headcount,
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
            className="bg-background hover:bg-muted border rounded-md shadow-lg px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2"
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

        <Source id="admin1" type="vector" url={countriesTileUrl}>
          <Layer
            id="admin1-fill"
            type="fill"
            source-layer="administrative"
            filter={layerFilter}
            paint={{
              "fill-color": fillColorExpression,
              "fill-opacity": 0.75,
            }}
          />
          <Layer
            id="admin1-outline"
            type="line"
            source-layer="administrative"
            filter={layerFilter}
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
