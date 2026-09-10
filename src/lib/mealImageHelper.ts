/**
 * Picks the photo for a meal from `assets/mealsTypes/webp`.
 *
 * The rule that matters: **the form of the dish wins.** A taco gets a taco
 * photo, a soup gets a soup photo. Ingredients only choose *between* photos of
 * the right form — they can never drag a dish into the wrong one.
 *
 * The previous matcher scored every image by loose substring overlap, which
 * let incidental adjectives outvote the dish itself. "Chilli Lime Egg Soup"
 * matched `chilli-lime-beef-pasta` on two modifiers and was served a bowl of
 * pasta; "Mustard Dill Tuna Tacos" matched `turkey-mustard-dill-salad` the
 * same way. Two unrelated dishes routinely landed on one photo because the
 * words they happened to share were the ones being counted.
 */

// Vite inlines this at build time; the keys are the single source of truth for
// what art actually exists. It used to be a hand-maintained array beside it,
// which had drifted badly: seven names that no longer existed on disk (and so
// could win a match and then render nothing) and twenty-six real photos —
// cucumber-salad, beef-stew, mac-and-cheese, ceviche — that no meal could ever
// be matched to because they were never listed.
const mealImageModules = import.meta.glob(
  "/src/assets/mealsTypes/webp/*.webp",
  { eager: true, import: "default" },
) as Record<string, string>;

const PLACEHOLDER = "https://via.placeholder.com/80";

const basename = (path: string): string =>
  path.slice(path.lastIndexOf("/") + 1).replace(/\.webp$/, "");

/** Lowercased and space-normalised, because matching is done by substring and
 *  at least one file on disk is named "Tropical mango-and-pineapple-...". */
const matchKey = (name: string): string =>
  name.toLowerCase().replace(/\s+/g, "-");

/** Match keys, e.g. "fish-tacos". */
const availableImages = Object.keys(mealImageModules).map((path) =>
  matchKey(basename(path)),
);

const imageUrlByKey = new Map(
  Object.entries(mealImageModules).map(([path, url]) => [
    matchKey(basename(path)),
    url,
  ]),
);

/**
 * The shape of the dish — which is most of what a photograph actually shows.
 *
 * `nameTokens` are looked for in the meal's name, `imageTokens` in the photo's
 * filename. A form match is a hard filter, not a score.
 */
interface DishForm {
  form: string;
  nameTokens: string[];
  imageTokens: string[];
  /** Photos that carry `imageTokens` but aren't really this form. */
  excludeImageTokens?: string[];
}

