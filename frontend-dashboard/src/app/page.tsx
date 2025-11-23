"use client"; 

import React, { useState, useCallback, useMemo } from 'react';
import { Map as MapIcon, Zap, Route, Plus, Trash2, Loader, CheckCircle, Truck } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import the Map component to avoid Server-Side Rendering issues
const MapComponent = dynamic(() => import('../components/Map'), { 
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center bg-slate-100 text-slate-400">Loading Map...</div>
});

// --- DATA INTERFACES ---

interface RouteData {
  original: { distance_km: number; carbon_kg: number; coordinates: [number, number][] };
  optimized: { distance_km: number; carbon_kg: number; coordinates: [number, number][] };
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

// --- COMPONENTS ---

const RouteInput = React.memo(({ label, value, onChange, placeholder, icon: Icon, isReadonly = false }: RouteInputProps) => (
    <div className="flex items-center space-x-3 p-3 bg-white/70 backdrop-blur-sm rounded-xl shadow-md transition duration-300 hover:shadow-lg">
        {/* FIXED: Cleaned up the className string to ensure no syntax errors */}
        <Icon className="w-5 h-5 text-emerald-600 flex-shrink-0;" />
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

// --- MAIN PAGE ---

export default function Home() {
    const [origin, setOrigin] = useState('Okuizumo-cho Logistics Point');
    const [destination, setDestination] = useState('Osaka International Cargo Port');
    const [stops, setStops] = useState(['Matsue Distribution Center', 'Hiroshima Transit Hub']);
    const [isLoading, setIsLoading] = useState(false);
    const [optimizationMetrics, setOptimizationMetrics] = useState<RouteData | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const addStop = useCallback(() => { if (stops.length < 5) setStops(prev => [...prev, '']); }, [stops.length]);
    
    const updateStop = useCallback((index: number, newAddress: string) => { setStops(prev => prev.map((item, i) => (i === index ? newAddress : item))); }, []);
    const removeStop = useCallback((index: number) => { setStops(prev => prev.filter((_, i) => i !== index)); }, []);

    const optimizeRoute = useCallback(async () => {
        setIsLoading(true);
        setOptimizationMetrics(null);
        setErrorMsg(null);

        try {
            const response = await fetch('http://127.0.0.1:3000/api/v1/routes/optimize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ origin, destination, stops })
            });

            if (!response.ok) throw new Error('Failed to connect to API Gateway');

            const data: RouteData = await response.json();
            setOptimizationMetrics(data);

        } catch (error) {
            console.error('Optimization failed:', error);
            setErrorMsg('Optimization Engine unavailable. Ensure Rails (3000) and Python (5001) are running.');
        } finally {
            setIsLoading(false);
        }
    }, [origin, destination, stops]);

    const isRouteValid = useMemo(() => {
        const requiredFields = [origin, destination];
        return requiredFields.every(f => f.trim() !== '');
    }, [origin, destination]);

    return (
        <div className="min-h-screen bg-slate-50 font-sans p-4 md:p-8">
            <style>{`
                .text-emerald-600 { color: rgb(16, 185, 129); }
                .bg-emerald-600 { background-color: rgb(16, 185, 129); }
                .hover\\:bg-emerald-700:hover { background-color: #047857; }
                .shadow-emerald { box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.2), 0 4px 6px -2px rgba(16, 185, 129, 0.05); }
            `}</style>
            
            <header className="mb-8 text-center">
                <h1 className="text-4xl font-extrabold text-gray-800 flex items-center justify-center space-x-3">
                    <Truck className="w-10 h-10 text-emerald-600" />
                    <span>EcoRoute Optimizer</span>
                </h1>
                <p className="text-gray-500 mt-2">Sustainable Logistics & Carbon Footprint Reduction Platform</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {/* Input Column */}
                <div className="lg:col-span-1 p-6 bg-white rounded-2xl shadow-2xl h-fit sticky top-8 border-t-4 border-emerald-500">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3 flex items-center space-x-2">
                        <Route className="w-6 h-6 text-emerald-600" />
                        <span>Route Parameters</span>
                    </h2>

                    <div className="space-y-4">
                        <RouteInput 
                            label="Origin" 
                            value={origin} 
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOrigin(e.target.value)} 
                            placeholder="Start Location" 
                            icon={MapIcon} 
                        />
                        
                        {stops.map((stop, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <RouteInput 
                                    label={`Stop ${index + 1}`} 
                                    value={stop} 
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateStop(index, e.target.value)} 
                                    placeholder={`Stop ${index + 1}`} 
                                    icon={Route} 
                                />
                                <button onClick={() => removeStop(index)} className="p-2 text-red-400 hover:text-red-600"><Trash2 className="w-5 h-5" /></button>
                            </div>
                        ))}
                        
                        {stops.length < 5 && (
                            <button onClick={addStop} className="flex items-center space-x-2 text-emerald-600 font-semibold text-sm ml-1">
                                <Plus className="w-4 h-4" /><span>Add Delivery Stop</span>
                            </button>
                        )}
                        
                        <RouteInput 
                            label="Destination" 
                            value={destination} 
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDestination(e.target.value)} 
                            placeholder="End Location" 
                            icon={MapIcon} 
                        />
                    </div>

                    <button onClick={optimizeRoute} disabled={isLoading || !isRouteValid} className={`mt-6 w-full py-3 rounded-xl text-white font-bold text-lg flex items-center justify-center space-x-2 transition duration-300 ${isRouteValid && !isLoading ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald transform hover:-translate-y-1' : 'bg-gray-300 cursor-not-allowed'}`}>
                        {isLoading ? <><Loader className="w-5 h-5 animate-spin" /><span>Calculating...</span></> : <><Zap className="w-5 h-5" /><span>Optimize Route</span></>}
                    </button>
                </div>

                {/* Results Column */}
                <div className="lg:col-span-2">
                    {/* REAL MAP VISUALIZATION */}
                    <div className="bg-white h-96 w-full rounded-2xl shadow-2xl mb-8 border-4 border-white overflow-hidden relative z-0">
                         <MapComponent 
                            originalCoords={optimizationMetrics?.original.coordinates} 
                            optimizedCoords={optimizationMetrics?.optimized.coordinates} 
                         />
                    </div>

                    {errorMsg && (
                         <div className="p-6 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-xl shadow-md">
                            <p className="font-bold">Connection Error</p>
                            <p>{errorMsg}</p>
                         </div>
                    )}

                    {optimizationMetrics && (
                        <div className="p-8 bg-white rounded-2xl shadow-2xl border-t-4 border-emerald-500 animation-fade-in">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3 flex items-center space-x-2">
                                <CheckCircle className="w-6 h-6 text-emerald-500" />
                                <span>Optimization Success</span>
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <MetricCard value={optimizationMetrics.savings.distance_percent} label="Distance Saved" unit="%" color="text-emerald-600" />
                                <MetricCard value={optimizationMetrics.savings.carbon_percent} label="CO₂ Reduction" unit="%" color="text-emerald-600" />
                                <MetricCard value={optimizationMetrics.optimized.distance_km} label="Total Distance" unit=" km" color="text-slate-700" />
                                <MetricCard value={optimizationMetrics.optimized.carbon_kg} label="Carbon Footprint" unit=" kg" color="text-slate-700" />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}