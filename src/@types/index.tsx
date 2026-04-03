export interface CustomButtonProps {
  text: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  disabled?: boolean;
}

export interface ProfileType {
    phone_number: string
    role: string,
    profile: {
        full_name:string
        image:string[],
        cars:Car[]
}
}
export interface Car {
    id:number
    car_plate_number:string,
    released_year: number
    current_mileage:number
    vehicle_model: {
        id: number
        brand: {
            id: number
            name: string
        },
        model_name: string
        image:string
    }
}

export interface ProfileWorkshopType {
    phone_number: string
    role: string
    profile: {
        title: string
        address: string
        description: string
        working_time: string
        latitude: string
        longitude: string
        images: Array<{
            id: number
            image: string
        }>
    }
}
export interface CarAddType {
    id: string
    car_plate_number: string
    released_year: number
    current_mileage:string
    vehicle_model: {
        id: number,
        brand: {
           
            name: string
        },
        model_name:string,
        image:string
    }
}

export interface AllCarsType {
  id: number;
  car_plate_number: string;
  vehicle: {
    brand: string;
    model: string;
  };
  driver: {
    full_name: string;
    phone_number: string;
    image: string | null;
  };
}

export interface ServiceType {
  id: number;
  name: string;
  
}

export interface ImgType{
  id:number,
  image:string
}

export interface Workshop {
  id: number;
  title: string;
  address: string;
  phone_number: string;
  image: string;
  lat: number;  
  lng: number;
  images:ImgType[],
  latitude:string,
  longitude:string
  working_time:string
  description:string
  rating:number,
  total_customers:number
  
}

export interface LastServiceType {
  id: number;
  description: string;
  probeg: number;
  service_type: ServiceType;
  workshop: Workshop;
  phone_number: string;
  
}

export interface ServiceCategory {
  id: number;
  name: string;
}

export interface WorkshopType {
  id: number;
  title: string;
  address: string;
  phone_number: string;
  image: string;
  
}

export interface NotificatonType {
    id: number,
    description:string
    probeg:number,
    service_type: {
        id:number ,
        name:string
    },
    workshop:Workshop
}

