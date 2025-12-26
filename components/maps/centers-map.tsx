"use client"

import React, { useMemo, useState, useEffect } from "react"
import { Map as MapGL, Source, Layer, NavigationControl, FullscreenControl } from "react-map-gl/mapbox"
import type { Center } from "@/lib/types"
import "mapbox-gl/dist/mapbox-gl.css"

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

export function CentersMap({ centers, heightClass = "h-[750px]" }: CentersMapProps) {
  const [hoveredCity, setHoveredCity] = useState<string | null>(null)
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)
  const mapRef = React.useRef<any>(null)
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setIsClient(true)
    console.log("[CentersMap] Component mounted")
    console.log("[CentersMap] Centers count:", centers?.length)
    console.log("[CentersMap] Mapbox token exists:", !!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN)
  }, [centers])

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

    return {
      latitude: avgLat,
      longitude: avgLng,
      zoom: 4,
    }
  }, [cityData])

  // Convert city data to GeoJSON
  // Sort by count descending so larger circles render first (at bottom)
  const geojsonData = useMemo(() => {
    const sortedCities = [...cityData].sort((a, b) => b.count - a.count)
    return {
      type: "FeatureCollection" as const,
      features: sortedCities.map((city) => ({
        type: "Feature" as const,
        properties: {
          city: city.city,
          country: city.country,
          count: city.count,
          accountsCount: city.accounts.size,
          headcount: city.headcount,
        },
        geometry: {
          type: "Point" as const,
          coordinates: [city.lng, city.lat],
        },
      })),
    }
  }, [cityData])

  // Get max count for scaling circles
  const maxCount = useMemo(() => {
    return Math.max(...cityData.map((city) => city.count), 1)
  }, [cityData])
  // Ensure stops used in map styles are strictly increasing even for single-point datasets
  const effectiveMaxCount = useMemo(() => Math.max(maxCount, 2), [maxCount])
  const midCountStop = useMemo(() => (effectiveMaxCount > 2 ? effectiveMaxCount / 2 : 1.5), [effectiveMaxCount])

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

  // Handler to recenter the map to India
  const handleRecenter = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [78.9629, 20.5937], // Center of India
        zoom: 4.5,
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

  if (!mapboxToken) {
    console.error("[CentersMap] Mapbox token is missing")
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
        className={`relative w-full ${heightClass} rounded-lg overflow-hidden outline-none`}
      >
        <MapGL
        ref={mapRef}
        style={{ width: "100%", height: "100%" }}
        initialViewState={initialViewState}
        mapStyle="mapbox://styles/abhishekfx/cltyaz9ek00nx01p783ygdi9z"
        mapboxAccessToken={mapboxToken}
        projection="mercator"
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

        <Source id="centers" type="geojson" data={geojsonData}>
          {/* Outer halo layer - larger and more transparent (20% bigger) */}
          <Layer
            id="centers-halo"
            type="circle"
            paint={{
              "circle-radius": [
                "interpolate",
                ["linear"],
                ["get", "count"],
                1,
                7.2, // 20% bigger than inner (6 * 1.2)
                effectiveMaxCount,
                30, // 20% bigger than inner (25 * 1.2)
              ],
              "circle-color": [
                "interpolate",
                ["linear"],
                ["get", "count"],
                1,
                "#f97316", // Orange color matching your Tableau screenshot
                midCountStop,
                "#ea580c",
                effectiveMaxCount,
                "#c2410c",
              ],
              "circle-opacity": 0.15, // Very transparent halo
              "circle-blur": 0.5, // Soft edges
            }}
          />
          
          {/* Inner circle layer - smaller and more visible */}
          <Layer
            id="centers-circles"
            type="circle"
            paint={{
              "circle-radius": [
                "interpolate",
                ["linear"],
                ["get", "count"],
                1,
                6, // Smaller base size
                effectiveMaxCount,
                25, // Smaller max size
              ],
              "circle-color": [
                "interpolate",
                ["linear"],
                ["get", "count"],
                1,
                "#fb923c", // Lighter orange for small clusters
                midCountStop,
                "#f97316", // Medium orange
                effectiveMaxCount,
                "#ea580c", // Darker orange for large clusters
              ],
              "circle-opacity": 0.6, // Semi-transparent
              "circle-stroke-width": 1,
              "circle-stroke-color": "#ffffff",
              "circle-stroke-opacity": 0.5,
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
              style={{
                left: `${mousePosition.x + 15}px`,
                top: `${mousePosition.y + 15}px`,
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
