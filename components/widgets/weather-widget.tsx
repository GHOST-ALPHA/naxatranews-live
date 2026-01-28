"use client"

import { useEffect, useState } from "react"
import { CloudSun, Droplets, MapPin, Loader2, ThermometerSun, Wind } from "lucide-react"
import { cn } from "@/lib/utils"

interface WeatherData {
    temperature: number
    aqi: number
    loading: boolean
    error: boolean
    locationName?: string
}

export function WeatherWidget() {
    const [data, setData] = useState<WeatherData>({
        temperature: 0,
        aqi: 0,
        loading: true,
        error: false,
        locationName: "Loading..."
    })

    useEffect(() => {
        // Default location (Ranchi, Jharkhand)
        const defaultLat = 23.3441;
        const defaultLon = 85.3096;
        const CACHE_KEY = "weather_widget_data";
        const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

        const fetchWeather = async (lat: number, lon: number, isDefault = false) => {
            try {
                // Fetch Weather, AQI, and Location Name
                // We use BigDataCloud's free client-side reverse geocoding API which is stable and requires no key
                const [weatherRes, aqiRes, locationRes] = await Promise.all([
                    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m`),
                    fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi`),
                    fetch(`https://api-bdc.io/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`)
                ]);

                const weatherJson = await weatherRes.json();
                const aqiJson = await aqiRes.json();
                const locationJson = await locationRes.json();

                // Logic to determine best available location name
                let locationName = "Local";
                if (isDefault) {
                    locationName = "Ranchi";
                } else if (locationJson.city) {
                    locationName = locationJson.city;
                } else if (locationJson.locality) {
                    locationName = locationJson.locality;
                } else if (locationJson.principalSubdivision) {
                    locationName = locationJson.principalSubdivision;
                }

                const newData = {
                    temperature: Math.round(weatherJson.current.temperature_2m),
                    aqi: Math.round(aqiJson.current.us_aqi),
                    loading: false,
                    error: false,
                    locationName: locationName
                };

                setData(newData);

                // Cache the data
                localStorage.setItem(CACHE_KEY, JSON.stringify({
                    data: newData,
                    timestamp: Date.now(),
                    coords: { lat, lon } // Store coords to invalidate if user moves significantly (optional, not implemented here for simplicity)
                }));

            } catch (err) {
                console.error("Weather data fetch failed", err);
                // Even if location fetch fails, show weather if possible, but simplest to error out or show partial
                setData(prev => ({ ...prev, loading: false, error: true }));
            }
        };

        // Check Cache First
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            try {
                const { data: cachedData, timestamp } = JSON.parse(cached);
                if (Date.now() - timestamp < CACHE_DURATION) {
                    setData(cachedData);
                    return; // Use cache, skip fetch
                }
            } catch (e) {
                // Ignore cache error
            }
        }

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    fetchWeather(position.coords.latitude, position.coords.longitude);
                },
                (error) => {
                    console.warn("Geolocation denied/error", error);
                    // Use default location logic
                    fetchWeather(defaultLat, defaultLon, true);
                }
            );
        } else {
            fetchWeather(defaultLat, defaultLon, true);
        }
    }, []);

    if (data.loading) {
        return (
            <div className="flex items-center gap-2 text-xs text-white/50 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Loading...</span>
            </div>
        );
    }

    if (data.error) return null;

    // AQI Color Logic
    const getAqiColor = (aqi: number) => {
        if (aqi <= 50) return "text-green-400";
        if (aqi <= 100) return "text-yellow-400";
        if (aqi <= 150) return "text-orange-400";
        if (aqi <= 200) return "text-red-400";
        return "text-purple-400 animate-pulse";
    };

    const getAqiLabel = (aqi: number) => {
        if (aqi <= 50) return "Healthy";
        if (aqi <= 100) return "Moderate";
        if (aqi <= 150) return "Unhealthy (Sens.)";
        if (aqi <= 200) return "Unhealthy";
        return "Hazardous";
    }

    return (
        <div className="flex items-center gap-3 bg-white/5 hover:bg-white/10 transition-colors rounded-full px-3 py-1 border border-white/10 backdrop-blur-sm shadow-sm group cursor-help select-none" title={`AQI: ${data.aqi} (${getAqiLabel(data.aqi)})`}>

            {/* Location Name */}
            <div className="flex items-center gap-1.5 border-r border-white/20 pr-3 max-w-[100px]">
                <MapPin className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                <span className="text-xs font-bold text-white tracking-wide truncate">
                    {data.locationName}
                </span>
            </div>

            {/* Temperature */}
            <div className="flex items-center gap-1.5 border-r border-white/20 pr-3">
                <ThermometerSun className="h-3.5 w-3.5 text-yellow-500" />
                <span className="text-xs font-bold text-white tracking-wide">
                    {data.temperature}°C
                </span>
            </div>

            {/* AQI */}
            <div className="flex items-center gap-1.5">
                <Wind className={cn("h-3.5 w-3.5", getAqiColor(data.aqi))} />
                <div className="flex flex-col leading-none">
                    <span className="text-[10px] font-medium text-white/70">AQI</span>
                    <span className={cn("text-xs font-bold", getAqiColor(data.aqi))}>
                        {data.aqi}
                    </span>
                </div>
            </div>

        </div>
    )
}
