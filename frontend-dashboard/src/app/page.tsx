"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { Map as MapIcon, Zap, Route, Plus, Trash2, Loader, CheckCircle, Truck, Globe } from 'lucide-react';
import dynamic from 'next/dynamic';


const MapComponent = dynamic(() => import('../components/Map'), {
    ssr: false,
    loading: () => <div className="h-full w-full flex items-center justify-center bg-slate-100 text-slate-400">Loading Map...</div>
});

type Language = 'en' | 'de' | 'jp';

const translations = {
    en: {
        title: "EcoRoute Optimizer",
        subtitle: "Sustainable Logistics & Carbon Footprint Reduction Platform",
        routeParams: "Route Parameters",
        origin: "Origin",
        destination: "Destination",
        stop: "Stop",
        addStop: "Add Delivery Stop",
        optimize: "Optimize Route",
        calculating: "Calculating...",
        success: "Optimization Success",
        distanceSaved: "Distance Saved",
        carbonReduction: "CO₂ Reduction",
        totalDistance: "Total Distance",
        carbonFootprint: "Carbon Footprint",
        connectionError: "Connection Error",
        engineUnavailable: "Optimization Engine unavailable. Ensure Rails (3000) and Python (5001) are running.",
        startLocation: "Start Location",
        endLocation: "End Location",
        stopPlaceholder: "Stop Location"
    },
    de: {
        title: "EcoRoute Optimierer",
        subtitle: "Plattform für nachhaltige Logistik & CO₂-Reduktion",
        routeParams: "Routenparameter",
        origin: "Startpunkt",
        destination: "Zielort",
        stop: "Zwischenstopp",
        addStop: "Lieferstopp hinzufügen",
        optimize: "Route optimieren",
        calculating: "Berechnung...",
        success: "Optimierung erfolgreich",
        distanceSaved: "Distanz gespart",
        carbonReduction: "CO₂-Reduktion",
        totalDistance: "Gesamtdistanz",
        carbonFootprint: "CO₂-Fußabdruck",
        connectionError: "Verbindungsfehler",
        engineUnavailable: "Optimierungs-Engine nicht verfügbar. Stellen Sie sicher, dass Rails (3000) und Python (5001) laufen.",
        startLocation: "Startadresse",
        endLocation: "Zieladresse",
        stopPlaceholder: "Stoppadresse"
    },
    jp: {
        title: "EcoRoute オプティマイザー",
        subtitle: "持続可能な物流と二酸化炭素排出削減プラットフォーム",
        routeParams: "ルートパラメータ",
        origin: "出発地",
        destination: "目的地",
        stop: "経由地",
        addStop: "配送先を追加",
        optimize: "ルート最適化",
        calculating: "計算中...",
        success: "最適化完了",
        distanceSaved: "短縮距離",
        carbonReduction: "CO₂削減量",
        totalDistance: "総距離",
        carbonFootprint: "二酸化炭素排出量",
        connectionError: "接続エラー",
        engineUnavailable: "最適化エンジンが利用できません。Rails (3000) と Python (5001) が実行されていることを確認してください。",
        startLocation: "出発地を入力",
        endLocation: "目的地を入力",
        stopPlaceholder: "経由地を入力"
    }
};

interface RouteData {
    original: { distance_km: number; carbon_kg: number; coordinates: [number, number][]; waypoints: [number, number][] };
    optimized: { distance_km: number; carbon_kg: number; duration_min: number; coordinates: [number, number][]; waypoints: [number, number][]; etas?: { address: string; time: string; total_time?: string }[] };
    options?: {
        fastest: { distance_km: number; carbon_kg: number; duration_min: number; coordinates: [number, number][]; waypoints: [number, number][]; etas?: { address: string; time: string; total_time?: string }[] };
        eco?: { distance_km: number; carbon_kg: number; duration_min: number; coordinates: [number, number][]; waypoints: [number, number][]; etas?: { address: string; time: string; total_time?: string }[] };
    };
    savings: { distance_percent: number; carbon_percent: number };
}

interface MetricCardProps {
    value: string | number;
    label: string;
    unit: string;
    color: string;
}

interface RouteInputProps {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
    icon: React.ElementType;
    isReadonly?: boolean;
}

const RouteInput = React.memo(({ label, value, onChange, placeholder, icon: Icon, isReadonly = false }: RouteInputProps) => (
    <div className="flex items-center space-x-3 p-3 bg-white/70 backdrop-blur-sm rounded-xl shadow-md transition duration-300 hover:shadow-lg">
        <Icon className="w-5 h-5 text-emerald-600 flex-shrink-0" />
        <input
            type="text"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            readOnly={isReadonly}
            className={`w-full bg-transparent text-gray-800 placeholder-gray-500 font-medium focus:outline-none ${isReadonly ? 'cursor-not-allowed' : ''}`}
            aria-label={label}
        />
    </div>
));
RouteInput.displayName = "RouteInput";

