// src/pages/dashboard/components/LocationMap.jsx

import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// ================== FIX STARTS HERE ==================
// require() এর পরিবর্তে import ব্যবহার করে আইকন ইম্পোর্ট করা
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Leaflet-এর ডিফল্ট আইকন সমস্যা সমাধানের সঠিক পদ্ধতি
const DefaultIcon = L.icon({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;
// =================== FIX ENDS HERE ===================


// Helper Component: LocationMarker (অপরিবর্তিত)
const LocationMarker = ({ position, setPosition, onLocationSelect }) => {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
            onLocationSelect(e.latlng);
        },
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
};

// Helper Component: SearchControl (অপরিবর্তিত)
const SearchControl = ({ setPosition, onLocationSelect }) => {
    const map = useMap();
    const [query, setQuery] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query) return;
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`);
            const data = await response.json();
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                const newPos = { lat: parseFloat(lat), lng: parseFloat(lon) };
                setPosition(newPos);
                onLocationSelect(newPos);
                map.flyTo(newPos, 13);
            } else {
                alert('Location not found!');
            }
        } catch (error) {
            console.error("Geocoding API error:", error);
            alert('Failed to search for location.');
        }
    };

    return (
        <div className="leaflet-top leaflet-left" style={{ top: '10px', left: '50px', zIndex: 1000 }}>
            <div className="leaflet-control">
                <form onSubmit={handleSearch} style={{ display: 'flex' }}>
                    <input
                        type="text"
                        className="map-search"
                        placeholder="Enter Location"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                    />
                    <button type="submit" className="i-btn btn--sm btn--dark" style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}>Search</button>
                </form>
            </div>
        </div>
    );
};

// Main LocationMap Component (অপরিবর্তিত)
const LocationMap = ({ onLocationSelect }) => {
    const [position, setPosition] = useState({ lat: 23.8103, lng: 90.4125 });

    return (
        <div className="map-container" style={{ position: 'relative', height: '400px' }}>
            <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker position={position} setPosition={setPosition} onLocationSelect={onLocationSelect} />
                <SearchControl setPosition={setPosition} onLocationSelect={onLocationSelect} />
            </MapContainer>
        </div>
    );
};

export default LocationMap;