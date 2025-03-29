"use client";

import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocale, useTranslations } from "next-intl";
import { Locale, locales } from "@/i18n/config";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setUserLocale } from "@/i18n/locale";

export function LanguageSwitcher() {
  const t = useTranslations("LanguageSwitcher");
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function translateLanguageName(locale: string): string {
    return (
      new Intl.DisplayNames([locale], { type: "language" }).of(locale) ?? ""
    );
  }

  function handleLocaleChange(l: string) {
    startTransition(() => {
      setUserLocale(l as Locale);
      router.refresh();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" disabled={isPending}>
          <Globe className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{t("language")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((l) => (
          <DropdownMenuItem
            key={l}
            onClick={() => handleLocaleChange(l)}
            className={locale === l ? "bg-muted" : ""}
          >
            <span>{translateLanguageName(l)}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
