import { toast } from "react-toastify";
import BASE_URL from "../../hooks/Env";
import axios from "axios";
import Cookies from "js-cookie";

export interface WorkshopRegisterData {
  phone_number: string;
  password: string;
  password_confirm: string;
  role: string;
  full_name?: string;
  image?: File;
  title?: string;
  address?: string;
  description?: string;
  working_time?: string;
  latitude?: string;
  longitude?: string;
  workshop_images?: File[];
}

export interface WorkshopRegisterResponse {
  success: boolean;
  message?: string;
  data?: {
    id: number;
    phone_number: string;
    role: string;
    full_name?: string;
  };
  token?: string;
}

export const registerWorkshop = async (
  data: WorkshopRegisterData,
  t: (key: string) => string  // <-- tashqaridan qabul qilinadi
): Promise<WorkshopRegisterResponse> => {
  try {
    const formData = new FormData();

    formData.append('phone_number', data.phone_number);
    formData.append('password', data.password);
    formData.append('password_confirm', data.password_confirm);
    formData.append('role', data.role);

    if (data.full_name) formData.append('full_name', data.full_name);
    if (data.title) formData.append('title', data.title);
    if (data.address) formData.append('address', data.address);
    if (data.description) formData.append('description', data.description);
    if (data.working_time) formData.append('working_time', data.working_time);
    if (data.latitude) formData.append('latitude', data.latitude);
    if (data.longitude) formData.append('longitude', data.longitude);

    if (data.image) formData.append('image', data.image);
    if (data.workshop_images) {
      data.workshop_images.forEach((img) => {
        formData.append('workshop_images', img);
      });
    }

    const response = await axios.post(`${BASE_URL}/api/auth/register/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log(response.data.user);
    
      Cookies.set("access_token",response.data.tokens.access);
       localStorage.setItem("role",response.data.user.role),
      
    toast.success(t("muvaffaqqiyatli_otildi"));

    return response.data;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Workshop registration error:", error.response?.data);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
    console.error("Workshop registration error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};