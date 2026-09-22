# Dish pictures

Used by the onboarding "what do you cook?" step and the My Meals page. A dish
with no picture falls back to an icon picked from its name, so a missing file
degrades quietly — it never shows a broken image.

## What to put here

- **Format:** `.webp`
- **Size:** 600×600, square (shown at 28px as a chip, ~200px as a card)
- **Content:** the dish as an ordinary person cooks it at home, on a plain
  light background, shot from above. Not restaurant plating, no hands, no
  cutlery, no text.
- **Weight:** under 60 KB each; they load as a set on the onboarding screen.

## File names

The name is the dish name, lowercased, with everything that is not a letter or
number turned into `-` (`dishSlug` in
`habeat-server/src/repertoire/dish-images.ts`). The list below is generated
from `DISHES_WITH_IMAGES`, which is kept in step with `commonDishes` in
`src/components/kyc/types.tsx`.

| Dish | File |
|---|---|
| Pasta with tomato sauce | `pasta-with-tomato-sauce.webp` |
| Chicken and rice | `chicken-and-rice.webp` |
| Scrambled eggs on toast | `scrambled-eggs-on-toast.webp` |
| Omelette with vegetables | `omelette-with-vegetables.webp` |
| Shakshuka | `shakshuka.webp` |
| Greek yogurt with granola | `greek-yogurt-with-granola.webp` |
| Porridge with fruit | `porridge-with-fruit.webp` |
| Tuna sandwich | `tuna-sandwich.webp` |
| Chicken salad | `chicken-salad.webp` |
| Vegetable soup | `vegetable-soup.webp` |
| Lentil soup | `lentil-soup.webp` |
| Roast chicken and potatoes | `roast-chicken-and-potatoes.webp` |
| Salmon and vegetables | `salmon-and-vegetables.webp` |
| Beef stir-fry | `beef-stir-fry.webp` |
| Spaghetti bolognese | `spaghetti-bolognese.webp` |
| Chicken schnitzel | `chicken-schnitzel.webp` |
| Rice and beans | `rice-and-beans.webp` |
| Couscous with vegetables | `couscous-with-vegetables.webp` |
| Hummus and pita | `hummus-and-pita.webp` |
| Grilled cheese sandwich | `grilled-cheese-sandwich.webp` |
| Pizza (homemade) | `pizza.webp` |
| Stuffed vegetables | `stuffed-vegetables.webp` |
| Curry with rice | `curry-with-rice.webp` |
| Baked pasta | `baked-pasta.webp` |

## Adding a dish later

Add it to `commonDishes` (client) and `DISHES_WITH_IMAGES` (server), then drop
the file here under its slug. `test/unit/repertoire/dish-images.spec.ts` checks
every dish the onboarding screen offers resolves to a picture path.
