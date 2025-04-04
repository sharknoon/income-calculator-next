import { IncomeCalculator } from "@/components/income-calculator";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("Home");
  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex justify-between mb-6 flex-col-reverse sm:flex-row">
        <div>
          <h1 className="text-3xl font-bold mb-6">{t("title")}</h1>
          <p className="text-muted-foreground mb-4">{t("tagline")}</p>
        </div>
        <div className="flex gap-2 justify-end sm:justify-start">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
      </div>

      <IncomeCalculator />
    </main>
  );
}
