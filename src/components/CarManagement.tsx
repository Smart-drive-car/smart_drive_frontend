import { useState, useEffect } from "react";

interface Car {
  id: number;
  car_plate_number: string;
  released_year: number;
  current_mileage: number;
  vehicle_model: {
    id: number; // ← bu yo'q edi, qo'shing
    brand: {
      id: number; // ← bu yo'q edi, qo'shing
      name: string;
    };
    model_name: string;
    image: string;
  };
}

interface CarManagementProps {
  cars: Car[];
  onCarSelect?: (car: Car) => void;
}

const CarManagement = ({ cars = [], onCarSelect }: CarManagementProps) => {
  const [selectedCar, setSelectedCar] = useState<Car | null>(
    cars.length > 0 ? cars[0] : null,
  );

  useEffect(() => {
    if (cars.length > 0 && !selectedCar) {
      const firstCar = cars[0];
      setSelectedCar(firstCar);
      onCarSelect?.(firstCar); // Ota komponentga 1-mashinani yubordik
    }
  }, [cars]);

// new update car 
  useEffect(() => {
  if (selectedCar && cars.length > 0) {
    const freshData = cars.find(c => c.id === selectedCar.id);
    if (freshData) {
      setSelectedCar({ ...freshData }); // 
    }
  }
}, [cars]);
  const formatCarNumber = (plateNumber: string) => {
    if (plateNumber.length >= 2) {
      return `${plateNumber.slice(0, 2)} ${plateNumber.slice(2, 3)}${plateNumber.slice(3, 6)} ${plateNumber.slice(6)}`;
    }
    return plateNumber;
  };

  const formatMileage = (mileage: number) => {
    return mileage.toLocaleString();
  };

  const calculateRemaining = (currentMileage: number) => {
    const totalServiceMileage = 50000;
    const remaining =
      totalServiceMileage - (currentMileage % totalServiceMileage);
    return remaining;
  };

  const getNextService = (currentMileage: number) => {
    const totalServiceMileage = 50000;
    const nextService =
      Math.ceil((currentMileage + 1) / totalServiceMileage) *
      totalServiceMileage;
    return nextService;
  };

  // Update selected car when cars array changes
  useEffect(() => {
    if (cars.length === 0) {
      setSelectedCar(null);
    } else if (!selectedCar || !cars.find((car) => car.id === selectedCar.id)) {
      setSelectedCar(cars[0]);
    }
  }, [cars, selectedCar]);

  return (
    <>
      <section className=" rounded-[20px] bg-[#F5F6F9] ">
        {/* Car Tabs */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 ">
            {cars.map((car) => (
              <button
                key={car.id}
                onClick={() => {
                  setSelectedCar(car);
                  onCarSelect?.(car);
                }}
                className={`py-2.5 px-4 rounded-[20px] flex items-center gap-2 whitespace-nowrap transition-colors ${
                  selectedCar?.id === car.id
                    ? "bg-[#1E5DE5] text-white"
                    : "bg-[#E4ECFE] text-[#1E5DE5]"
                }`}
              >
                <span className="font-medium">
                  {car.vehicle_model.model_name}
                </span>
                <span className="opacity-75">
                  {formatCarNumber(car.car_plate_number)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Car Details */}
        {selectedCar && (
          <div className=" rounded-[20px] p-6 w-full">
            <div className="flex items-center justify-between w-full">
              {/* Car Image */}
              <div className="">
                <img
                  src={`${selectedCar.vehicle_model.image}?t=${new Date().getTime()}`}
                  alt={selectedCar.vehicle_model.model_name}
                  className="w-110   object-cover rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='192' height='128' viewBox='0 0 192 128'%3E%3Crect width='192' height='128' fill='%23F5F6F9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='14' fill='%23999'%3ECar Image%3C/text%3E%3C/svg%3E";
                  }}
                  width={400}
                  height={100}
                />
                <div className="flex items-center justify-between px-15 mt-5.5">
                  <p className="font-semibold text-gray-800 mb-1">
                    {selectedCar.vehicle_model.brand.name}
                  </p>

                  {/* O'zbekiston davlat raqami */}
                  <div className="inline-flex items-center border-2 border-black rounded-md overflow-hidden text-black font-bold">
                    {/* Chap - region raqami */}
                    <div className="px-2 py-1 border-r-2 border-black text-sm">
                      {selectedCar.car_plate_number.slice(0, 2)}
                    </div>

                    {/* O'rta - asosiy raqam */}
                    <div className="px-3 py-1 text-xl tracking-widest border-r-2 border-black">
                      {selectedCar.car_plate_number.slice(2, 3)}{" "}
                      {selectedCar.car_plate_number.slice(3, 6)}{" "}
                      {selectedCar.car_plate_number.slice(6, 8)}
                    </div>

                    {/* O'ng - bayroq va UZ */}
                    <div className="flex flex-col items-center justify-center px-1.5 py-0.5 gap-0.5">
                      {/* O'zbekiston bayrog'i */}
                      <div className="flex flex-col w-6 h-3.5 rounded-sm overflow-hidden">
                        <div className="flex-1 bg-[#1EB6EA]" />
                        <div className="flex-1 bg-white" />
                        <div className="flex-1 bg-[#2ECC71]" />
                      </div>
                      <span className="text-[9px] font-bold leading-none">
                        UZ
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Car Info */}
              <div className="flex-1">
                {/* Stats */}
                {/* Stats */}
                <div className="flex flex-col items-center gap-4">
                  {/* Yarım doira */}
                  <div className="relative w-64 h-36 overflow-hidden">
                    <svg viewBox="0 0 200 100" className="w-full h-full">
                      {/* Fon yarım doira */}
                      <path
                        d="M 10,100 A 90,90 0 0,1 190,100"
                        stroke="#E4ECFE"
                        strokeWidth="18"
                        fill="none"
                        strokeLinecap="round"
                      />
                      {/* Progress yarım doira */}
                      <path
                        d="M 10,100 A 90,90 0 0,1 190,100"
                        stroke="#1E5DE5"
                        strokeWidth="18"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${(selectedCar.current_mileage / 50000) * 283} 283`}
                      />
                    </svg>

                    {/* Matn */}
                    <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
                      <span className="text-gray-400 text-sm">Yurildi:</span>
                      <span className="text-[#1E5DE5] text-2xl font-bold">
                        {formatMileage(selectedCar.current_mileage)}km
                      </span>
                    </div>
                  </div>

                  {/* Qoldi va Keyingi servis */}
                  <div className="w-64 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-sm">Qoldi:</span>
                      <span className="font-semibold text-gray-800">
                        {formatMileage(
                          calculateRemaining(selectedCar.current_mileage),
                        )}
                        km
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-sm">
                        Keyingi servis
                      </span>
                      <span className="font-semibold text-gray-800">
                        {formatMileage(
                          getNextService(selectedCar.current_mileage),
                        )}
                        km
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No Cars State */}
        {cars.length === 0 && <div className="flex items-center justify-center">
             
          </div>}
      </section>
    </>
  );
};

export default CarManagement;