const DISH_FORMS: DishForm[] = [
  { form: "taco", nameTokens: ["taco", "tacos"], imageTokens: ["taco"] },
  {
    form: "burrito",
    nameTokens: ["burrito", "quesadilla", "nachos"],
    imageTokens: ["burrito", "quesadilla", "nachos"],
  },
  { form: "pizza", nameTokens: ["pizza", "calzone"], imageTokens: ["pizza", "calzone"] },
  {
    form: "burger",
    nameTokens: ["burger", "hamburger", "cheeseburger"],
    imageTokens: ["burger"],
  },
  {
    form: "sandwich",
    nameTokens: ["sandwich", "sub", "baguette", "pita", "bun", "buns", "hotdog", "panini"],
    imageTokens: ["sandwich", "baguette", "pita", "bun", "buns", "hot-dog", "philly"],
  },
  {
    form: "wrap",
    nameTokens: ["wrap", "shawarma", "roll", "rolls"],
    imageTokens: ["wrap", "shawarma", "rolls"],
  },
  {
    form: "toast",
    nameTokens: ["toast", "bagel", "crostini", "bruschetta"],
    imageTokens: ["toast", "bagel"],
  },
  {
    form: "salad",
    nameTokens: ["salad", "slaw", "tabbouleh", "greens"],
    imageTokens: ["salad", "som-tam"],
    // A "tuna salad sandwich" is a sandwich; the photo shows bread.
    excludeImageTokens: ["sandwich", "bread", "wrap"],
  },
  {
    form: "soup",
    nameTokens: ["soup", "broth", "bisque", "chowder", "ramen", "pho"],
    imageTokens: ["soup", "ramen", "pho"],
  },
  {
    form: "stew",
    nameTokens: ["stew", "chili", "chilli", "goulash", "gulash", "tagine", "casserole"],
    imageTokens: ["stew", "chili", "gulash"],
  },
  { form: "curry", nameTokens: ["curry", "masala", "korma"], imageTokens: ["curry"] },
  {
    form: "pasta",
    nameTokens: [
      "pasta", "spaghetti", "penne", "fusilli", "linguine", "fettuccine",
      "tagliatelle", "rigatoni", "macaroni", "lasagna", "lasagne", "ravioli",
      "gnocchi", "carbonara", "bolognese", "orzo",
    ],
    imageTokens: [
      "pasta", "spaghetti", "lasagna", "ravioli", "gnocchi", "fettuccine",
      "macaroni", "mac-and-cheese", "limone",
    ],
  },
  {
    form: "noodles",
    nameTokens: ["noodle", "noodles", "vermicelli", "udon", "soba", "chow", "mein"],
    imageTokens: ["noodles", "pad-thai", "pad-see-ew", "vermicelli", "varmicelli", "stirfried"],
  },
  {
    form: "sushi",
    nameTokens: ["sushi", "sashimi", "poke", "tataki", "maki", "nigiri", "ceviche"],
    imageTokens: ["sushi", "sashimi", "poke", "tataki", "ceviche"],
  },
  {
    form: "dumpling",
    nameTokens: ["dumpling", "dumplings", "gyoza", "wonton", "croquetas"],
    imageTokens: ["dumplings", "gyoza", "croquetas"],
  },
  {
    form: "omelette",
    nameTokens: ["omelette", "omelet", "frittata", "shakshuka", "scramble", "scrambled"],
    imageTokens: ["omelette", "frittata", "shakshuka", "scrambled"],
  },
  {
    form: "porridge",
    nameTokens: ["porridge", "oatmeal", "oats", "muesli", "granola", "cereal", "overnight"],
    imageTokens: ["porridge", "oatmeal", "oats", "muesli", "granola", "cereal"],
  },
  {
    form: "yogurt",
    nameTokens: ["yogurt", "yoghurt", "parfait", "quark", "skyr"],
    imageTokens: ["yogurt", "parfait"],
  },
  {
    form: "pudding",
    nameTokens: ["pudding", "soak", "chia"],
    imageTokens: ["pudding", "chia"],
  },
  {
    form: "smoothie",
    nameTokens: ["smoothie", "shake", "juice"],
    imageTokens: ["smoothie"],
  },
  {
    form: "pancake",
    nameTokens: ["pancake", "pancakes", "crepe", "crepes", "waffle", "waffles", "blini"],
    imageTokens: ["pancake", "pancakes", "crepes", "waffles"],
  },
  {
    form: "stirfry",
    nameTokens: ["stirfry", "skillet", "teppanyaki"],
    imageTokens: ["stir-fry", "stirfry", "stirfried", "skillet"],
  },
  {
    form: "bowl",
    nameTokens: ["bowl", "risotto", "biryani", "paella", "pilaf"],
    imageTokens: ["bowl", "risotto", "biryani"],
  },
];

/** Which protein the dish is built on — the strongest signal after form. */
interface Protein {
  key: string;
  /** Photos of the same family read as a near-miss, not a mistake: a tuna taco
   *  is well served by a fish taco, badly served by a turkey one. `dairy` is
   *  the exception — cheese and yogurt garnish everything, so they never count
   *  as somebody else's protein. */
  family: "seafood" | "poultry" | "meat" | "plant" | "egg" | "dairy";
  nameTokens: string[];
  imageTokens: string[];
}

