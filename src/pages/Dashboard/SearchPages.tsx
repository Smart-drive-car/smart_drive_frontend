import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L, { type LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Marker rasmlarini import qilish
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Leaflet default icon sozlamasi
const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
  center: LatLngTuple;
}

// Xarita markazini dasturiy ravishda o'zgartirish uchun yordamchi komponent
const ChangeView: React.FC<MapProps> = ({ center }) => {
  const map = useMap();
  map.setView(center);
  return null;
};

const SearchPages: React.FC = () => {
  // TypeScript uchun LatLngTuple tipini beramiz
  const [position, setPosition] = useState<LatLngTuple>([41.311081, 69.240562]);

  // Xarita bosilganda koordinatani yangilash
  const MapEvents = () => {
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
      },
    });
    return null;
  };

  // GPS orqali joylashuvni aniqlash
  const handleGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
        },
        () => {
          alert("Joylashuvni aniqlashga ruxsat berilmadi yoki xatolik yuz berdi.");
        }
      );
    }
  };

  return (
    // map 
    <div className="relative w-full h-screen  rounded-[20px] overflow-hidden z-0">
      <MapContainer
        center={position}
        zoom={13}
        zoomControl={false}
        style={{ width: '100%', height: '100%',borderRadius:"20px" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Xarita holatini yangilab turish uchun */}
        <ChangeView center={position} />
        
        {/* Marker ekranda ko'rinishi uchun */}
        <Marker position={position} />
        
        <MapEvents />
      </MapContainer>

      {/* Interfeys elementlari */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-1000 flex flex-col items-center gap-2 w-full max-w-xs px-4">
        {/* Koordinatalar paneli */}
        <div className="bg-white px-4 py-2 rounded-lg shadow-md border flex justify-between w-full text-sm font-mono text-black">
          <span>Lat: {position[0].toFixed(6)}</span>
          <span>Lng: {position[1].toFixed(6)}</span>
        </div>

        {/* GPS tugmasi */}
        <button 
          onClick={handleGeolocation}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full shadow-lg transition-all active:scale-95 flex items-center gap-2"
        >
          📍 Mening joylashuvim
        </button>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-1000">
        <p className="bg-black/60 text-white text-xs px-4 py-2 rounded-full backdrop-blur-sm border border-white/20 whitespace-nowrap">
          Aniq joylashuv uchun xaritaga bosing
        </p>
      </div>
    </div>
  );
};

export default SearchPages;