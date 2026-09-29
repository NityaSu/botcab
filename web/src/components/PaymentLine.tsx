import type { PaymentView } from "@/api/types";
import { useI18n } from "@/i18n";

/** Cash mock capture line on a completed trip. */
export function PaymentLine({ payment }: { payment: PaymentView | null | undefined }) {
  const { t } = useI18n();
  if (!payment) return null;
  const label =
    payment.status === "CAPTURED"
      ? t("paymentCaptured")
      : payment.status === "FAILED"
        ? t("paymentFailed")
        : t("paymentPending");
  return (
    <div className="flex justify-between px-4 py-3 text-sm">
      <span className="text-neutral-500">{t("paymentMethod")}</span>
      <span className="font-semibold">{label}</span>
    </div>
  );
}
