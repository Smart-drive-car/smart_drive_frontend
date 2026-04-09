import { useState, useEffect, useContext } from "react";
import type { Car } from "../@types";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../context/UseContext";

interface CarManagementProps {
  cars: Car[];
  onCarSelect?: (car: Car) => void;
}

const CarManagement = ({ cars = [], onCarSelect }: CarManagementProps) => {
  const [selectedCar, setSelectedCar] = useState<Car | null>(
    cars.length > 0 ? cars[0] : null
  );
  const { t } = useTranslation();
  const { probeg } = useContext(AuthContext)!;

  useEffect(() => {
    if (cars.length > 0) {
      if (!selectedCar) {
        setSelectedCar(cars[0]);
        onCarSelect?.(cars[0]);
      } else {
        const freshData = cars.find((c) => c.id === selectedCar.id);
        if (freshData) {
          setSelectedCar({ ...freshData });
        }
      }
    } else {
      setSelectedCar(null);
    }
  }, [cars]);

  const formatCarNumber = (plateNumber: string) => {
    if (plateNumber.length >= 2) {
      return `${plateNumber.slice(0, 2)} ${plateNumber.slice(2, 3)}${plateNumber.slice(3, 6)} ${plateNumber.slice(6)}`;
    }
    return plateNumber;
  };

  return (
    <section className="rounded-[20px] bg-[#F5F6F9] p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {cars.map((car) => (
            <button
              key={car.id}
              onClick={() => {
                setSelectedCar(car);
                onCarSelect?.(car);
              }}
              className={`py-2.5 px-4 rounded-[20px] flex items-center gap-2 whitespace-nowrap cursor-pointer transition-colors ${
                selectedCar?.id === car.id
                  ? "bg-[#E4ECFE] text-[#1E5DE5]"
                  : "text-[#7B7B7B]"
              }`}
            >
              <span className="font-medium">{car.vehicle_model.model_name}</span>
              <span className="opacity-75">{formatCarNumber(car.car_plate_number)}</span>
            </button>
          ))}
        </div>
      </div>

      {selectedCar && (
        <div className="rounded-[20px]">
          <div className="flex items-center justify-between">
            <div>
              <img
                src={`${selectedCar.vehicle_model.image}?t=${new Date().getTime()}`}
                alt={selectedCar.vehicle_model.model_name}
                className="w-110 object-cover rounded-lg"
              />
              <div className="flex items-center justify-between px-15 mt-5.5">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-800 mb-1">{selectedCar.vehicle_model.brand.name}</p>
                  <p className="font-semibold text-gray-800 mb-1 mr-10">{selectedCar.vehicle_model.model_name}</p>
                </div>
                <div className="inline-flex items-center border-2 border-black rounded-md overflow-hidden text-black font-bold bg-white">
                  <div className="px-2 py-1 border-r-2 border-black text-sm">{selectedCar.car_plate_number.slice(0, 2)}</div>
                  <div className="px-3 py-1 text-xl tracking-widest border-r-2 border-black">
                    {selectedCar.car_plate_number.slice(2, 5)} {selectedCar.car_plate_number.slice(5, 8)}
                  </div>
                  <div className="flex flex-col items-center justify-center px-1.5 py-0.5 gap-0.5">
                    <div className="flex flex-col w-6 h-3.5 rounded-sm overflow-hidden">
                      <div className="flex-1 bg-[#1EB6EA]" /><div className="flex-1 bg-white" /><div className="flex-1 bg-[#2ECC71]" />
                    </div>
                    <span className="text-[9px] font-bold leading-none">UZ</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 relative left-65">
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-64 h-36 overflow-hidden">
                  {(() => {
                    const totalTraveled = selectedCar?.service_status?.distance_traveled || 0;
                    const remaining = selectedCar?.service_status?.remaining_distance || 0;
                    // AGAR probeg kiritilmagan bo'lsa, interval 0 bo'ladi
                    const interval = probeg > 0 ? probeg : 0;

                    // Yangi moshina holati (hamma narsa 0 bo'lganda)
                    const isBrandNew = totalTraveled === 0 && interval === 0;

                    // Muddati o'tgan (faqat kiritilgan intervaldan oshsa)
                    const isOverdue = interval > 0 && totalTraveled >= interval;

                    // Progress foizi: yangi moshina bo'lsa 0 bo'lib turadi
                    const percentage = isOverdue ? 100 : (interval === 0 ? 0 : Math.min(100, Math.max(0, (totalTraveled / interval) * 100)));

                    const strokeLength = 282.7;
                    const offset = strokeLength - (percentage / 100) * strokeLength;

                    let strokeColor = "#1E5DE5"; // Ko'k (Default)
                    if (isOverdue) {
                      strokeColor = "#EF4444"; // Qizil
                    } else if (!isBrandNew && remaining < 3000 && interval > 0) {
                      strokeColor = "#F59E0B"; // Sariq
                    }

                    return (
                      <>
                        <svg viewBox="0 0 200 100" className="w-full h-full">
                          <path d="M 10,100 A 90,90 0 0,1 190,100" stroke="#E4ECFE" strokeWidth="18" fill="none" strokeLinecap="round" />
                          <path
                            d="M 10,100 A 90,90 0 0,1 190,100"
                            stroke={strokeColor}
                            strokeWidth="18"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={strokeLength}
                            strokeDashoffset={offset}
                            className="transition-all duration-1000 ease-out"
                            style={{ transitionProperty: "stroke-dashoffset, stroke" }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
                          <span className="text-gray-400 text-sm">{t("yurildi")}</span>
                          <span className="text-[36px] font-medium transition-colors duration-500" style={{ color: strokeColor }}>
                            {totalTraveled.toLocaleString()} km
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </div>

                <div className="w-64 flex flex-col gap-2">
                  {(() => {
                    const totalTraveled = selectedCar?.service_status?.distance_traveled || 0;
                    const remaining = selectedCar?.service_status?.remaining_distance || 0;
                    const interval = probeg > 0 ? probeg : 0;

                    const isBrandNew = totalTraveled === 0 && interval === 0;
                    const isOverdue = interval > 0 && totalTraveled >= interval;
                    
                    let textColor = "text-gray-800";
                    if (isOverdue) textColor = "text-red-500";

                    return (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 text-sm">{t("qoldi")}</span>
                          <span className={`font-semibold ${textColor}`}>
                            {isOverdue 
                              ? t("muddati_o'tgan") 
                              : isBrandNew 
                                ? `0 km` 
                                : `${remaining.toLocaleString()} km`}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 text-sm">{t("keyingi_servis")}</span>
                          <span className="font-semibold text-gray-800">
                            {interval.toLocaleString()} km
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CarManagement;