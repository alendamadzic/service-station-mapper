import { ModeToggle } from "@/components/ui/mode-toggle";
import Image from "next/image";

export function Header() {
  return (
    <header className="flex flex-row items-center justify-between px-6 py-2 shrink-0">
      <div className="flex flex-row items-center gap-2">
        <Image
          src="/logo.png"
          alt="Service Station Mapper"
          width={42}
          height={42}
        />
        <div className="flex flex-col">
          <h1 className="text-xl font-bold">Service Station Mapper</h1>
          <p className="text-muted-foreground text-sm">
            Plan your journey and find service stations along your route
          </p>
        </div>
      </div>
      <ModeToggle />
    </header>
  );
}
