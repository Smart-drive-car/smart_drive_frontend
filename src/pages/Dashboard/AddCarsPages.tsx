import { LeftOutlined, PlusOutlined, RightOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CustomButton, CarManagement } from "../../components";
import type { FormEvent } from "react";
import axios from "axios";
import BASE_URL from "../../hooks/Env";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { DeleteIcon, EditIcon } from "../../assets/icons";
import type { Car, ProfileType } from "../../@types";

interface Brand {
  id: number;
  model_name: string;
  brand: {
    id: number;
    name: string;
  };
}

interface Errors {
  brand?: string;
  modelId?: string;
  year?: string;
  carNumber?: string;
  carProbeg?: string;
}

const AddCarsPages = () => {
  const { t } = useTranslation();
  const [modal, setModal] = useState<boolean>(false);
  const [editModal, setEditModal] = useState<boolean>(false);
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [carToDelete, setCarToDelete] = useState<number | null>(null);
  const [carToEdit, setCarToEdit] = useState<Car | null>(null);
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filteredModels, setFilteredModels] = useState<Brand[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);
  const [year, setYear] = useState<string>("");
  const [carNumber, setCarNumber] = useState<string>("");
  const [carProbeg, setCarProbeg] = useState<string>("");
  const [cars, setCars] = useState<Car[]>([]);
  const [deleteId,setDeleteId] = useState<number>(0)
  const [errors, setErrors] = useState<Errors>({});
  const [activeCar, setActiveCar] = useState<Car | null>(null);

  
  


  const token = Cookies.get("access_token");

  // all cars
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/auth/profile/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        console.log(res.data, "get");

        const profile: ProfileType = res.data;
        const formattedCars = profile.profile.cars.map((car: any) => ({
          id: car.id,
          car_plate_number: car.plate ?? car.car_plate_number,
          current_mileage: car.mileage ?? car.current_mileage,
          released_year: car.released_year,
          vehicle_model: {
            ...car.vehicle_model,
            image: car.vehicle_model.image.startsWith("http")
              ? car.vehicle_model.image // to'liq URL bo'lsa — o'zgartirilmaydi
              : `${BASE_URL}${car.vehicle_model.image}`,
          }, // qisqa bo'lsa — BASE_URL qo'shiladi
        }));
        console.log(formattedCars, "cars");

        setCars(formattedCars);
      });
  }, []);

  // Barcha modellarni yuklash
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/vehicles/models/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setBrands(res.data);
      });
  }, []);
  const handleBrandChange = (brandId: number) => {
    setSelectedBrandId(brandId);
    setSelectedModelId(null);
    const filtered = brands.filter((b) => b.brand.id === brandId);
    setFilteredModels(filtered);
    setErrors((prev) => ({ ...prev, brand: undefined }));
  };

  const formatMileage = (val: string | number) => {
    // Agar qiymat kelmasa, bo'sh qaytaramiz
    if (val === undefined || val === null) return "";

    // Qiymatni stringga o'tkazamiz va faqat raqamlarni olamiz
    const onlyNums = val.toString().replace(/\D/g, "");

    // Har 3 ta raqamdan keyin bo'sh joy qo'shamiz
    return onlyNums.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };
  const handleCarAdd = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const newErrors: Errors = {};

    if (!selectedBrandId) newErrors.brand = "Brendni tanlang";
    if (!selectedModelId) newErrors.modelId = "Mashina turini tanlang";

    const yearNum = Number(year);
    if (!year) {
      newErrors.year = "Yilni kiriting";
    } else if (yearNum < 1886 || yearNum > new Date().getFullYear()) {
      newErrors.year = `Yil 1886 - ${new Date().getFullYear()} oralig'ida bo'lishi kerak`;
    }

    const plateRegex = /^\d{2}[A-Z]\d{3}[A-Z]{2}$/;
    if (!carNumber) {
      newErrors.carNumber = "Mashina raqamini kiriting";
    } else if (!plateRegex.test(carNumber)) {
      newErrors.carNumber = "Format noto'g'ri! To'g'ri format: 01A123BC";
    }

    if (!carProbeg) newErrors.carProbeg = "Probegni kiriting";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    setErrors({});

    const data = {
      car_plate_number: carNumber,
      released_year: yearNum,
      current_mileage: Number(carProbeg.replace(/\s/g, "")),
      vehicle_model_id: selectedModelId,
    };

    console.log(data, "qo'shishdan oldingi");

    axios
      .post(`${BASE_URL}/api/vehicles/create/`, data, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        console.log(data, "keyingi");
        const newCars = [...cars, res.data];
        console.log("Backenddan qaytgan javob:", res.data);
        setCars(newCars);
        setModal(false);
        setLoading(false);
        toast.success("Mashina qo'shildi!");
        // Inputlarni tozalash
        setYear("");
        setCarNumber("");
        setCarProbeg("");
        setSelectedBrandId(null);
        setSelectedModelId(null);
        setFilteredModels([]);
      })
      .catch(() => {
        setLoading(false);
        toast.error("Xatolik yuz berdi");
      });
  };

  const handleDeleteCar = () => {
    console.log(deleteId);
    
    
    if (carToDelete === null) return;
    setLoading(true);

    axios
      .delete(`${BASE_URL}/api/vehicles/${deleteId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        console.log(res.data,"Ochiriligan");
        console.log(deleteId,"o'chirilgan id");
        
        setLoading(false);
        const updatedCars = cars.filter((car) => car.id !== deleteId);
        setCars(updatedCars);
        setDeleteModal(false);
        setCarToDelete(null);
        toast.success("Mashina o'chirildi!");
      })
      .catch(() => {
        toast.error("Xatolik yuz berdi");
      });
  };
  

  const handleCarEdit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (!carToEdit) return;

    const newErrors: Errors = {};

    if (!selectedBrandId) newErrors.brand = "Brendni tanlang";
    if (!selectedModelId) newErrors.modelId = "Mashina turini tanlang";

    const yearNum = Number(year);
    if (!year) {
      newErrors.year = "Yilni kiriting";
    } else if (yearNum < 1886 || yearNum > new Date().getFullYear()) {
      newErrors.year = `Yil 1886 - ${new Date().getFullYear()} oralig'ida bo'lishi kerak`;
    }

    const plateRegex = /^\d{2}[A-Z]\d{3}[A-Z]{2}$/;
    if (!carNumber) {
      newErrors.carNumber = "Mashina raqamini kiriting";
    } else if (!plateRegex.test(carNumber)) {
      newErrors.carNumber = "Format noto'g'ri! To'g'ri format: 01A123BC";
    }

    if (!carProbeg) newErrors.carProbeg = "Probegni kiriting";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    setErrors({});

    const data = {
      car_plate_number: carNumber,
      released_year: yearNum,
      current_mileage: Number(carProbeg.replace(/\s/g, "")),
      vehicle_model_id: selectedModelId,
    };
    console.log(data, "Update");

    axios
      .patch(`${BASE_URL}/api/vehicles/${carToEdit.id}/`, data, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const updatedCar = res.data;
        const updatedCarsList = cars.map((car) =>
          car.id === updatedCar.id ? { ...updatedCar } : car,
        );
        setCars([...updatedCarsList]);
        setEditModal(false);
        setCarToEdit(null);
        setLoading(false);
        toast.success("Mashina yangilandi!");
        // Inputlarni tozalash
        setYear("");
        setCarNumber("");
        setCarProbeg("");
        setSelectedBrandId(null);
        setSelectedModelId(null);
        setFilteredModels([]);
      })
      .catch(() => {
        setLoading(false);
        toast.error("Xatolik yuz berdi");
      });
  };

  // ================== EDIT MODAL OCHISH ==================
  const openEditModal = (car: Car) => {
    console.log("Backenddan kelgan ob'ekt:", car);
    if (!car) return;

    setCarToEdit(car);

    // 1. Yilni tekshirish (Eng ko'p xato shu yerda bo'ladi)
    // API dan released_year yoki year bo'lib kelishini tekshiramiz
    const rawYear = car.released_year || (car as any).year;

    if (rawYear) {
      setYear(String(rawYear)); // Raqam bo'lsa stringga o'tkazamiz
    } else {
      setYear(""); // Agar yil umuman yo'q bo'lsa bo'sh qoldiramiz
    }

    // 2. Mashina raqami
    setCarNumber(car.car_plate_number || "");

    // 3. Probeg (Sizda bu qism ishlayotgan edi)
    const mileage = car.current_mileage ?? 0;
    setCarProbeg(formatMileage(mileage));

    // 4. Brend va Model mantiqi
    const brandId = car.vehicle_model?.brand?.id;
    if (brandId) {
      setSelectedBrandId(brandId);

      // Modellarni filtrlab olamiz
      const filtered = brands.filter((b) => b.brand.id === brandId);
      setFilteredModels(filtered);

      // Mashina modelini tanlaymiz
      setSelectedModelId(car.vehicle_model?.id || null);
    } else {
      setSelectedBrandId(null);
      setFilteredModels([]);
      setSelectedModelId(null);
    }

    // 5. Modalni ochish
    setEditModal(true);
  };
  const openDeleteModal = (carId: number) => {
    console.log(carId);
    
    setCarToDelete(carId);
    setDeleteModal(true);
  };

  return (
    <>
      <section className="px-4 pt-4 rounded-[20px] bg-[#F5F6F9] overflow-y-auto h-[30%] custom-scrollbar">
        <div className="flex items-start justify-between">
          <CarManagement
            cars={cars}
            onCarSelect={(car) => {
              setActiveCar(car); 
              setDeleteId( car.id); 
            }}
          />
          <div className="flex flex-col justify-end items-end">
            <button
              onClick={() => setModal(true)}
              className="text-[#1E5DE5] bg-[#E4ECFE] rounded-[50px] py-2.5 flex items-center gap-2 pl-4 pr-2.5 cursor-pointer"
            >
              <span className="text-[#1E5DE5]">{t("add_car")}</span>
              <PlusOutlined className="w-3 h-3" />
            </button>
            <div className="flex items-center gap-4 mt-5">
              <button
                className="cursor-pointer"
                onClick={() => activeCar && openEditModal(activeCar)}
              >
                <EditIcon />
              </button>
              <button
                className="cursor-pointer"
                onClick={() => cars.length > 0 && openDeleteModal(cars[0].id)}
              >
                <DeleteIcon />
              </button>
            </div>
          </div>
        </div>
      </section>

      {modal && (
        <>
          <div className="fixed inset-0 backdrop-blur-md bg-black/40 z-40" />
          <div className="w-110 max-h-[90vh] overflow-y-auto mx-auto mt-15 rounded-[20px] p-4 bg-[#FFFFFF] fixed inset-0 z-50 custom-scrollbar">
            <div className="flex items-center gap-3">
              <div
                onClick={() => setModal(false)}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-[#F5F6F9] cursor-pointer"
              >
                <LeftOutlined className="w-2" />
              </div>
              <strong className="text-[#2D2D2D] font-medium">
                Mashina qo'shish
              </strong>
            </div>

            <form
              onSubmit={handleCarAdd}
              className="flex flex-col gap-4 w-full mt-5"
            >
              {/* Brend */}
              <label className="relative">
                <span
                  className={`block mb-1.5 pl-3 text-[12px] ${errors.brand ? "text-red-500" : "text-[#2D2D2D]"}`}
                >
                  Mashina brendini kiriting*
                </span>
                <select
                  value={selectedBrandId ?? ""}
                  onChange={(e) => handleBrandChange(Number(e.target.value))}
                  className={`w-full py-3 pl-4 rounded-4xl bg-[#F5F6F9] outline-none appearance-none cursor-pointer ${errors.brand ? "border border-red-500" : ""}`}
                >
                  <option value="">Tanlang</option>
                  {/* Takrorlanmasin deb unique brendlar */}
                  {[
                    ...new Map(
                      brands.map((b) => [b.brand.id, b.brand]),
                    ).values(),
                  ].map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
                {errors.brand && (
                  <p className="text-red-500 text-[11px] pl-3 mt-1">
                    {errors.brand}
                  </p>
                )}
                <RightOutlined className="w-2 h-2 absolute right-3 top-10.5 pointer-events-none" />
              </label>

              {/* Model (tur) */}
              <label className="relative">
                <span
                  className={`block mb-1.5 pl-3 text-[12px] ${errors.modelId ? "text-red-500" : "text-[#2D2D2D]"}`}
                >
                  Mashina turini kiriting*
                </span>
                <select
                  value={selectedModelId ?? ""}
                  onChange={(e) => {
                    setSelectedModelId(Number(e.target.value));
                    setErrors((prev) => ({ ...prev, modelId: undefined }));
                  }}
                  disabled={!selectedBrandId}
                  className={`w-full py-3 pl-4 rounded-4xl bg-[#F5F6F9] outline-none appearance-none cursor-pointer disabled:opacity-50 ${errors.modelId ? "border border-red-500" : ""}`}
                >
                  <option value="">Tanlang</option>
                  {filteredModels.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.model_name}
                    </option>
                  ))}
                </select>
                {errors.modelId && (
                  <p className="text-red-500 text-[11px] pl-3 mt-1">
                    {errors.modelId}
                  </p>
                )}
                <RightOutlined className="w-2 h-2 absolute right-3 top-10.5 pointer-events-none" />
              </label>

              {/* Yil */}
              <label className="relative">
                <span
                  className={`block mb-1.5 pl-3 text-[12px] ${errors.year ? "text-red-500" : "text-[#2D2D2D]"}`}
                >
                  Chiqgan yilini kiriting*
                </span>
                <input
                  value={year}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                    setYear(val);
                    setErrors((prev) => ({ ...prev, year: undefined }));
                  }}
                  type="text"
                  inputMode="numeric"
                  placeholder="2022"
                  maxLength={4}
                  className={`w-full py-3 pl-4 rounded-4xl bg-[#F5F6F9] outline-none ${errors.year ? "border border-red-500" : ""}`}
                />
                {errors.year && (
                  <p className="text-red-500 text-[11px] pl-3 mt-1">
                    {errors.year}
                  </p>
                )}
                <RightOutlined className="w-2 h-2 absolute right-3 top-10.5" />
              </label>

              {/* Mashina raqami */}
              <label className="relative">
                <span
                  className={`block mb-1.5 pl-3 text-[12px] ${errors.carNumber ? "text-red-500" : "text-[#2D2D2D]"}`}
                >
                  Mashina raqamini kiriting*
                  <span className="text-gray-400 ml-1">(01A123BC)</span>
                </span>
                <input
                  value={carNumber}
                  onChange={(e) => {
                    const val = e.target.value
                      .toUpperCase()
                      .replace(/[^A-Z0-9]/g, "")
                      .slice(0, 8);
                    setCarNumber(val);
                    setErrors((prev) => ({ ...prev, carNumber: undefined }));
                  }}
                  type="text"
                  placeholder="01A123BC"
                  maxLength={8}
                  className={`w-full py-3 pl-4 rounded-4xl bg-[#F5F6F9] outline-none ${errors.carNumber ? "border border-red-500" : ""}`}
                />
                {errors.carNumber && (
                  <p className="text-red-500 text-[11px] pl-3 mt-1">
                    {errors.carNumber}
                  </p>
                )}
                <RightOutlined className="w-2 h-2 absolute right-3 top-10.5" />
              </label>

              {/* Probeg */}
              <label className="relative">
                <span
                  className={`block mb-1.5 pl-3 text-[12px] ${errors.carProbeg ? "text-red-500" : "text-[#2D2D2D]"}`}
                >
                  Mashinaning umumiy probegi*
                </span>
                <input
                  value={carProbeg}
                  onChange={(e) => {
                    const formatted = formatMileage(e.target.value);
                    setCarProbeg(formatted);
                    setErrors((prev) => ({ ...prev, carProbeg: undefined }));
                  }}
                  type="text"
                  inputMode="numeric"
                  placeholder="100 000"
                  className={`w-full py-3 pl-4 rounded-4xl bg-[#F5F6F9] outline-none ${errors.carProbeg ? "border border-red-500" : ""}`}
                />
                {errors.carProbeg && (
                  <p className="text-red-500 text-[11px] pl-3 mt-1">
                    {errors.carProbeg}
                  </p>
                )}
                <RightOutlined className="w-2 h-2 absolute right-3 top-10.5" />
              </label>

              <CustomButton
                type="submit"
                text={loading ? "Saqlash..." : "Saqlash"}
                className="rounded-4xl! bg-[#1E5DE5]!"
              />
            </form>
          </div>
        </>
      )}

      {/* Edit Modal */}
      {editModal && (
        <>
          <div className="fixed inset-0 backdrop-blur-md bg-black/40 z-40" />
          <div className="w-110 h-auto max-h-[90vh] overflow-y-auto mx-auto mt-15 rounded-[20px] p-4 bg-[#FFFFFF] fixed inset-0 z-50 custom-scrollbar">
            <div className="flex items-center gap-3">
              <div
                onClick={() => setEditModal(false)}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-[#F5F6F9] cursor-pointer"
              >
                <LeftOutlined className="w-2" />
              </div>
              <strong className="text-[#2D2D2D] font-medium">
                Mashinani tahrirlash
              </strong>
            </div>

            <form
              onSubmit={handleCarEdit}
              className="flex flex-col gap-4 w-full mt-5"
            >
              {/* Brend */}
              <label className="relative">
                <span
                  className={`block mb-1.5 pl-3 text-[12px] ${errors.brand ? "text-red-500" : "text-[#2D2D2D]"}`}
                >
                  Mashina brendini kiriting*
                </span>
                <select
                  value={selectedBrandId ?? ""}
                  onChange={(e) => handleBrandChange(Number(e.target.value))}
                  className={`w-full py-3 pl-4 rounded-4xl bg-[#F5F6F9] outline-none appearance-none cursor-pointer ${errors.brand ? "border border-red-500" : ""}`}
                >
                  <option value="">Tanlang</option>
                  {[
                    ...new Map(
                      brands.map((b) => [b.brand.id, b.brand]),
                    ).values(),
                  ].map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
                {errors.brand && (
                  <p className="text-red-500 text-[11px] pl-3 mt-1">
                    {errors.brand}
                  </p>
                )}
                <RightOutlined className="w-2 h-2 absolute right-3 top-10.5 pointer-events-none" />
              </label>

              {/* Model (tur) */}
              <label className="relative">
                <span
                  className={`block mb-1.5 pl-3 text-[12px] ${errors.modelId ? "text-red-500" : "text-[#2D2D2D]"}`}
                >
                  Mashina turini kiriting*
                </span>
                <select
                  value={selectedModelId ?? ""}
                  onChange={(e) => {
                    setSelectedModelId(Number(e.target.value));
                    setErrors((prev) => ({ ...prev, modelId: undefined }));
                  }}
                  disabled={!selectedBrandId}
                  className={`w-full py-3 pl-4 rounded-4xl bg-[#F5F6F9] outline-none appearance-none cursor-pointer disabled:opacity-50 ${errors.modelId ? "border border-red-500" : ""}`}
                >
                  <option value="">Tanlang</option>
                  {filteredModels.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.model_name}
                    </option>
                  ))}
                </select>
                {errors.modelId && (
                  <p className="text-red-500 text-[11px] pl-3 mt-1">
                    {errors.modelId}
                  </p>
                )}
                <RightOutlined className="w-2 h-2 absolute right-3 top-10.5 pointer-events-none" />
              </label>

              {/* Yil */}
              <label className="relative">
                <span
                  className={`block mb-1.5 pl-3 text-[12px] ${errors.year ? "text-red-500" : "text-[#2D2D2D]"}`}
                >
                  Chiqgan yilini kiriting*
                </span>
                <input
                  value={year}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                    setYear(val);
                    setErrors((prev) => ({ ...prev, year: undefined }));
                  }}
                  type="text"
                  inputMode="numeric"
                  placeholder="2022"
                  maxLength={4}
                  className={`w-full py-3 pl-4 rounded-4xl bg-[#F5F6F9] outline-none ${errors.year ? "border border-red-500" : ""}`}
                />
                {errors.year && (
                  <p className="text-red-500 text-[11px] pl-3 mt-1">
                    {errors.year}
                  </p>
                )}
                <RightOutlined className="w-2 h-2 absolute right-3 top-10.5" />
              </label>

              {/* Mashina raqami */}
              <label className="relative">
                <span
                  className={`block mb-1.5 pl-3 text-[12px] ${errors.carNumber ? "text-red-500" : "text-[#2D2D2D]"}`}
                >
                  Mashina raqamini kiriting*
                  <span className="text-gray-400 ml-1">(01A123BC)</span>
                </span>
                <input
                  value={carNumber}
                  onChange={(e) => {
                    const val = e.target.value
                      .toUpperCase()
                      .replace(/[^A-Z0-9]/g, "")
                      .slice(0, 8);
                    setCarNumber(val);
                    setErrors((prev) => ({ ...prev, carNumber: undefined }));
                  }}
                  type="text"
                  placeholder="01A123BC"
                  maxLength={8}
                  className={`w-full py-3 pl-4 rounded-4xl bg-[#F5F6F9] outline-none ${errors.carNumber ? "border border-red-500" : ""}`}
                />
                {errors.carNumber && (
                  <p className="text-red-500 text-[11px] pl-3 mt-1">
                    {errors.carNumber}
                  </p>
                )}
                <RightOutlined className="w-2 h-2 absolute right-3 top-10.5" />
              </label>

              {/* Probeg */}
              <label className="relative">
                <span
                  className={`block mb-1.5 pl-3 text-[12px] ${errors.carProbeg ? "text-red-500" : "text-[#2D2D2D]"}`}
                >
                  Mashinaning umumiy probegi*
                </span>
                <input
                  value={carProbeg}
                  onChange={(e) => {
                    const formatted = formatMileage(e.target.value);
                    setCarProbeg(formatted);
                    setErrors((prev) => ({ ...prev, carProbeg: undefined }));
                  }}
                  type="text"
                  inputMode="numeric"
                  placeholder="100 000"
                  className={`w-full py-3 pl-4 rounded-4xl bg-[#F5F6F9] outline-none ${errors.carProbeg ? "border border-red-500" : ""}`}
                />
                {errors.carProbeg && (
                  <p className="text-red-500 text-[11px] pl-3 mt-1">
                    {errors.carProbeg}
                  </p>
                )}
                <RightOutlined className="w-2 h-2 absolute right-3 top-10.5" />
              </label>

              <CustomButton
                type="submit"
                text={loading ? "Yangilash..." : "Yangilash"}
                className="rounded-4xl! bg-[#1E5DE5]!"
              />
            </form>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <>
          <div className="fixed inset-0 backdrop-blur-md bg-black/40 z-40" />
          <div className="flex items-center h-screen ">
            <div className="w-96 h-70 mx-auto mt-50 rounded-[20px] p-6 bg-[#FFFFFF] fixed inset-0 z-50 flex flex-col items-center justify-center ">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                Rostdan ham ushbu mashinani o'chirmoqchimisiz?
              </h2>
              <p className="text-gray-600 text-center mb-6">
                O'chirganingizdan so'ng uni qayta tiklay olmaysiz.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setDeleteModal(false);
                    setCarToDelete(null);
                  }}
                  className="px-6 py-2.5 cursor-pointer rounded-4xl  text-[#2D2D2D] font-medium bg-[#F5F6F9] transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleDeleteCar}
                  className="px-6 py-2.5 cursor-pointer rounded-4xl bg-[#D423231A]  font-medium text-[#D42323] transition-colors"
                >
                  {loading ? "O'chirish..." : "O'chirish"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default AddCarsPages;
