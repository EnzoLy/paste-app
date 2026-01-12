import { CreatePasteForm } from "@/components/paste/create-paste-form";
import { Navbar } from "@/components/navbar";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col">
        <CreatePasteForm />
      </div>
    </main>
  );
}
