import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { registerWorkshop } from '../../services/api/workshopApi';
import { AuthContext, type AuthContextType } from '../../context/UseContext';
import { useTranslation } from 'react-i18next';

// Leaflet default icon fix
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
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
  const {
    phoneNumber,
    workshopTitle,
    workshopAddress,
    workshopDescription,
    workshopWorkingTime,
    workshopPassword,
    workshopPasswordConfirm,
    workshopLocation,
    setWorkshopLocation,
    workshopImages,
    clearWorkshopData,
  } = useContext(AuthContext) as AuthContextType;

  // Default joylashuv — Toshkent markazi
  const [position, setPosition] = useState<Position>(DEFAULT_LOCATION);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Kontextda saqlangan joylashuv bo'lsa, uni ko'rsatish
  useEffect(() => {
    if (workshopLocation) {
      setPosition(workshopLocation);
    }
  }, []);

  // Foydalanuvchi tugma bosganida GPS joylashuvini aniqlash
  const handleGetMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolokatsiya qo'llab-quvvatlanmaydi");
      return;
    }

    setLocating(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: Position = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setPosition(loc);
        setWorkshopLocation(loc);
        setLocating(false);
      },
      () => {
        setLocating(false);
        setError("Joylashuv aniqlanmadi. Xaritadan tanlang.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Xaritada bosilganda pozitsiyani yangilash
  const handleMapPick = (pos: Position) => {
    setPosition(pos);
    setWorkshopLocation(pos);
    setError('');
  };

  // Base64 rasmni File obyektiga aylantirish
  const convertBase64ToFile = (base64String: string, filename: string): File => {
    const arr = base64String.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  // Telefon raqamidan barcha harflarni tozalash
  const cleanPhoneNumber = (phone: string): string => {
    return phone.replace(/[^0-9]/g, '');
  };

  // Ro'yxatdan o'tish
  const handleTayyor = async () => {
    if (!phoneNumber) {
      setError(t('telefon_raqami_kiritilmagan'));
      return;
    }
    if (!workshopTitle) {
      setError(t('ustaxona_nomi_kiritilmagan'));
      return;
    }
    if (!workshopPassword) {
      setError(t("parol_to'liq_emas"));
      return;
    }

    const images = workshopImages || [];
    const mainImage =
      images.length > 0 ? convertBase64ToFile(images[0], 'main_image.jpg') : undefined;
    const workshopImagesList = images.map((img: string, index: number) =>
      convertBase64ToFile(img, `workshop_image_${index}.jpg`)
    );

    setSubmitting(true);
    setError('');

    try {
      const response = await registerWorkshop({
        phone_number: cleanPhoneNumber(phoneNumber),
        password: workshopPassword,
        password_confirm: workshopPasswordConfirm || workshopPassword,
        role: 'WORKSHOP',
        full_name: workshopTitle,
        image: mainImage,
        title: workshopTitle,
        address: workshopAddress,
        description: workshopDescription,
        working_time: workshopWorkingTime,
        latitude: String(position.lat.toFixed(6)),
        longitude: String(position.lng.toFixed(6)),
        workshop_images: workshopImagesList,
      },t);
         
      if (response.success && response.token) {
        
        localStorage.setItem('token', response.token);
        clearWorkshopData?.();
        navigate('/');
      } else {
        setError(response.message || t('royxatdan_otishda_xatolik'));
      }
    } catch (err) {
      console.error(err);
      setError(
        t('sorov_xatosi') + ': ' + (err instanceof Error ? err.message : t('nomlum_xato'))
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative w-full h-screen">
      {/* Xarita */}
      <MapContainer
        center={[position.lat, position.lng]}
        zoom={13}
        zoomControl={false}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[position.lat, position.lng]} icon={customIcon} />
        <FlyToLocation position={position} />
        <LocationPicker onPick={handleMapPick} />
      </MapContainer>

      {/* Yuqori panel: koordinatalar va GPS tugmasi */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-1000 flex items-center gap-2">
        {/* Koordinatalar */}
        <div className="bg-white border border-gray-200 text-gray-600 text-xs px-4 py-2 rounded-full shadow">
          {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
        </div>

        {/* GPS tugmasi — faqat shu yerda geolocation so'raladi */}
        <button
          onClick={handleGetMyLocation}
          disabled={locating}
          className="bg-white border border-gray-200 text-gray-700 text-xs font-medium
                     px-4 py-2 rounded-full shadow hover:bg-gray-50 transition
                     disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
        >
          {locating ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              Aniqlanmoqda...
            </>
          ) : (
            <>📍 Mening joylashuvim</>
          )}
        </button>
      </div>

      {/* Xarita ustidagi yoriqnoma */}
      <div className="absolute top-3.5 left-1/2 -translate-x-1/2 z-1000">
        <p className="bg-black/40 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
          Aniq joylashuv uchun xaritaga bosing
        </p>
      </div>

      {/* Xato xabari */}
      {error && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-1000
                        bg-yellow-50 border border-yellow-300 text-yellow-800
                        text-xs px-4 py-2 rounded-full shadow max-w-xs text-center">
          {error}
        </div>
      )}

      {/* Tayyor tugmasi */}
      <button
        onClick={handleTayyor}
        disabled={submitting}
        className={`absolute bottom-6 right-6 z-1000 text-white text-sm font-semibold
                    px-6 py-2.5 rounded-full shadow-lg transition
                    ${submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
      >
        {submitting ? t('yuklanmoqda') : t('tayyor')}
      </button>
    </div>
  );
};

export default RegisterLocationPages;