const PROTEINS: Protein[] = [
  { key: "tuna", family: "seafood", nameTokens: ["tuna"], imageTokens: ["tuna"] },
  { key: "salmon", family: "seafood", nameTokens: ["salmon"], imageTokens: ["salmon"] },
  {
    key: "whitefish",
    family: "seafood",
    nameTokens: ["cod", "haddock", "seabass", "halibut", "tilapia"],
    imageTokens: ["cod"],
  },
  { key: "fish", family: "seafood", nameTokens: ["fish"], imageTokens: ["fish"] },
  { key: "shrimp", family: "seafood", nameTokens: ["shrimp", "shrimps", "prawn", "prawns"], imageTokens: ["shrimp"] },
  {
    key: "seafood",
    family: "seafood",
    nameTokens: ["seafood", "mussels", "squid", "calamari", "scallop", "scallops"],
    imageTokens: ["seafood", "mussels"],
  },
  { key: "chicken", family: "poultry", nameTokens: ["chicken"], imageTokens: ["chicken", "katsu"] },
  { key: "turkey", family: "poultry", nameTokens: ["turkey"], imageTokens: ["turkey"] },
  {
    key: "beef",
    family: "meat",
    nameTokens: ["beef", "steak", "mince", "patty", "brisket", "veal"],
    imageTokens: ["beef", "steak", "patty", "gulash", "philly"],
  },
  {
    key: "pork",
    family: "meat",
    nameTokens: ["pork", "bacon", "ham", "sausage", "chorizo", "ribs"],
    imageTokens: ["pork", "ribs", "hot-dog", "schnitzel"],
  },
  { key: "duck", family: "poultry", nameTokens: ["duck"], imageTokens: ["duck"] },
  { key: "lamb", family: "meat", nameTokens: ["lamb", "mutton"], imageTokens: ["lamb"] },
  { key: "tofu", family: "plant", nameTokens: ["tofu", "tempeh", "edamame"], imageTokens: ["tofu", "edamame"] },
  {
    key: "egg",
    family: "egg",
    nameTokens: ["egg", "eggs", "omelette", "omelet", "frittata", "shakshuka"],
    imageTokens: ["egg", "eggs", "omelette", "frittata", "shakshuka"],
  },
  {
    key: "legume",
    family: "plant",
    nameTokens: ["bean", "beans", "lentil", "lentils", "chickpea", "chickpeas", "hummus", "falafel"],
    imageTokens: ["bean", "lentil", "chickpea", "hummus", "falafel"],
  },
  {
    key: "dairy",
    family: "dairy",
    nameTokens: ["yogurt", "yoghurt", "cottage", "cheese", "quark", "skyr"],
    imageTokens: ["yogurt", "cottage", "cheese"],
  },
];

/** Words that describe seasoning or method, never the dish. */
const STOP_WORDS = new Set([
  "with", "and", "the", "on", "in", "for", "to", "topped", "served", "side",
  "fresh", "homemade", "delicious", "grilled", "baked", "fried", "roasted",
  "leftover", "quick", "easy", "simple", "whole", "lean", "spiced", "spicy",
  "seasoned", "style", "mixed", "sheet", "bake", "plate", "pot", "seed",
  "seeds", "power", "green", "brown", "red",
]);

const tokenize = (name: string): string[] =>
  name
    .toLowerCase()
    .split(/[\s\-_,()]+/)
    .map((w) => w.replace(/[^a-z0-9]/g, ""))
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

const imageHas = (image: string, tokens: string[]): boolean =>
  tokens.some((t) => image.includes(t));

/**
 * The dish's form, taken from the *last* form word in the name — English puts
 * the head noun at the end, so "Spiced Beef Pasta Salad" is a salad and
 * "Chicken Noodle Soup" is a soup.
 */
const detectForm = (tokens: string[]): DishForm | null => {
  let best: DishForm | null = null;
  let bestIndex = -1;

  for (const form of DISH_FORMS) {
    for (let i = tokens.length - 1; i > bestIndex; i--) {
      if (form.nameTokens.includes(tokens[i])) {
        best = form;
        bestIndex = i;
        break;
      }
    }
  }

  return best;
};

const detectProtein = (tokens: string[]): Protein | null =>
  PROTEINS.find((p) => tokens.some((t) => p.nameTokens.includes(t))) ?? null;

/** Every form token any photo could carry, for the no-form-detected penalty. */
const ALL_FORM_IMAGE_TOKENS = DISH_FORMS.flatMap((f) => f.imageTokens);

/**
 * Stable tiebreak. Two dishes that score identically should not both take the
 * first photo in the folder — the same picture twice on one screen is exactly
 * what makes a wrong match obvious. Keyed on the name, so a given meal always
 * gets the same photo.
 */
