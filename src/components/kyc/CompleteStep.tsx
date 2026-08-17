import { useTranslation } from "react-i18next";

interface CompleteStepProps {
  onComplete: () => void;
}

export default function CompleteStep({ onComplete }: CompleteStepProps) {
  const { t } = useTranslation("onboarding");
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="w-full max-w-md text-center">
        <div className="text-7xl mb-6">✅</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">{t("complete.title")}</h1>
        <p className="text-gray-600 text-lg mb-10">
          {t("complete.description")}
        </p>
        <button
          onClick={onComplete}
          className="w-full bg-green-500 text-white hover:bg-green-600 font-semibold py-4 px-4 rounded-xl transition"
        >
          {t("complete.goToDashboard")}
        </button>
      </div>
    </div>
  );
}
