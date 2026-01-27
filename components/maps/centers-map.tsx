"use client"

import React, { useMemo, useState, useEffect, useCallback, useLayoutEffect } from "react"
import { Map as MapGL, Source, Layer, NavigationControl, FullscreenControl } from "@vis.gl/react-maplibre"
import type { Center } from "@/lib/types"
import "maplibre-gl/dist/maplibre-gl.css"

interface CentersMapProps {
  centers: Center[]
  heightClass?: string
}

interface CityCluster {
  city: string
  country: string
  lat: number
  lng: number
  count: number
  accounts: Set<string>
  headcount: number
}

interface CityFeatureProperties {
  city: string
  country: string
  count: number
  accountsCount: number
  headcount: number
  radius: number
  label: string
  labelSize: number
  showLabel: boolean
}

interface CityFeature {
  type: "Feature"
  properties: CityFeatureProperties
  geometry: {
    type: "Point"
    coordinates: [number, number]
  }
}

interface CityFeatureCollection {
  type: "FeatureCollection"
  features: CityFeature[]
}

const HALO_RADIUS_SCALE = 1.5
const OVERLAP_PADDING = 0.5

export function CentersMap({ centers, heightClass = "h-[750px]" }: CentersMapProps) {
  const [hoveredCity, setHoveredCity] = useState<string | null>(null)
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [isMapReady, setIsMapReady] = useState(false)
  const [visibleGeojsonData, setVisibleGeojsonData] = useState<CityFeatureCollection | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null)
  const mapRef = React.useRef<any>(null)
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const tooltipRef = React.useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setIsClient(true)
    console.log("[CentersMap] Component mounted")
    console.log("[CentersMap] Centers count:", centers?.length)
    console.log("[CentersMap] MapTiler key exists:", !!process.env.NEXT_PUBLIC_MAPTILER_KEY)
  }, [centers])

  useLayoutEffect(() => {
    if (!mousePosition || !containerRef.current || !tooltipRef.current) return
    const containerRect = containerRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    const margin = 8
    const offset = 15

    let x = mousePosition.x + offset
    let y = mousePosition.y + offset

    if (x + tooltipRect.width + margin > containerRect.width) {
      x = mousePosition.x - tooltipRect.width - offset
    }
    if (x < margin) {
      x = margin
    }

    if (y + tooltipRect.height + margin > containerRect.height) {
      y = mousePosition.y - tooltipRect.height - offset
    }
    if (y < margin) {
      y = margin
    }

    setTooltipPosition({ x, y })
  }, [mousePosition, hoveredCity])

  // Fallback to ensure the map shows even if onLoad is delayed
  useEffect(() => {
    const fallback = setTimeout(() => setIsMapReady(true), 700)
    return () => clearTimeout(fallback)
  }, [])

  // Force map to recalc size when container changes to avoid clipped bottom
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

    // Initial pass after layout
    requestAnimationFrame(resizeMap)

    return () => observer.disconnect()
  }, [isClient])

  // Aggregate centers by city and calculate cluster data
  const cityData = useMemo(() => {
    try {
      console.log("[CentersMap] Calculating city data...")
      const cityMap = new Map<string, CityCluster>()

      centers.forEach((center) => {
        const city = center.center_city
        const country = center.center_country
        const account = center.account_global_legal_name
        const employees = center.center_employees ?? 0
        const lat = center.lat
        const lng = center.lng

        // Skip if no coordinates
        if (lat === null || lat === undefined || lng === null || lng === undefined || isNaN(lat) || isNaN(lng)) {
          return
        }

        if (cityMap.has(city)) {
          const existing = cityMap.get(city)!
          existing.accounts.add(account)
          cityMap.set(city, {
            ...existing,
            count: existing.count + 1,
            headcount: existing.headcount + employees,
          })
        } else {
          const accounts = new Set<string>()
          accounts.add(account)
          cityMap.set(city, {
            city,
            country,
            lat,
            lng,
            count: 1,
            accounts,
            headcount: employees,
          })
        }
      })

      const result = Array.from(cityMap.values())
      console.log("[CentersMap] City data calculated:", result.length, "cities")
      return result
    } catch (err) {
      console.error("[CentersMap] Error calculating city data:", err)
      setError(err instanceof Error ? err.message : "Error calculating city data")
      return []
    }
  }, [centers])

  // Calculate center of all points for initial view
  const initialViewState = useMemo(() => {
    if (cityData.length === 0) {
      return {
        latitude: 20.5937,
        longitude: 78.9629,
        zoom: 4,
      }
    }

    const avgLat = cityData.reduce((sum, city) => sum + city.lat, 0) / cityData.length
    const avgLng = cityData.reduce((sum, city) => sum + city.lng, 0) / cityData.length

    // Dynamically adjust zoom based on number of centers
    let zoom = 4
    if (cityData.length === 1) {
      zoom = 8
    } else if (cityData.length <= 3) {
      zoom = 6
    } else if (cityData.length <= 10) {
      zoom = 5
    }

    return {
      latitude: avgLat,
      longitude: avgLng,
      zoom,
    }
  }, [cityData])

  const getCoreRadiusForCount = useCallback((count: number) => {
    const minCount = 1
    const maxCount = Math.max(...cityData.map(c => c.count), 1)
    const minRadius = 4
    const maxRadius = 20

    if (maxCount === minCount) return minRadius

    const logCount = Math.log10(count)
    const logMin = Math.log10(minCount)
    const logMax = Math.log10(maxCount)

    const normalized = (logCount - logMin) / (logMax - logMin)
    return minRadius + normalized * (maxRadius - minRadius)
  }, [cityData])

  const getLabelConfig = useCallback((count: number, radius: number) => {
    const label = count.toString()
    const minFontSize = 8
    const maxFontSize = 12
    const targetFontSize = Math.min(maxFontSize, Math.max(minFontSize, radius * 1.1))
    const approxCharWidth = 0.6
    const padding = 2
    const maxTextWidth = radius * 2 - padding * 2
    const textWidth = label.length * targetFontSize * approxCharWidth
    const showLabel = textWidth <= maxTextWidth && targetFontSize <= radius * 2 - padding

    return {
      label,
      labelSize: targetFontSize,
      showLabel,
    }
  }, [])

  // Convert city data to GeoJSON
  // Sort by count descending so larger circles render first (at bottom)
  const geojsonData = useMemo<CityFeatureCollection>(() => {
    const sortedCities = [...cityData].sort((a, b) => b.count - a.count)
    return {
      type: "FeatureCollection" as const,
      features: sortedCities.map((city) => {
        const radius = getCoreRadiusForCount(city.count)
        return {
          type: "Feature" as const,
          properties: {
            city: city.city,
            country: city.country,
            count: city.count,
            accountsCount: city.accounts.size,
            headcount: city.headcount,
            radius,
            ...getLabelConfig(city.count, radius),
          },
          geometry: {
            type: "Point" as const,
            coordinates: [city.lng, city.lat] as [number, number],
          },
        }
      }),
    }
  }, [cityData, getCoreRadiusForCount, getLabelConfig])

  const updateVisibleGeojsonData = useCallback(() => {
    const mapInstance = mapRef.current?.getMap?.() ?? mapRef.current
    if (!mapInstance?.project || geojsonData.features.length === 0) {
      setVisibleGeojsonData(geojsonData)
      return
    }

    const keptFeatures: CityFeature[] = []
    const keptCenters: Array<{ x: number; y: number; radius: number }> = []

    for (const feature of geojsonData.features) {
      const [lng, lat] = feature.geometry.coordinates
      const projected = mapInstance.project([lng, lat])
      const coreRadius = getCoreRadiusForCount(feature.properties.count)
      const haloRadius = coreRadius * HALO_RADIUS_SCALE + OVERLAP_PADDING

      let overlaps = false
      for (const kept of keptCenters) {
        const dx = projected.x - kept.x
        const dy = projected.y - kept.y
        const minDistance = haloRadius + kept.radius
        if (dx * dx + dy * dy < minDistance * minDistance) {
          overlaps = true
          break
        }
      }

      if (!overlaps) {
        keptFeatures.push(feature)
        keptCenters.push({ x: projected.x, y: projected.y, radius: haloRadius })
      }
    }

    setVisibleGeojsonData({
      type: "FeatureCollection",
      features: keptFeatures,
    })
  }, [geojsonData, getCoreRadiusForCount])

  useEffect(() => {
    if (!isMapReady) return
    updateVisibleGeojsonData()
  }, [isMapReady, updateVisibleGeojsonData])

  const coreRadiusExpression = useMemo(() => ["get", "radius"] as any, [])
  const haloRadiusExpression = useMemo(
    () => ["*", coreRadiusExpression, HALO_RADIUS_SCALE] as any,
    [coreRadiusExpression]
  )

  const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY
  const maptilerStyleId = process.env.NEXT_PUBLIC_MAPTILER_STYLE_ID || "streets"
  const mapStyle = maptilerKey
    ? `https://api.maptiler.com/maps/${maptilerStyleId}/style.json?key=${maptilerKey}`
    : ""

  // Handler to recenter the map to India
  const handleRecenter = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [78.9629, 20.5937], // Center of India
        zoom: 3.5,
        duration: 1000,
      })
    }
  }

  // Show error if any
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

  // Wait for client-side rendering
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
    console.error("[CentersMap] MapTiler key is missing")
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

  if (cityData.length === 0) {
    console.warn("[CentersMap] No city data with coordinates")
    return (
      <div className={`flex items-center justify-center ${heightClass} bg-muted rounded-lg`}>
        <div className="text-center">
          <p className="text-lg font-semibold text-muted-foreground mb-2">No Location Data</p>
          <p className="text-sm text-muted-foreground">
            Centers do not have latitude and longitude information
          </p>
        </div>
      </div>
    )
  }

  console.log("[CentersMap] Rendering map with", cityData.length, "cities")

  try {
    return (
      <div
        ref={containerRef}
        className={`relative w-full ${heightClass} rounded-lg overflow-hidden outline-none bg-muted`}
      >
        <MapGL
        ref={mapRef}
        style={{ width: "100%", height: "100%" }}
        initialViewState={initialViewState}
        mapStyle={mapStyle}
        projection="mercator"
        onLoad={() => {
          // Force a resize calculation after map loads to ensure it fills container
          setTimeout(() => {
            const mapInstance = mapRef.current?.getMap?.() ?? mapRef.current
            if (mapInstance?.resize) {
              mapInstance.resize()
            }
            handleRecenter()
            setIsMapReady(true)
          }, 200)
        }}
        onMove={updateVisibleGeojsonData}
        interactiveLayerIds={["centers-circles"]}
        onMouseMove={(e) => {
          const features = e.features
          if (features && features.length > 0) {
            const city = features[0].properties?.city
            setHoveredCity(city)
            setMousePosition({ x: e.point.x, y: e.point.y })
          } else {
            setHoveredCity(null)
            setMousePosition(null)
          }
        }}
        onMouseLeave={() => {
          setHoveredCity(null)
          setMousePosition(null)
        }}
        onError={(e) => {
          console.error("[CentersMap] Map error:", e)
          setError(`Map error: ${e.error?.message || "Unknown error"}`)
        }}
      >
        {/* Navigation Controls - Zoom and Rotation */}
        <NavigationControl position="top-left" showCompass={true} showZoom={true} />

        {/* Fullscreen Control */}
        <FullscreenControl position="top-left" />

        {/* Recenter Button */}
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

        <Source id="centers" type="geojson" data={visibleGeojsonData ?? geojsonData}>
          {/* Outer halo layer - crisp, flat, and rendered below core for clean overlap */}
          <Layer
            id="centers-halo"
            type="circle"
            paint={{
              "circle-radius": haloRadiusExpression,
              "circle-color": "#ffbf57",
              "circle-opacity": 0.25,
              "circle-blur": 0,
            }}
          />
          
          {/* Inner core layer - crisp, fully opaque anchor */}
          <Layer
            id="centers-circles"
            type="circle"
            paint={{
              "circle-radius": coreRadiusExpression,
              "circle-color": "#ff6800",
              "circle-opacity": 1,
              "circle-blur": 0,
            }}
          />

          <Layer
            id="centers-labels"
            type="symbol"
            filter={["==", ["get", "showLabel"], true]}
            layout={{
              "text-field": ["get", "label"],
              "text-size": ["get", "labelSize"],
              "text-font": ["Google Sans Bold", "Arial Unicode MS Bold"],
              "text-allow-overlap": true,
              "text-ignore-placement": true,
            }}
            paint={{
              "text-color": "#ffffff",
            }}
          />
        </Source>

        {/* Enhanced Tooltip */}
        {hoveredCity && mousePosition && (() => {
          const cityInfo = cityData.find((c) => c.city === hoveredCity)
          if (!cityInfo) return null

          return (
            <div
              className="absolute z-50 pointer-events-none"
              ref={tooltipRef}
              style={{
                left: `${(tooltipPosition?.x ?? mousePosition.x + 15)}px`,
                top: `${(tooltipPosition?.y ?? mousePosition.y + 15)}px`,
                fontFamily:
                  "'Google Sans', 'Poppins', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              }}
            >
              <div className="bg-background border-2 border-orange-500/20 rounded-xl shadow-2xl min-w-[280px] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3">
                  <h3 className="font-bold text-white text-base leading-tight">
                    {cityInfo.city}
                  </h3>
                  <p className="text-orange-100 text-xs mt-0.5">
                    {cityInfo.country}
                  </p>
                </div>

                {/* Content */}
                <div className="px-4 py-3 space-y-2.5">
                  {/* Accounts Count */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-sm text-muted-foreground font-medium">Accounts</span>
                    </div>
                    <span className="text-sm font-bold text-foreground">
                      {cityInfo.accounts.size.toLocaleString()}
                    </span>
                  </div>

                  {/* Centers Count */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      <span className="text-sm text-muted-foreground font-medium">Centers</span>
                    </div>
                    <span className="text-sm font-bold text-foreground">
                      {cityInfo.count.toLocaleString()}
                    </span>
                  </div>

                  {/* Headcount */}
                  <div className="flex items-center justify-between pt-1.5 border-t">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-sm text-muted-foreground font-medium">Headcount</span>
                    </div>
                    <span className="text-sm font-bold text-green-600">
                      {cityInfo.headcount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })()}
      </MapGL>
    </div>
    )
  } catch (err) {
    console.error("[CentersMap] Render error:", err)
    return (
      <div className={`flex items-center justify-center ${heightClass} bg-muted rounded-lg`}>
        <div className="text-center">
          <p className="text-lg font-semibold text-red-500 mb-2">Map Rendering Error</p>
          <p className="text-sm text-muted-foreground">
            {err instanceof Error ? err.message : "Unknown error occurred"}
          </p>
          <p className="text-xs text-muted-foreground mt-2">Check browser console for details</p>
        </div>
      </div>
    )
  }
}
