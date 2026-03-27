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
        cars:string[]
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