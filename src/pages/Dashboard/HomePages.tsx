import { useTranslation } from "react-i18next";

const HomePages = () => {
  const { t } = useTranslation();
  return (
    <div>
      {t("home")}
    </div>
  )
}

export default HomePages