const hash = (value: string): number => {
  let h = 0;
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) | 0;
  return Math.abs(h);
};

/**
 * The image this meal resolves to, as a match key, or null. Exported so the
 * mapping can be asserted directly — the failure mode here is a picture that
 * is merely *wrong*, which no rendering test would ever catch.
 */
export const resolveMealImageName = (mealName: string): string | null => {
  const tokens = tokenize(mealName);
  if (tokens.length === 0) return null;

  const form = detectForm(tokens);
  const protein = detectProtein(tokens);

  /** Shows a protein from a different family — the wrong animal on the plate. */
  const conflicts = (image: string): boolean =>
    !!protein &&
    PROTEINS.some(
      (p) =>
        p.family !== protein.family &&
        p.family !== "dairy" &&
        imageHas(image, p.imageTokens),
    );

  const sameFamily = (image: string): boolean =>
    !!protein &&
    PROTEINS.some(
      (p) => p.family === protein.family && imageHas(image, p.imageTokens),
    );

  // A form match is a filter, not a score — this is the whole fix.
  let candidates = availableImages;
  let formFiltered = false;

  if (form) {
    const inForm = availableImages.filter(
      (img) =>
        imageHas(img, form.imageTokens) &&
        !(form.excludeImageTokens && imageHas(img, form.excludeImageTokens)),
    );

    // Holding the form only helps while the shortlist can also get the protein
    // right. When we have photos of the form but every one of them shows the
    // wrong animal, the form is the weaker claim: a chicken casserole is far
    // better served by a photo of chicken than by a bowl of beef chili.
    // Only when *every* photo of this form shows the wrong animal. A neutral
    // photo — miso soup for an egg soup, veggie stir-fry for a salmon one — is
    // a perfectly good answer and must not trigger the escape hatch.
    const proteinIsHopeless =
      protein !== null &&
      inForm.length > 0 &&
      !inForm.some(sameFamily) &&
      inForm.every(conflicts);

    if (inForm.length > 0 && !proteinIsHopeless) {
      candidates = inForm;
      formFiltered = true;
    }
  }

  /** Photos that announce a form other than the one this dish is. */
  const carriesForeignForm = (image: string): boolean =>
    DISH_FORMS.some(
      (f) => f !== form && imageHas(image, f.imageTokens),
    ) && !(form && imageHas(image, form.imageTokens));

  let best: { image: string; score: number } | null = null;

  for (const image of candidates) {
    let score = 0;

    if (protein) {
      if (imageHas(image, protein.imageTokens)) {
        score += 100;
      } else if (sameFamily(image)) {
        score += 40;
      } else if (conflicts(image)) {
        // A tuna taco should not be served a turkey one.
        score -= 60;
      }
    }

    // Whenever the shortlist isn't already form-filtered, refuse photos that
    // loudly announce some other form — this is what kept serving pasta for
    // "Thyme Butter Chicken Bake".
    if (!formFiltered) {
      const wrongForm = form
        ? carriesForeignForm(image)
        : imageHas(image, ALL_FORM_IMAGE_TOKENS);
      if (wrongForm) score -= 45;
    }

    // Remaining words break ties within an already-correct shortlist.
    for (const token of tokens) {
      if (image.includes(token)) score += 6;
    }

    if (
      !best ||
      score > best.score ||
      (score === best.score &&
        hash(mealName + image) > hash(mealName + best.image))
    ) {
      best = { image, score };
    }
  }

  return best?.image ?? null;
};

/**
 * Resolve a meal name to a bundled photo URL.
 *
 * @param mealName - The meal's name, English where available.
 * @param fallbackIcon - Used when nothing sensible matches.
 */
export const getMealImageVite = (
  mealName: string,
  fallbackIcon?: string,
): string => {
  if (!mealName) return fallbackIcon || PLACEHOLDER;

  const matched = resolveMealImageName(mealName);
  if (!matched) return fallbackIcon || PLACEHOLDER;

  // Truthiness, not `??`: the test environment resolves asset imports to an
  // empty string, and an empty src is worse than the fallback.
  return imageUrlByKey.get(matched) || fallbackIcon || PLACEHOLDER;
};
