import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { AuthContext, type AuthContextType } from "../../context/UseContext";
import { useTranslation } from "react-i18next";

// Leaflet default icon fix
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface Position {
  lat: number;
  lng: number;
}

const DEFAULT_LOCATION: Position = { lat: 41.2995, lng: 69.2401 };

// Xaritani berilgan pozitsiyaga olib boruvchi komponent
const FlyToLocation = ({ position }: { position: Position }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo([position.lat, position.lng], 15, { duration: 1.5 });
  }, [position]);
  return null;
};

// Xaritada bosib joylashuvni o'zgartirish
const LocationPicker = ({ onPick }: { onPick: (pos: Position) => void }) => {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
};

const RegisterLocationPages = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { workshopLocation, setWorkshopLocation } = useContext(
    AuthContext,
  ) as AuthContextType;

  // Default joylashuv — Toshkent markazi
  const [position, setPosition] = useState<Position>(DEFAULT_LOCATION);
  const [error, setError] = useState("");

  // Kontextda saqlangan joylashuv bo'lsa, uni ko'rsatish
  useEffect(() => {
    if (workshopLocation) {
      setPosition(workshopLocation);
    }
  }, []);



  // Xaritada bosilganda pozitsiyani yangilash
  const handleMapPick = (pos: Position) => {
    setPosition(pos);
    setWorkshopLocation(pos);
    setError("");
  };

  // Tayyor tugmasi - faqat joylashuvni saqlaydi va orqaga qaytaradi
  const handleTayyor = () => {
    if (!position) {
      setError(t("joylashuv_tanlanmagan"));
      return;
    }

    setWorkshopLocation(position);
    navigate(-1); // WorkshopMediaLocation ga qaytish
  };

  return (
    <div className="relative w-full h-screen">
      {/* Xarita */}
      <MapContainer
        center={[position.lat, position.lng]}
        zoom={13}
        zoomControl={false}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[position.lat, position.lng]} icon={customIcon} />
        <FlyToLocation position={position} />
        <LocationPicker onPick={handleMapPick} />
      </MapContainer>



      

      {/* Xato xabari */}
      {error && (
        <div
          className="absolute top-20 left-1/2 -translate-x-1/2 z-1000
                        bg-yellow-50 border border-yellow-300 text-yellow-800
                        text-xs px-4 py-2 rounded-full shadow max-w-xs text-center"
        >
          {error}
        </div>
      )}

      {/* Tayyor tugmasi */}
      <button
        onClick={handleTayyor}
        className={`absolute bottom-6 right-6 z-1000 text-white text-sm font-semibold
                    px-6 py-2.5 rounded-full shadow-lg transition
                    bg-blue-600 hover:bg-blue-700`}
      >
        {t("tayyor")}
      </button>
    </div>
  );
};

export default RegisterLocationPages;
