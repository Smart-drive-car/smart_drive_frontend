import { DeleteOutlined, LeftOutlined, PlusOutlined } from '@ant-design/icons';
import { useRef, useState, useContext,  } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext, type AuthContextType } from '../../context/UseContext';
import { useTranslation } from 'react-i18next';

const STORAGE_KEY = 'workshop_images';

const RegisterImagesPages = () => {
  const { t } = useTranslation();
  const { workshopImages, setWorkshopImages } = useContext(AuthContext) as AuthContextType;
  const [images, setImages] = useState<string[]>(() => {
    // Context dan yuklash
    if (workshopImages && workshopImages.length > 0) {
      return workshopImages;
    }
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [selectedIdx, setSelectedIdx] = useState(0);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const saveToStorage = (imgs: string[]) => {
    setWorkshopImages(imgs);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(imgs));
  };

  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const readers = Array.from(files).map(
      (file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        })
    );

    Promise.all(readers).then((base64Images) => {
      setImages((prev) => {
        const updated = [...prev, ...base64Images];
        setSelectedIdx(updated.length - 1);
        saveToStorage(updated);
        return updated;
      });
    });

    e.target.value = '';
  };

  const handleDelete = () => {
    if (images.length === 0) return;
    setImages((prev) => {
      const updated = prev.filter((_, i) => i !== selectedIdx);
      setSelectedIdx(updated.length > 0 ? Math.min(selectedIdx, updated.length - 1) : 0);
      saveToStorage(updated);
      return updated;
    });
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen p-4 font-sans">
      <button onClick={() => navigate(-1)} className="flex items-center gap-3 ml-4 mb-3 cursor-pointer">
        <LeftOutlined className="w-2 h-2" />
        <span className="font-medium text-[#000000] text-[12px]">{t("back")}</span>
      </button>

      <div
        onClick={() => images.length === 0 && fileInputRef.current?.click()}
        className={`relative w-full aspect-4/5 rounded-[2.5rem] overflow-hidden bg-gray-100 shadow-sm border border-gray-100 ${
          images.length === 0 ? 'cursor-pointer' : ''
        }`}
      >
        {images.length > 0 ? (
          <>
            <img src={images[selectedIdx]} alt="Selected" className="w-full h-full object-cover" />
            <button
              onClick={handleDelete}
              className="absolute bottom-6 right-6 bg-white p-3 rounded-full w-9 h-9 flex items-center justify-center shadow-lg text-gray-500 hover:text-red-500 transition"
            >
              <DeleteOutlined />
            </button>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center shadow-md">
              <PlusOutlined className="text-gray-400 text-xl" />
            </div>
            <span className="text-gray-400 text-sm font-medium">{t("add_image")}</span>
          </div>
        )}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-3 mt-6">
          {images.map((img, index) => (
            <div
              key={index}
              onClick={() => setSelectedIdx(index)}
              className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer border-2 transition-all ${
                selectedIdx === index ? 'border-blue-500 scale-95' : 'border-transparent'
              }`}
            >
              <img src={img} className="w-full h-full object-cover" alt="thumbnail" />
            </div>
          ))}

          <button
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center hover:bg-gray-100 transition group"
          >
            <div className="bg-white w-7 h-7 p-1 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition">
              <PlusOutlined className="text-gray-400" />
            </div>
            <span className="text-[10px] text-gray-400 mt-2 font-medium">{t("add_image")}</span>
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleAddImage}
      />
    </div>
  );
};

export default RegisterImagesPages;