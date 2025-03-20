import { IncomeCalculator } from "@/components/income-calculator";

export default function Home() {
  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Income Calculator</h1>
      <p className="text-muted-foreground mb-4">
        Build your income structure and verify your employer&apos;s calculations
      </p>

      <IncomeCalculator />
    </main>
  );
}
