import { LivePageBody } from "@/components/live-page-body";
import { nowMs } from "@/lib/clock";


export const metadata = {
  title: "Diretta",
  description:
    "Guarda TeleAmbiente in diretta: canale 221 del digitale terrestre in tutta Italia, canale 18 in Lazio e Umbria.",
};

export default function DirettaPage() {
  return (
    <main className="page-shell py-8">
      <LivePageBody initialNow={nowMs()} />
    </main>
  );
}
