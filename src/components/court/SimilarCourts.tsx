import Link from "next/link";
import { Court } from "@/lib/data";
import { CourtCard } from "@/components/CourtCard";

interface SimilarCourtsProps {
  courts: Court[];
}

export function SimilarCourts({ courts }: SimilarCourtsProps) {
  if (courts.length === 0) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Similar Courts Nearby</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courts.map((court) => (
          <Link key={court.id} href={`/court/${court.id}`}>
            <CourtCard court={court} variant="compact" isLinked />
          </Link>
        ))}
      </div>
    </div>
  );
}
