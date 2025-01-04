import { BlinkDetector } from "@/components/BlinkDetector";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto py-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Eye Health Monitor</h1>
          <p className="text-muted-foreground">
            Monitoring your blink rate for better eye health
          </p>
        </header>
        <BlinkDetector />
      </main>
    </div>
  );
};

export default Index;