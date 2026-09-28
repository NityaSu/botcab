import { StarIcon } from "@/components/icons";
import { useI18n } from "@/i18n";

type Props = {
  value: number;
  onChange?: (stars: number) => void;
  disabled?: boolean;
  size?: number;
};

/** 1–5 star control. Read-only when {@code onChange} is omitted. */
export function StarRating({ value, onChange, disabled, size = 22 }: Props) {
  const { t } = useI18n();
  const interactive = Boolean(onChange) && !disabled;

  return (
    <div className="inline-flex items-center gap-1" role={interactive ? "radiogroup" : "img"} aria-label={t("ratingLabel")}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= value;
        const inner = (
          <span className={filled ? "text-amber-500" : "text-neutral-300"}>
            <StarIcon size={size} filled={filled} />
          </span>
        );
        if (!interactive) {
          return <span key={n}>{inner}</span>;
        }
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={t("ratingStars").replace("{n}", String(n))}
            disabled={disabled}
            onClick={() => onChange?.(n)}
            className="p-0.5 rounded-md hover:scale-110 transition-transform cursor-pointer disabled:cursor-not-allowed"
          >
            {inner}
          </button>
        );
      })}
    </div>
  );
}
