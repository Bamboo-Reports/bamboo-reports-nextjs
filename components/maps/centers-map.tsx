"use client"

import React, { useMemo, useState } from "react"
import { Map, Source, Layer } from "react-map-gl/mapbox"
import type { Center } from "@/lib/types"
import "mapbox-gl/dist/mapbox-gl.css"

interface CentersMapProps {
  centers: Center[]
}

interface CityCluster {
  city: string
  lat: number
  lng: number
  count: number
}

export function CentersMap({ centers }: CentersMapProps) {
  const [hoveredCity, setHoveredCity] = useState<string | null>(null)

  // Aggregate centers by city and calculate cluster data
  const cityData = useMemo(() => {
    const cityMap = new Map<string, CityCluster>()

    centers.forEach((center) => {
      const city = center["CENTER CITY"]
      const lat = center.LAT ? parseFloat(center.LAT) : null
      const lng = center.LANG ? parseFloat(center.LANG) : null

      // Skip if no coordinates
      if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
        return
      }

      if (cityMap.has(city)) {
        const existing = cityMap.get(city)!
        cityMap.set(city, {
          ...existing,
          count: existing.count + 1,
        })
      } else {
        cityMap.set(city, {
          city,
          lat,
          lng,
          count: 1,
        })
      }
    })

    return Array.from(cityMap.values())
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
  const geojsonData = useMemo(() => {
    return {
      type: "FeatureCollection" as const,
      features: cityData.map((city) => ({
        type: "Feature" as const,
        properties: {
          city: city.city,
          count: city.count,
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

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

  if (!mapboxToken) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-muted rounded-lg">
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
    return (
      <div className="flex items-center justify-center h-[600px] bg-muted rounded-lg">
        <div className="text-center">
          <p className="text-lg font-semibold text-muted-foreground mb-2">No Location Data</p>
          <p className="text-sm text-muted-foreground">
            Centers don't have latitude and longitude information
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden border">
      <Map
        initialViewState={initialViewState}
        mapStyle="mapbox://styles/abhishekfx/cltyaz9ek00nx01p783ygdi9z"
        mapboxAccessToken={mapboxToken}
        interactiveLayerIds={["centers-circles"]}
        onMouseMove={(e) => {
          const features = e.features
          if (features && features.length > 0) {
            const city = features[0].properties?.city
            setHoveredCity(city)
          } else {
            setHoveredCity(null)
          }
        }}
        onMouseLeave={() => setHoveredCity(null)}
      >
        <Source id="centers" type="geojson" data={geojsonData}>
          {/* Circle layer */}
          <Layer
            id="centers-circles"
            type="circle"
            paint={{
              "circle-radius": [
                "interpolate",
                ["linear"],
                ["get", "count"],
                1,
                10,
                maxCount,
                50,
              ],
              "circle-color": [
                "interpolate",
                ["linear"],
                ["get", "count"],
                1,
                "#60a5fa",
                maxCount / 2,
                "#3b82f6",
                maxCount,
                "#2563eb",
              ],
              "circle-opacity": 0.7,
              "circle-stroke-width": 2,
              "circle-stroke-color": "#ffffff",
            }}
          />
        </Source>

        {/* Tooltip */}
        {hoveredCity && (
          <div
            className="absolute top-4 left-4 bg-background border rounded-lg shadow-lg px-4 py-3 z-10"
            style={{ pointerEvents: "none" }}
          >
            <div className="space-y-1">
              <p className="font-semibold text-sm">{hoveredCity}</p>
              <p className="text-sm text-muted-foreground">
                {cityData.find((c) => c.city === hoveredCity)?.count || 0} center
                {(cityData.find((c) => c.city === hoveredCity)?.count || 0) !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        )}
      </Map>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-background border rounded-lg shadow-lg px-4 py-3 z-10">
        <p className="text-sm font-semibold mb-2">Number of Centers</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full opacity-70" style={{ backgroundColor: "#60a5fa" }} />
            <span className="text-xs text-muted-foreground">Low (1-{Math.floor(maxCount / 3)})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full opacity-70" style={{ backgroundColor: "#3b82f6" }} />
            <span className="text-xs text-muted-foreground">
              Medium ({Math.floor(maxCount / 3) + 1}-{Math.floor((maxCount * 2) / 3)})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full opacity-70" style={{ backgroundColor: "#2563eb" }} />
            <span className="text-xs text-muted-foreground">
              High ({Math.floor((maxCount * 2) / 3) + 1}+)
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
