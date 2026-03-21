import type { CustomButtonProps } from "../@types"


const CustomButton = ({ text, onClick, type = "button", className, disabled }: CustomButtonProps) => {
  return (
    <button

      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 bg-blue-500 text-white rounded cursor-pointer    ${className}`}
    >
      {text}
    </button>
  )
}

export default CustomButton