const MetricCard = ({ value, label, unit, color }: MetricCardProps) => (
    <div className="p-4 rounded-xl bg-white shadow-xl flex flex-col items-center justify-center text-center transition duration-300 hover:scale-[1.02]">
        <div className={`text-4xl font-extrabold ${color}`}>{value}{unit}</div>
        <div className="text-sm text-gray-500 mt-1 uppercase tracking-wider">{label}</div>
    </div>
);

const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    if (h === 0) return `${m} min`;
    return `${h} hr ${m} min`;
};

export default function Home() {
    const [language, setLanguage] = useState<Language>('en');
    const t = translations[language];

    const [origin, setOrigin] = useState('Okuizumo-cho Logistics Point');
    const [destination, setDestination] = useState('Osaka International Cargo Port');
    const [stops, setStops] = useState(['Matsue Distribution Center', 'Hiroshima Transit Hub']);
    const [isLoading, setIsLoading] = useState(false);
    const [optimizationMetrics, setOptimizationMetrics] = useState<RouteData | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const addStop = useCallback(() => { if (stops.length < 5) setStops(prev => [...prev, '']); }, [stops.length]);

    const updateStop = useCallback((index: number, newAddress: string) => { setStops(prev => prev.map((item, i) => (i === index ? newAddress : item))); }, []);
    const removeStop = useCallback((index: number) => { setStops(prev => prev.filter((_, i) => i !== index)); }, []);

    const [selectedOption, setSelectedOption] = useState<'fastest' | 'eco'>('fastest');


    const optimizeRoute = useCallback(async () => {
        setIsLoading(true);
        setOptimizationMetrics(null);
        setErrorMsg(null);

        try {
            const currentStartTime = new Date().toTimeString().slice(0, 5);
            const response = await fetch('/api/v1/routes/optimize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ origin, destination, stops, start_time: currentStartTime })
            });

            if (!response.ok) throw new Error('Failed to connect to API Gateway');

            const data: RouteData = await response.json();
            setOptimizationMetrics(data);

            // Default to fastest, but if eco exists and is different, user can switch
            setSelectedOption('fastest');

        } catch (error) {
            console.error('Optimization failed:', error);
            setErrorMsg(t.engineUnavailable);
        } finally {
            setIsLoading(false);
        }
    }, [origin, destination, stops, t.engineUnavailable]);

    const isRouteValid = useMemo(() => {
        const requiredFields = [origin, destination];
        return requiredFields.every(f => f.trim() !== '');
    }, [origin, destination]);

    const currentMetrics = optimizationMetrics?.options?.[selectedOption] || optimizationMetrics?.optimized;

    return (
        <div className="min-h-screen bg-slate-50 font-sans p-4 md:p-8">
            <style>{`
                .text-emerald-600 { color: rgb(16, 185, 129); }
                .bg-emerald-600 { background-color: rgb(16, 185, 129); }
                .hover\\:bg-emerald-700:hover { background-color: #047857; }
                .shadow-emerald { box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.2), 0 4px 6px -2px rgba(16, 185, 129, 0.05); }
            `}</style>

            <header className="mb-8 text-center relative">
                <div className="absolute right-0 top-0 flex space-x-2">
                    <button onClick={() => setLanguage('en')} className={`px-3 py-1 rounded-lg font-bold transition ${language === 'en' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>🇬🇧 EN</button>
                    <button onClick={() => setLanguage('de')} className={`px-3 py-1 rounded-lg font-bold transition ${language === 'de' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>🇩🇪 DE</button>
                    <button onClick={() => setLanguage('jp')} className={`px-3 py-1 rounded-lg font-bold transition ${language === 'jp' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>🇯🇵 JP</button>
                </div>

                <h1 className="text-4xl font-extrabold text-gray-800 flex items-center justify-center space-x-3">
                    <Truck className="w-10 h-10 text-emerald-600" />
                    <span>{t.title}</span>
                </h1>
                <p className="text-gray-500 mt-2">{t.subtitle}</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                <div className="lg:col-span-1 p-6 bg-white rounded-2xl shadow-2xl h-fit sticky top-8 border-t-4 border-emerald-500">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3 flex items-center space-x-2">
                        <Route className="w-6 h-6 text-emerald-600" />
                        <span>{t.routeParams}</span>
                    </h2>

                    <div className="space-y-4">


                        <RouteInput
                            label={t.origin}
                            value={origin}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOrigin(e.target.value)}
                            placeholder={t.startLocation}
                            icon={MapIcon}
                        />

                        {stops.map((stop, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <RouteInput
                                    label={`${t.stop} ${index + 1}`}
                                    value={stop}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateStop(index, e.target.value)}
                                    placeholder={`${t.stopPlaceholder} ${index + 1}`}
                                    icon={Route}
                                />
                                <button onClick={() => removeStop(index)} className="p-2 text-red-400 hover:text-red-600"><Trash2 className="w-5 h-5" /></button>
                            </div>
                        ))}

                        {stops.length < 5 && (
                            <button onClick={addStop} className="flex items-center space-x-2 text-emerald-600 font-semibold text-sm ml-1">
                                <Plus className="w-4 h-4" /><span>{t.addStop}</span>
                            </button>
                        )}

                        <RouteInput
                            label={t.destination}
                            value={destination}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDestination(e.target.value)}
                            placeholder={t.endLocation}
                            icon={MapIcon}
                        />
                    </div>

                    <button onClick={optimizeRoute} disabled={isLoading || !isRouteValid} className={`mt-6 w-full py-3 rounded-xl text-white font-bold text-lg flex items-center justify-center space-x-2 transition duration-300 ${isRouteValid && !isLoading ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald transform hover:-translate-y-1' : 'bg-gray-300 cursor-not-allowed'}`}>
                        {isLoading ? <><Loader className="w-5 h-5 animate-spin" /><span>{t.calculating}</span></> : <><Zap className="w-5 h-5" /><span>{t.optimize}</span></>}
                    </button>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white h-96 w-full rounded-2xl shadow-2xl mb-8 border-4 border-white overflow-hidden relative z-0">
                        <MapComponent
                            originalCoords={optimizationMetrics?.original.coordinates}
                            optimizedCoords={currentMetrics?.coordinates}
                            originalWaypoints={optimizationMetrics?.original.waypoints}
                            optimizedWaypoints={currentMetrics?.waypoints}
                        />
                    </div>

                    {errorMsg && (
                        <div className="p-6 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-xl shadow-md">
                            <p className="font-bold">{t.connectionError}</p>
                            <p>{errorMsg}</p>
                        </div>
                    )}

                    {optimizationMetrics && currentMetrics && (
                        <div className="p-8 bg-white rounded-2xl shadow-2xl border-t-4 border-emerald-500 animation-fade-in">
                            <div className="flex justify-between items-center mb-6 border-b pb-3">
                                <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                                    <CheckCircle className="w-6 h-6 text-emerald-500" />
                                    <span>{t.success}</span>
                                </h2>

                                {optimizationMetrics.options?.eco && (
                                    <div className="flex space-x-2 bg-slate-100 p-1 rounded-lg">
                                        <button
                                            onClick={() => setSelectedOption('fastest')}
                                            className={`px-4 py-2 rounded-md text-sm font-bold transition ${selectedOption === 'fastest' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            Fastest
                                        </button>
                                        <button
                                            onClick={() => setSelectedOption('eco')}
                                            className={`px-4 py-2 rounded-md text-sm font-bold transition ${selectedOption === 'eco' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            Eco-Friendly
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                                <MetricCard value={optimizationMetrics.savings.distance_percent} label={t.distanceSaved} unit="%" color="text-emerald-600" />
                                <MetricCard value={optimizationMetrics.savings.carbon_percent} label={t.carbonReduction} unit="%" color="text-emerald-600" />
                                <MetricCard value={currentMetrics.distance_km} label={t.totalDistance} unit=" km" color="text-slate-700" />
                                <MetricCard value={formatDuration(currentMetrics.duration_min)} label="Total Duration" unit="" color="text-slate-700" />
                                <MetricCard value={currentMetrics.carbon_kg} label={t.carbonFootprint} unit=" kg" color="text-slate-700" />
                            </div>

                            {currentMetrics.etas && (
                                <div className="mt-6">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">Delivery Schedule</h3>
                                    <div className="space-y-3">
                                        {currentMetrics.etas.map((eta: any, i: number) => (
                                            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">
                                                        {i === 0 ? 'S' : i === (currentMetrics.etas?.length ?? 0) - 1 ? 'E' : i}
                                                    </div>
                                                    <span className="font-medium text-gray-700">{eta.address}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <div className="font-mono font-bold text-emerald-600 bg-white px-3 py-1 rounded border border-emerald-100">
                                                        {eta.time}
                                                    </div>
                                                    {eta.total_time && (
                                                        <span className="text-xs text-gray-400 font-medium">
                                                            (+{eta.total_time})
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
