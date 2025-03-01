import { Toaster } from "~/components/ui/toaster";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-4 lg:p-8 w-full h-full flex flex-col flex-1">
      {children}
      <Toaster />
    </div>
  );
}
