import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, Popup } from 'react-leaflet';
import L, { type LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import axios from 'axios';
import Cookies from 'js-cookie';
import BASE_URL from '../../hooks/Env';
import { useTranslation } from 'react-i18next';
import MarkerClusterGroup from 'react-leaflet-cluster';

// Single marker icon (blue dot). Cluster will show counts like the screenshot.
const blueDotIcon = new L.DivIcon({
  className: "",
  html: `
    <div style="
      width: 18px;
      height: 18px;
      background: #1E5DE5;
      border: 3px solid #ffffff;
      border-radius: 50%;
      box-shadow: 0 3px 10px rgba(30,93,229,0.5);
    "></div>
  `,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  popupAnchor: [0, -12],
});

const createClusterCustomIcon = (cluster: any) => {
  const count = cluster.getChildCount();
  const size = count < 10 ? 42 : count < 100 ? 48 : 56;

  return L.divIcon({
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: #1E5DE5;
        border: 4px solid #ffffff;
        border-radius: 50%;
        box-shadow: 0 6px 18px rgba(30,93,229,0.45);
        display:flex;
        align-items:center;
        justify-content:center;
        color:#fff;
        font-weight: 800;
        font-size: 16px;
        font-family: Arial, sans-serif;
      ">${count}</div>
    `,
    className: "",
    iconSize: L.point(size, size, true),
  });
};

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [45, 65], // Eng katta marker
  iconAnchor: [22, 65],
  popupAnchor: [1, -55],
  shadowSize: [65, 65]
});

interface Workshop {
  id: number;
  name: string;
  lat: string | number;
  long: string | number;
}

// Barcha nuqtalarni ekranga sig'dirish uchun yordamchi komponent
const FitBounds: React.FC<{ points: Workshop[] }> = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (points.length > 0) {
      // Faqat to'g'ri koordinatali nuqtalarni olish
      const validPoints = points.filter(p => {
        const lat = Number(p.lat);
        const lng = Number(p.long);
        return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
      });
      
      if (validPoints.length > 0) {
        const bounds = L.latLngBounds(validPoints.map(p => [Number(p.lat), Number(p.long)]));
        map.fitBounds(bounds, { padding: [50, 50] }); // Chekkalardan joy tashlaydi
      }
    }
  }, [points, map]);
  return null;
};

const SearchPages: React.FC = () => {
  const [position, setPosition] = useState<LatLngTuple>([41.311081, 69.240562]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    const token = Cookies.get("access_token");
    axios.get(`${BASE_URL}/api/workshops/search/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      if (Array.isArray(res.data)) {
        // Faqat to'g'ri koordinatali ustaxonalarni filtrlash
        const validWorkshops = res.data.filter(shop => {
          const lat = Number(shop.lat);
          const lng = Number(shop.long);
          return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
        });
        setWorkshops(validWorkshops);
      }
    })
    .catch(err => console.error(err));

    // Body scroll blokirovka
    document.body.classList.add('search-pages-active');

    // Cleanup - komponent o'chirilganda body klassini olib tashlash
    return () => {
      document.body.classList.remove('search-pages-active');
    };
  }, []);

  const MapEvents = () => {
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
      },
    });
    return null;
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Search Input - Top Right */}
      <div className="absolute top-4 right-4 z-1000 pointer-events-none">
       
      </div>

      {/* Map Container - pastda */}
      <div className="absolute inset-0 z-0 rounded-[20px] overflow-hidden">
        <MapContainer
          center={position}
          zoom={13}
          zoomControl={true}
          style={{ width: '100%', height: '100%' }}
          className="leaflet-container"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          
          {/* Hamma markerlarni bitta ko'rinishga keltirish */}
          <FitBounds points={workshops} />
          <MapEvents />

          {/* Backend'dan kelgan lokatsiyalar: cluster ko‘rinishda */}
          <MarkerClusterGroup
            chunkedLoading
            iconCreateFunction={createClusterCustomIcon}
            showCoverageOnHover={false}
            maxClusterRadius={55}
          >
            {workshops.map((shop) => (
              <Marker
                key={shop.id}
                position={[Number(shop.lat), Number(shop.long)]}
                icon={blueDotIcon}
              >
                <Popup>
                  <div className="p-3 text-center min-w-48">
                    <div className="mb-2">
                      <span className="inline-block w-3 h-3 rounded-full mr-2 bg-blue-500"></span>
                      <span className="text-xs text-gray-600">
                        {t("workshop_number", { id: shop.id })}
                      </span>
                    </div>
                    <p className="font-bold text-lg mb-2 text-blue-700">
                      {shop.name}
                    </p>
                    <div className="text-xs text-gray-500 mb-2">
                      <div>📍 {t("lat")}: {Number(shop.lat).toFixed(5)}</div>
                      <div>📍 {t("lng")}: {Number(shop.long).toFixed(5)}</div>
                    </div>
                    <button className="bg-blue-500 text-white text-xs px-3 py-2 mt-2 rounded-full hover:bg-blue-600 transition-colors">
                      📍 {t("more_details")}
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>

          {/* Tanlangan qizil marker */}
          <Marker position={position} icon={redIcon}>
            <Popup><b className="text-red-600">{t("your_selection")}</b></Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* UI: Koordinatalar va Navigatsiya - mustaqil */}
      <div className="absolute bottom-5 right-5 z-1000 pointer-events-none flex flex-col gap-2">
        <button 
          onClick={() => window.location.reload()} 
          className="bg-white p-3 rounded-full shadow-2xl border-2 border-blue-500 text-xl pointer-events-auto"
          title={t("refresh")}
        >
          🔄
        </button>
      </div>
    </div>
  );
};

export default SearchPages;