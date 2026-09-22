import { useState, useEffect, useCallback } from "react";
import { Plus, Pause, Play, Trash2, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/stores/authStore";
import DashboardLayout from "@/components/layout/DashboardLayout";
import MealLoader from "@/components/helper/MealLoader";
import { userAPI, MyMealDish } from "@/services/api";

/**
 * My Meals — the food this person actually eats.
 *
 * One list, deliberately: the dishes they said they cook at onboarding, the
 * meals they hearted in a plan, and the ones we noticed them cooking twice are
 * the same thing to a person. The meal planner builds the week around it
 * (docs/the-repertoire.md in the server).
 */

interface Suggestion {
  key: string;
  name: string;
  kind: string;
  cookedCount: number;
}

const MyMeals = () => {
  const navigate = useNavigate();
  const { token, loading } = useAuthStore();
  const { t } = useTranslation("myMeals");

  const [dishes, setDishes] = useState<MyMealDish[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newDish, setNewDish] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !token) navigate("/");
  }, [loading, token, navigate]);

  const refresh = useCallback(async () => {
    const [mine, proposed] = await Promise.all([
      userAPI.getMyMeals(),
      userAPI.getMyMealSuggestions(),
    ]);
    setDishes(mine);
    setSuggestions(proposed);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (token) refresh();
  }, [token, refresh]);

  const addDish = async () => {
    const name = newDish.trim();
    if (!name || busy) return;
    setBusy(true);
    try {
      await userAPI.addMyMeal(name);
      setNewDish("");
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  const setStatus = async (dish: MyMealDish, status: "active" | "paused" | "retired") => {
    setBusy(true);
    try {
      await userAPI.setMyMealStatus(dish._id, status);
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  const answer = async (key: string, accept: boolean) => {
    setBusy(true);
    try {
      await userAPI.answerMyMealSuggestion(key, accept);
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  if (isLoading) return <MealLoader />;

  const active = dishes.filter((d) => d.status === "active");
  const paused = dishes.filter((d) => d.status !== "active");

  const card = (dish: MyMealDish) => {
    const nutrition = dish.usual?.nutritionPerServing;
    return (
      <div
        key={dish._id}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
      >
        <div className="h-28 bg-gray-50 flex items-center justify-center overflow-hidden">
          {dish.imageUrl ? (
            <img src={dish.imageUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <span className="text-4xl" aria-hidden="true">
              {dish.icon ?? "🍽️"}
            </span>
          )}
        </div>

        <div className="p-3 flex-1 flex flex-col gap-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 text-sm leading-snug">{dish.name}</h3>
            {dish.favourite && (
              <Heart className="w-4 h-4 text-red-500 fill-red-500 shrink-0" aria-label={t("favourite")} />
            )}
          </div>

          <p className="text-xs text-gray-500">
            {nutrition
              ? t("perServing", {
                  calories: nutrition.calories,
                  protein: nutrition.protein,
                  carbs: nutrition.carbs,
                  fat: nutrition.fat,
                })
              : t("noDetailsYet")}
          </p>
          {dish.usual?.prepMinutes ? (
            <p className="text-xs text-gray-400">{t("prep", { minutes: dish.usual.prepMinutes })}</p>
          ) : null}

          <div className="mt-auto pt-2 flex gap-2">
            {dish.status === "active" ? (
              <button
                onClick={() => setStatus(dish, "paused")}
                disabled={busy}
                className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1"
              >
                <Pause className="w-3 h-3" /> {t("pause")}
              </button>
            ) : (
              <button
                onClick={() => setStatus(dish, "active")}
                disabled={busy}
                className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1"
              >
                <Play className="w-3 h-3" /> {t("unpause")}
              </button>
            )}
            <button
              onClick={() => setStatus(dish, "retired")}
              disabled={busy}
              className="text-xs text-gray-400 hover:text-red-600 flex items-center gap-1 ms-auto"
            >
              <Trash2 className="w-3 h-3" /> {t("remove")}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
          <p className="text-sm text-gray-600 mt-1">{t("description")}</p>
        </header>

        <div className="flex gap-2">
          <input
            type="text"
            value={newDish}
            onChange={(e) => setNewDish(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addDish()}
            placeholder={t("addPlaceholder")}
            maxLength={80}
            className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 text-sm"
          />
          <button
            onClick={addDish}
            disabled={busy || !newDish.trim()}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white rounded-lg font-medium text-sm flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> {t("add")}
          </button>
        </div>

        {suggestions.length > 0 && (
          <section className="bg-green-50 border border-green-100 rounded-2xl p-4">
            <h2 className="font-semibold text-gray-900 text-sm mb-2">{t("noticed")}</h2>
            <div className="space-y-2">
              {suggestions.map((s) => (
                <div key={s.key} className="flex items-center gap-3 text-sm">
                  <span className="flex-1 text-gray-800">
                    {s.kind === "ask-source" ? t("askSource", { dish: s.name }) : t("cookedTwice", { dish: s.name })}
                  </span>
                  <button
                    onClick={() => answer(s.key, true)}
                    disabled={busy}
                    className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-full text-xs"
                  >
                    {t("yes")}
                  </button>
                  <button
                    onClick={() => answer(s.key, false)}
                    disabled={busy}
                    className="px-3 py-1 bg-white border border-gray-200 text-gray-600 rounded-full text-xs"
                  >
                    {t("no")}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {dishes.length === 0 ? (
          <p className="text-sm text-gray-500 py-8 text-center">{t("empty")}</p>
        ) : (
          <>
            <section>
              <h2 className="text-sm font-semibold text-gray-700 mb-3">
                {t("inYourPlans", { count: active.length })}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {active.map(card)}
              </div>
            </section>

            {paused.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-700 mb-3">{t("resting")}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 opacity-60">
                  {paused.map(card)}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyMeals;
