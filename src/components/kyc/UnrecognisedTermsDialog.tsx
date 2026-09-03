import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UnrecognisedTermsDialogProps {
  /** Terms the server could not recognise as food. Never empty when open. */
  terms: string[];
  /** Called with the terms the user chose to delete (possibly none). */
  onResolve: (removed: string[]) => void;
}

/**
 * Asks about entries that do not look food-related ("white socks").
 *
 * Deliberately a confirmation, not a rejection. The classifier can be wrong
 * about a real but obscure allergen, and silently deleting one from a nutrition
 * app is far worse than keeping a nonsense word — so "keep" is the default and
 * the user is never blocked from continuing.
 */
export default function UnrecognisedTermsDialog({
  terms,
  onResolve,
}: UnrecognisedTermsDialogProps) {
  const { t } = useTranslation("onboarding");
  const [removed, setRemoved] = useState<string[]>([]);

  const toggle = (term: string) =>
    setRemoved((prev) =>
      prev.includes(term) ? prev.filter((x) => x !== term) : [...prev, term],
    );

  return (
    <Dialog open={terms.length > 0} onOpenChange={() => undefined}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("unrecognisedTerms.title")}</DialogTitle>
          <DialogDescription>
            {t("unrecognisedTerms.description")}
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-2 py-2">
          {terms.map((term) => {
            const isRemoved = removed.includes(term);
            return (
              <li
                key={term}
                className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2"
              >
                <span
                  className={`text-sm ${
                    isRemoved ? "text-gray-400 line-through" : "text-gray-900"
                  }`}
                >
                  {term}
                </span>
                <button
                  type="button"
                  onClick={() => toggle(term)}
                  className="text-xs font-medium text-green-600 hover:text-green-700 shrink-0"
                >
                  {isRemoved
                    ? t("unrecognisedTerms.undo")
                    : t("unrecognisedTerms.remove")}
                </button>
              </li>
            );
          })}
        </ul>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onResolve([])}
            className="w-full sm:w-auto"
          >
            {t("unrecognisedTerms.keepAll")}
          </Button>
          <Button
            type="button"
            onClick={() => onResolve(removed)}
            className="w-full sm:w-auto bg-green-500 hover:bg-green-600"
          >
            {t("unrecognisedTerms.continue")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
