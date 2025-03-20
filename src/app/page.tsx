import { IncomeCalculator } from "@/components/income-calculator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

export default function Home() {
  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Income Calculator</h1>
      <p className="text-muted-foreground mb-4">
        Build your income structure and verify your employer&apos;s calculations
      </p>

      <Alert className="mb-8">
        <Info className="h-4 w-4" />
        <AlertTitle>Data is saved locally</AlertTitle>
        <AlertDescription>
          Your income components and calculations are automatically saved in
          your browser&apos;s storage.
        </AlertDescription>
      </Alert>

      <IncomeCalculator />
    </main>
  );
}
