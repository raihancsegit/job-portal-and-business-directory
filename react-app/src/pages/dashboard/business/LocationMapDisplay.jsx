// src/pages/dashboard/components/LocationMapDisplay.jsx (নতুন ফাইল)
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Leaflet আইকন ফিক্স (আগের মতোই)
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
L.Marker.prototype.options.icon = L.icon({ iconUrl, shadowUrl, iconSize: [25, 41], iconAnchor: [12, 41] });

const LocationMapDisplay = ({ location, businessName }) => {
    if (!location || !location.lat || !location.lng) {
        return <p className="text-muted">Map location not available.</p>;
    }
    const position = [location.lat, location.lng];
    return (
        <div className="map-container mt-3" style={{ height: '250px', borderRadius: '8px', overflow: 'hidden' }}>
            <MapContainer center={position} zoom={14} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={position}>
                    <Popup>{businessName}</Popup>
                </Marker>
            </MapContainer>
        </div>
    );
};
export default LocationMapDisplay;