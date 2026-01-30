"use client"

import { useEffect, useState } from "react"
import { CloudSun, Loader2, MapPin, ThermometerSun, Wind, Droplets } from "lucide-react"
import { cn } from "@/lib/utils"

interface CityWeather {
    name: string
    lat: number
    lon: number
    temp?: number
    aqi?: number
    loading: boolean
    error: boolean
}

const CITIES = [
    { name: "Ranchi", lat: 23.3441, lon: 85.3096 },
    { name: "Patna", lat: 25.5941, lon: 85.1376 },
    { name: "Dhanbad", lat: 23.7957, lon: 86.4304 },
    { name: "Kolkata", lat: 22.5726, lon: 88.3639 },
]

export function MultiCityWeather() {
    const [citiesData, setCitiesData] = useState<CityWeather[]>(
        CITIES.map(c => ({ ...c, loading: true, error: false }))
    )

    useEffect(() => {
        const CACHE_KEY = "multi_city_weather_data"
        const CACHE_DURATION = 15 * 60 * 1000 // 15 minutes

        const fetchAllWeather = async () => {
            const updatedCities = await Promise.all(
                CITIES.map(async (city) => {
                    try {
                        const [weatherRes, aqiRes] = await Promise.all([
                            fetch(`https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m`),
                            fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${city.lat}&longitude=${city.lon}&current=us_aqi`)
                        ])

                        const weatherJson = await weatherRes.json()
                        const aqiJson = await aqiRes.json()

                        return {
                            ...city,
                            temp: Math.round(weatherJson.current.temperature_2m),
                            aqi: Math.round(aqiJson.current.us_aqi),
                            loading: false,
                            error: false
                        }
                    } catch (err) {
                        console.error(`Failed to fetch data for ${city.name}`, err)
                        return { ...city, loading: false, error: true }
                    }
                })
            )

            setCitiesData(updatedCities)

            // Cache data
            localStorage.setItem(CACHE_KEY, JSON.stringify({
                data: updatedCities,
                timestamp: Date.now()
            }))
        }

        // Check Cache
        const cached = localStorage.getItem(CACHE_KEY)
        if (cached) {
            try {
                const { data, timestamp } = JSON.parse(cached)
                if (Date.now() - timestamp < CACHE_DURATION) {
                    setCitiesData(data)
                    return
                }
            } catch (e) {
                // Ignore cache error
            }
        }

        fetchAllWeather()
    }, [])

    const getAqiColor = (aqi?: number) => {
        if (!aqi) return "text-muted-foreground"
        if (aqi <= 50) return "text-green-500"
        if (aqi <= 100) return "text-yellow-500"
        if (aqi <= 150) return "text-orange-500"
        if (aqi <= 200) return "text-red-500"
        return "text-purple-500"
    }

    return (
        <div className="w-full relative overflow-hidden rounded-xl bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white shadow-xl border border-white/10 group">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="relative p-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10">
                            <CloudSun className="h-5 w-5 text-sky-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm tracking-wide">WEATHER</h3>
                            <p className="text-[10px] text-white/50 font-medium">Live Updates</p>
                        </div>
                    </div>
                    {/* Pulsing indicator */}
                    <div className="flex items-center gap-1.5 bg-red-500/10 px-2 py-1 rounded-full border border-red-500/20">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider">Live</span>
                    </div>
                </div>

                <div className="space-y-3">
                    {citiesData.map((city) => (
                        <div key={city.name} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all duration-300">
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-white tracking-wide">
                                    {city.name}
                                </span>
                                <span className="text-[10px] text-white/50 hidden sm:block">
                                    {city.loading ? "Updating..." : "Now"}
                                </span>
                            </div>

                            {city.loading ? (
                                <Loader2 className="h-4 w-4 animate-spin text-white/30" />
                            ) : city.error ? (
                                <span className="text-[10px] text-red-400 bg-red-400/10 px-2 py-1 rounded">Unavailable</span>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-center gap-1">
                                            <ThermometerSun className="h-3 w-3 text-yellow-400" />
                                            <span className="text-sm font-bold">{city.temp}°</span>
                                        </div>
                                        <span className="text-[9px] text-white/40">Temp</span>
                                    </div>

                                    <div className="w-px h-6 bg-white/10" />

                                    <div className="flex flex-col items-end min-w-[32px]">
                                        <div className="flex items-center gap-1">
                                            <Wind className={cn("h-3 w-3", getAqiColor(city.aqi))} />
                                            <span className={cn("text-sm font-bold", getAqiColor(city.aqi))}>
                                                {city.aqi}
                                            </span>
                                        </div>
                                        <span className="text-[9px] text-white/40">AQI</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Info Bar */}
            <div className="bg-black/20 p-2 text-center border-t border-white/5">
                <p className="text-[9px] text-white/30">
                    Data source: Open-Meteo • Auto-updates every 15m
                </p>
            </div>
        </div>
    )
}
