import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pencil, Plus } from "lucide-react";
import { IMeal } from "@/types/interfaces";
import SidePicker from "./SidePicker";

interface SideChipProps {
  meal: IMeal;
  /** YYYY-MM-DD of the meal. */
  date?: string;
  mealType: string;
  /** Past days and eaten meals keep what they had. */
  readOnly?: boolean;
  className?: string;
}

/**
 * The side's name as the chip shows it: short ("Potatoes & veg") and in the
 * user's language, looked up by the side's id. Sides saved before they had an
 * id keep their full name.
 */
const useShortSideName = () => {
  const { t, i18n } = useTranslation("myMeals");
  return (side: NonNullable<IMeal["side"]>): string => {
    const id = side.id;
    const key = `sideChip.short.${id}`;
    return id && i18n.exists(key, { ns: "myMeals" }) ? t(key) : side.name;
  };
};

/** Only lunch and dinner are plates a side goes next to. */
export const takesSide = (mealType: string) => mealType === "lunch" || mealType === "dinner";

/**
 * The side on a lunch or dinner, as a chip on the card: "+ Add side" when
 * there is none, the side's name when there is. Tapping it opens the picker.
 * On a past day or an eaten meal it only says what the side was.
 */
const SideChip = ({ meal, date, mealType, readOnly, className = "" }: SideChipProps) => {
  const { t } = useTranslation("myMeals");
  const [pickerOpen, setPickerOpen] = useState(false);
  const shortName = useShortSideName();

  if (!takesSide(mealType)) return null;
  const editable = !readOnly && !meal.done && !!date;

  if (!editable) {
    if (!meal.side) return null;
    return (
      <span
        className={`inline-flex max-w-full items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-500 ${className}`}
      >
        <span className="truncate">{t("sideChip.with", { side: shortName(meal.side) })}</span>
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          // Cards expand or open on click; the chip does its own thing.
          e.stopPropagation();
          setPickerOpen(true);
        }}
        aria-label={
          meal.side ? t("sideChip.changeLabel", { side: meal.side.name }) : t("sideChip.addLabel")
        }
        className={`inline-flex max-w-full items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors active:scale-95 ${
          meal.side
            ? "border-habeat/30 bg-habeat/10 text-habeat hover:bg-habeat/15"
            : "border-dashed border-gray-300 bg-white text-gray-600 hover:border-habeat hover:text-habeat"
        } ${className}`}
      >
        {meal.side ? (
          <>
            <span className="truncate">{t("sideChip.with", { side: shortName(meal.side) })}</span>
            <Pencil className="w-3 h-3 flex-shrink-0" aria-hidden />
          </>
        ) : (
          <>
            <Plus className="w-3.5 h-3.5 flex-shrink-0" aria-hidden />
            <span>{t("sideChip.add")}</span>
          </>
        )}
      </button>
      {pickerOpen && (
        <SidePicker
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          meal={meal}
          date={date!}
          mealType={mealType}
        />
      )}
    </>
  );
};

export default SideChip;
