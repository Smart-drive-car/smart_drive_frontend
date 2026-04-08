import { useState, useEffect } from "react";
import type { Car } from "../@types";
import { useTranslation } from "react-i18next";
;

interface CarManagementProps {
  cars: Car[];
  onCarSelect?: (car: Car) => void;
}

const CarManagement = ({ cars = [], onCarSelect }: CarManagementProps) => {
  const [selectedCar, setSelectedCar] = useState<Car | null>(
    cars.length > 0 ? cars[0] : null
  );
  const {t} = useTranslation()

  useEffect(() => {
    if (cars.length > 0 && !selectedCar) {
      const firstCar = cars[0];
      setSelectedCar(firstCar);
      onCarSelect?.(firstCar);
    }
  }, [cars]);

  useEffect(() => {
    if (selectedCar && cars.length > 0) {
      const freshData = cars.find((c) => c.id === selectedCar.id);
      if (freshData) {
        setSelectedCar({ ...freshData });
      }
    }
  }, [cars]);

  useEffect(() => {
    if (cars.length === 0) {
      setSelectedCar(null);
    } else if (!selectedCar || !cars.find((car) => car.id === selectedCar.id)) {
      setSelectedCar(cars[0]);
    }
  }, [cars, selectedCar]);

  const formatCarNumber = (plateNumber: string) => {
    if (plateNumber.length >= 2) {
      return `${plateNumber.slice(0, 2)} ${plateNumber.slice(2, 3)}${plateNumber.slice(3, 6)} ${plateNumber.slice(6)}`;
    }
    return plateNumber;
  };

  return (
    <section className="rounded-[20px] bg-[#F5F6F9]">
      {/* Car Tabs */}
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

      {/* Selected Car Details */}
      {selectedCar && (
        <div className="rounded-[20px]">
          <div className="flex items-center justify-between">
            {/* Car Image and Plate */}
            <div>
              <img
                src={`${selectedCar.vehicle_model.image}?t=${new Date().getTime()}`}
                alt={selectedCar.vehicle_model.model_name}
                className="w-110 object-cover rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "data:image/svg+xml,..."; 
                }}
                width={400}
                height={100}
              />
              <div className="flex items-center justify-between px-15 mt-5.5">
                <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-800 mb-1">
                        {selectedCar.vehicle_model.brand.name}
                      </p>
                      <p  className="font-semibold text-gray-800 mb-1 mr-10">
                        {selectedCar.vehicle_model.model_name}
                      </p>

                </div>

                <div className="inline-flex items-center border-2 border-black rounded-md overflow-hidden text-black font-bold bg-white">
                  <div className="px-2 py-1 border-r-2 border-black text-sm">
                    {selectedCar.car_plate_number.slice(0, 2)}
                  </div>
                  <div className="px-3 py-1 text-xl tracking-widest border-r-2 border-black">
                    {selectedCar.car_plate_number.slice(2, 3)}{" "}
                    {selectedCar.car_plate_number.slice(3, 6)}{" "}
                    {selectedCar.car_plate_number.slice(6, 8)}
                  </div>
                  <div className="flex flex-col items-center justify-center px-1.5 py-0.5 gap-0.5">
                    <div className="flex flex-col w-6 h-3.5 rounded-sm overflow-hidden">
                      <div className="flex-1 bg-[#1EB6EA]" />
                      <div className="flex-1 bg-white" />
                      <div className="flex-1 bg-[#2ECC71]" />
                    </div>
                    <span className="text-[9px] font-bold leading-none">UZ</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Gauge and Stats */}
            <div className="flex-1 relative left-65">
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-64 h-36 overflow-hidden">
                  {(() => {
                    const traveled = selectedCar?.service_status?.distance_traveled || 0;
                    const nextService = selectedCar?.service_status?.next_service_at || 0;
                    const remaining = selectedCar?.service_status?.remaining_distance || 0;

                    const hasService = nextService > 0;
                    const percentage = hasService ? Math.min((traveled / nextService) * 100, 100) : 0;
                    const strokeLength = 282.7;
                    const offset = strokeLength - (percentage / 100) * strokeLength;

                    let strokeColor = "#1E5DE5";
                    if (hasService) {
                      if (percentage >= 90 || remaining < 500) strokeColor = "#EF4444";
                      else if (percentage >= 75 || remaining < 1500) strokeColor = "#F59E0B";
                    }

                    return (
                      <>
                        <svg viewBox="0 0 200 100" className="w-full h-full">
                          <path
                            d="M 10,100 A 90,90 0 0,1 190,100"
                            stroke="#E4ECFE"
                            strokeWidth="18"
                            fill="none"
                            strokeLinecap="round"
                          />
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
                            {traveled.toLocaleString()} km
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </div>

                <div className="w-64 flex flex-col gap-2">
                  {(() => {
                    const remaining = selectedCar?.service_status?.remaining_distance || 0;
                    const nextService = selectedCar?.service_status?.next_service_at || 0;
                    const hasService = nextService > 0;

                    return (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 text-sm">{t("qoldi")}</span>
                          <span className={`font-semibold ${hasService && remaining < 500 ? "text-red-500" : "text-gray-800"}`}>
                            {remaining.toLocaleString()} km
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 text-sm">{t("keyingi_servis")}</span>
                          <span className="font-semibold text-gray-800">
                            {nextService.toLocaleString()} km
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