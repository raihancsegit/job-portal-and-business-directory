// src/pages/dashboard/components/LocationMap.jsx

import React, { useState, useEffect } from 'react'; // useEffect import করুন
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// ... আপনার আইকন ফিক্স কোড এখানে থাকবে ...
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconRetinaUrl, iconUrl, shadowUrl,
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
    tooltipAnchor: [16, -28], shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;
// ... আইকন ফিক্স শেষ ...


// Helper Component: LocationMarker (অপরিবর্তিত)
const LocationMarker = ({ position, setPosition, onLocationSelect }) => {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
            if (onLocationSelect) {
                onLocationSelect(e.latlng);
            }
        },
    });
    return position === null ? null : <Marker position={position}></Marker>;
};

// ================== নতুন পরিবর্তন এখানে (ধাপ ১) ==================
// Helper Component: MapUpdater
// এই কম্পোনেন্টটি প্যারেন্ট থেকে নতুন সেন্টার পেলে ম্যাপকে flyTo করবে
const MapUpdater = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo([center.lat, center.lng], 13);
        }
    }, [center, map]); // যখনই center পরিবর্তন হবে, এটি রান করবে
    return null;
};
// =========================================================

// Main LocationMap Component (পরিবর্তিত সংস্করণ)
const LocationMap = ({ onLocationSelect, initialPosition, searchResultPosition }) => {
    
    // ================== নতুন পরিবর্তন এখানে (ধাপ ২) ==================
    // এখন position state-টি প্যারেন্ট থেকে আসবে
    const [position, setPosition] = useState(initialPosition || { lat: 23.8103, lng: 90.4125 });

    // প্যারেন্ট থেকে searchResultPosition পরিবর্তন হলে, ম্যাপের মার্কার আপডেট হবে
    useEffect(() => {
        if (searchResultPosition) {
            setPosition(searchResultPosition);
        }
    }, [searchResultPosition]);
    // =========================================================

    return (
        <div className="map-container" style={{ position: 'relative', height: '400px' }}>
            <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker 
                    position={position} 
                    setPosition={setPosition} 
                    onLocationSelect={onLocationSelect} 
                />
                {/* SearchControl কম্পোনেন্টটি এখান থেকে সরিয়ে দেওয়া হয়েছে */}
                
                {/* নতুন MapUpdater কম্পোনেন্ট যোগ করা হয়েছে */}
                <MapUpdater center={searchResultPosition || position} />
            </MapContainer>
        </div>
    );
};

export default LocationMap;