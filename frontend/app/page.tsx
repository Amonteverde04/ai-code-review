import Form from "@/components/form";
import Navbar from "@/components/navbar";

export default function Home() {
  return (
    <div>
      <Navbar />
      <div className="flex flex-col h-screen p-4 items-center justify-center hero-container" aria-label="Hero container">
        <h1 className="text-4xl font-bold">
          text-editor
        </h1>
      </div>
      <div className="flex flex-col h-screen p-4 gap-4 lg:flex-row cards-container" aria-label="Form container">
        <Form />
      </div>
    </div>
  );
}
