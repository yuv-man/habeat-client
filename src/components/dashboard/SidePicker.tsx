import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { IMeal } from "@/types/interfaces";
import { userAPI, SideOption } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import { useShowMacros } from "@/hooks/useShowMacros";
import { useProgressStore } from "@/stores/progressStore";
import { toLocalDateString } from "@/lib/dateUtils";

const NO_SIDE = "none";

interface SidePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meal: IMeal;
  date: string; // YYYY-MM-DD
  mealType: string;
}

/**
 * Choose what goes next to one of the user's own dishes. Their dish is never
 * touched here — only the side, and the server rebalances the rest of the day.
 */
const SidePicker = ({ open, onOpenChange, meal, date, mealType }: SidePickerProps) => {
  const { t } = useTranslation("myMeals");
  const { user, plan, setPlan } = useAuthStore();
  const showMacros = useShowMacros();
  const [options, setOptions] = useState<SideOption[] | null>(null);
  const [selected, setSelected] = useState<string>(NO_SIDE);
  const [saving, setSaving] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  const title = meal.fromRepertoire
    ? t("sidePicker.title", { dish: meal.name })
    : t("sidePicker.titlePlanned", { dish: meal.name });
  const targetCalories = plan?.userMetrics?.targetCalories;

  useEffect(() => {
    if (!open || !user?._id) return;
    let cancelled = false;
    setOptions(null);
    setLoadFailed(false);
    userAPI
      .getSideOptions(user._id, date, mealType)
      .then(({ current, options }) => {
        if (cancelled) return;
        setOptions(options);
        setSelected(current ?? NO_SIDE);
      })
      .catch(() => !cancelled && setLoadFailed(true));
    return () => {
      cancelled = true;
    };
  }, [open, user?._id, date, mealType]);

  const handleSave = async () => {
    if (!user?._id) return;
    setSaving(true);
    try {
      const { plan: updated } = await userAPI.setMealSide(
        user._id,
        date,
        mealType,
        selected === NO_SIDE ? null : selected
      );
      setPlan(updated);
      // The daily tracker reads today's progress record, which the server has
      // just updated too; the plan alone would leave today's cards stale.
      if (date === toLocalDateString(new Date())) {
        await useProgressStore.getState().fetchTodayProgress(user._id, true);
      }
      toast.success(t("sidePicker.saved"), { duration: 2000 });
      onOpenChange(false);
    } catch {
      toast.error(t("sidePicker.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  type Row = { id: string; name: string; calories: number };
  const toRow = (o: SideOption): Row => ({ id: o.id, name: o.name, calories: o.calories });
  // A starch and a vegetable, or a vegetable alone — two very different plates,
  // so the list says which is which rather than running a dozen rows together.
  const groups: { key: string; label?: string; rows: Row[] }[] = [];
  const plates = (options ?? []).filter((o) => o.ingredients.length > 1).map(toRow);
  const veg = (options ?? []).filter((o) => o.ingredients.length === 1).map(toRow);
  const labelled = plates.length > 0 && veg.length > 0;
  if (plates.length) groups.push({ key: "plates", label: labelled ? t("sidePicker.groups.plates") : undefined, rows: plates });
  if (veg.length) groups.push({ key: "veg", label: labelled ? t("sidePicker.groups.veg") : undefined, rows: veg });
  groups.push({ key: "none", rows: [{ id: NO_SIDE, name: t("sidePicker.none"), calories: 0 }] });

  const renderRow = (row: Row) => {
    const checked = selected === row.id;
    return (
      <button
        key={row.id}
        type="button"
        role="radio"
        aria-checked={checked}
        onClick={() => setSelected(row.id)}
        className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
          checked ? "border-habeat bg-green-50" : "border-gray-200 bg-white hover:bg-gray-50"
        }`}
      >
        <span className="flex items-center gap-3 min-w-0">
          <span
            className={`w-4 h-4 flex-shrink-0 rounded-full border-2 ${
              checked ? "border-habeat bg-habeat shadow-[inset_0_0_0_2px_white]" : "border-gray-300"
            }`}
          />
          <span className="text-sm font-medium text-gray-900 break-words">{row.name}</span>
        </span>
        {showMacros && (
          <span className="text-xs text-gray-500 flex-shrink-0">{row.calories} kcal</span>
        )}
      </button>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto pb-8">
        <SheetHeader className="text-left">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            {targetCalories
              ? t("sidePicker.adjust", { calories: targetCalories.toLocaleString() })
              : t("sidePicker.adjustNoNumber")}
          </SheetDescription>
        </SheetHeader>

        {loadFailed ? (
          <p className="mt-4 text-sm text-red-600">{t("sidePicker.loadFailed")}</p>
        ) : !options ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" aria-label={t("sidePicker.loading")} />
          </div>
        ) : (
          <div role="radiogroup" aria-label={title} className="mt-4 flex flex-col gap-4">
            {groups.map((group) => (
              <div key={group.key} className="flex flex-col gap-2">
                {group.label && (
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {group.label}
                  </p>
                )}
                {group.rows.map(renderRow)}
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={!options || saving}
          className="mt-6 w-full rounded-xl bg-habeat hover:bg-habeat-hover text-white font-semibold py-3 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {t("sidePicker.save")}
        </button>
      </SheetContent>
    </Sheet>
  );
};

export default SidePicker;
