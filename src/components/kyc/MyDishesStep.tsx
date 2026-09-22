import { useTranslation } from "react-i18next";
import { KYCData, CustomInputs, commonDishes } from "./types";
import { MAX_TERM_LENGTH } from "@/lib/termInput";
import KycLayout from "./KycLayout";

/** Matches the server's dishSlug (habeat-server/src/repertoire/dish-images.ts). */
const dishSlug = (name: string): string =>
  name
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * "What do you cook most weeks?"
 *
 * The one question that decides whether a plan is followable: a week of
 * unfamiliar recipes is a week nobody cooks. What is picked here is planned as
 * the dish the user already makes (server: docs/the-repertoire.md).
 *
 * Deliberately skippable, and cheap: tap a few, type anything missing. No
 * amounts, no recipes — the server works those out from the name.
 */

/** Enough dishes to build a week around; more is welcome, fewer still helps. */
export const SUGGESTED_DISHES = 5;

interface MyDishesStepProps {
  kycData: KYCData;
  customInputs: CustomInputs;
  setCustomInputs: React.Dispatch<React.SetStateAction<CustomInputs>>;
  loading: boolean;
  error: string;
  onSubmit: () => void;
  onToggleOption: (list: string, value: string) => void;
  onAddCustomItem: (category: string, inputKey: string) => void;
  onBack: () => void;
  currentStep?: number;
  totalSteps?: number;
}

export default function MyDishesStep({
  kycData,
  customInputs,
  setCustomInputs,
  loading,
  error,
  onSubmit,
  onToggleOption,
  onAddCustomItem,
  onBack,
  currentStep,
  totalSteps,
}: MyDishesStepProps) {
  const { t } = useTranslation("onboarding");
  const chosen = kycData.myDishes ?? [];
  const typed = chosen.filter((d) => !commonDishes.includes(d));

  return (
    <KycLayout
      title={t("myDishes.title")}
      description={t("myDishes.description")}
      onBack={onBack}
      onSubmit={onSubmit}
      loading={loading}
      error={error}
      submitText={chosen.length ? t("common:buttons.continue") : t("myDishes.skip")}
      currentStep={currentStep}
      totalSteps={totalSteps}
    >
      <div className="space-y-6">
        <div>
          <div className="flex flex-wrap gap-2 mb-3">
            {commonDishes.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={chosen.includes(item)}
                onClick={() => onToggleOption("myDishes", item)}
                className={`ps-1.5 pe-3 py-1 rounded-full font-medium transition text-sm flex items-center gap-2 ${
                  chosen.includes(item)
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {/* Hidden if the picture is missing, so a chip never shows a
                    broken image while the set is being filled in. */}
                <img
                  src={`/images/dishes/${dishSlug(item)}.webp`}
                  alt=""
                  loading="lazy"
                  className="w-7 h-7 rounded-full object-cover bg-white/40"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
                {item}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              maxLength={MAX_TERM_LENGTH}
              placeholder={t("myDishes.placeholder")}
              value={customInputs.dish}
              onChange={(e) =>
                setCustomInputs((prev) => ({ ...prev, dish: e.target.value }))
              }
              onKeyPress={(e) => e.key === "Enter" && onAddCustomItem("myDishes", "dish")}
              className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-sm"
            />
            <button
              type="button"
              onClick={() => onAddCustomItem("myDishes", "dish")}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition text-sm"
            >
              {t("myDishes.add")}
            </button>
          </div>

          {typed.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {typed.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => onToggleOption("myDishes", item)}
                  className="px-3 py-1 bg-green-500 text-white rounded-full text-xs hover:bg-green-600 transition flex items-center gap-1"
                >
                  {item} ✕
                </button>
              ))}
            </div>
          )}
        </div>

        <p className="text-sm text-gray-600" aria-live="polite">
          {chosen.length === 0
            ? t("myDishes.hint")
            : chosen.length < SUGGESTED_DISHES
              ? t("myDishes.progress", { count: chosen.length, suggested: SUGGESTED_DISHES })
              : t("myDishes.enough", { count: chosen.length })}
        </p>
      </div>
    </KycLayout>
  );
}
