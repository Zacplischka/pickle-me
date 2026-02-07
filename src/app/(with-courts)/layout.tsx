import { CourtsProvider } from "@/lib/contexts/CourtsContext";
import { getCourts } from "@/lib/data";

export default async function CourtsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const courts = await getCourts();
  return (
    <CourtsProvider courts={courts}>
      {children}
    </CourtsProvider>
  );
}
