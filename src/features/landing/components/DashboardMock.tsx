import { ArrowUpRight, CheckCircle2, Lock, MoreHorizontal } from "lucide-react";
import { cn } from "../../../shared/utils/cn";

type Status = "confirme" | "attente" | "annule";

const STATUS: Record<Status, { label: string; className: string }> = {
  confirme: { label: "Confirmé", className: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" },
  attente: { label: "En attente", className: "bg-amber-50 text-amber-700 ring-amber-600/20" },
  annule: { label: "Annulé", className: "bg-red-50 text-red-700 ring-red-600/20" },
};

const TRANSACTIONS: { name: string; amount: string; date: string; status: Status }[] = [
  { name: "Awa Diop", amount: "45 000", date: "28 oct.", status: "confirme" },
  { name: "Moussa Ndiaye", amount: "120 000", date: "28 oct.", status: "attente" },
  { name: "Fatou Sow", amount: "30 000", date: "27 oct.", status: "annule" },
  { name: "Ibrahima Fall", amount: "75 000", date: "26 oct.", status: "confirme" },
];

const STATS = [
  { label: "À encaisser", value: "1 250 000 F", trend: "+12 %" },
  { label: "Clients", value: "48", trend: "+4" },
  { label: "Confirmés", value: "126", trend: "+8 %" },
];

const CHART = [20, 34, 28, 48, 42, 62, 80];
const WIDTH = 320;
const HEIGHT = 100;
const PADDING = 6;
const MAX = Math.max(...CHART);

const POINTS = CHART.map((value, index) => {
  const x = PADDING + (index / (CHART.length - 1)) * (WIDTH - PADDING * 2);
  const y = HEIGHT - PADDING - (value / MAX) * (HEIGHT - PADDING * 2);
  return { x, y };
});

const LINE_POINTS = POINTS.map((point) => `${point.x},${point.y}`).join(" ");
const AREA_POINTS = `${PADDING},${HEIGHT} ${LINE_POINTS} ${WIDTH - PADDING},${HEIGHT}`;

export function DashboardMock() {
  return (
    <div className="relative mx-auto w-full max-w-145 perspective-[1600px]">
      <div
        className="absolute -inset-6 rounded-[2.5rem] bg-linear-to-tr from-brand-soft via-white to-emerald-100/70 blur-3xl"
        aria-hidden="true"
      />

      <div className="group relative transform-gpu transition-transform duration-700 ease-out lg:origin-center lg:transform-[rotateY(-9deg)_rotateX(2deg)_rotateZ(0.5deg)] lg:hover:transform-[rotateY(-4deg)_rotateX(1deg)_rotateZ(0deg)]">
        <div className="rounded-[1.75rem] border border-white/10 bg-linear-to-b from-[#24332d] via-[#14211c] to-[#0a1310] p-2 shadow-[0_35px_80px_-20px_rgba(12,59,46,0.55)]">
          <div
            className="overflow-hidden rounded-[1.35rem] bg-white ring-1 ring-black/5"
            role="img"
            aria-label="Aperçu illustratif d’un tableau de bord avec des données fictives"
          >
            <div className="flex items-center gap-3 border-b border-white/10 bg-[#0f1f1a] px-4 py-2.5">
              <div className="flex gap-1.5" aria-hidden="true">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              </div>
              <div className="mx-auto flex items-center gap-1.5 rounded-md bg-white/5 px-3 py-1 text-[10px] text-white/50">
                <Lock className="h-2.5 w-2.5" aria-hidden="true" />
                Klaro.com
              </div>
              <MoreHorizontal className="h-4 w-4 text-white/30" aria-hidden="true" />
            </div>

            <div className="p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-ink">Tableau de bord</p>
                <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-medium text-brand">
                  Aperçu · données fictives
                </span>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
                {STATS.map((stat, index) => (
                  <div
                    key={stat.label}
                    className={cn(
                      "rounded-xl border p-3",
                      index === 0 ? "border-brand bg-brand text-white" : "border-gray-100 bg-surface",
                    )}
                  >
                    <p className={cn("text-[11px]", index === 0 ? "text-white/70" : "text-muted")}>{stat.label}</p>
                    <p className={cn("mt-1 text-sm font-bold sm:text-base", index === 0 ? "text-white" : "text-ink")}>
                      {stat.value}
                    </p>
                    <span
                      className={cn(
                        "mt-1 inline-flex items-center gap-0.5 text-[10px] font-semibold",
                        index === 0 ? "text-emerald-200" : "text-brand-accent",
                      )}
                    >
                      <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                      {stat.trend}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-xl border border-gray-100 p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-xs text-muted">Évolution des encaissements</p>
                  <span className="text-[10px] text-muted">7 jours</span>
                </div>
                <svg
                  viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                  preserveAspectRatio="none"
                  className="h-24 w-full"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="landing-chart-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2F7D5B" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#2F7D5B" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {[25, 50, 75].map((y) => (
                    <line key={y} x1={PADDING} y1={y} x2={WIDTH - PADDING} y2={y} stroke="#F1F5F3" strokeWidth="1" />
                  ))}
                  <polygon points={AREA_POINTS} fill="url(#landing-chart-fill)" />
                  <polyline
                    points={LINE_POINTS}
                    fill="none"
                    stroke="#2F7D5B"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {POINTS.map((point, index) => (
                    <circle
                      key={index}
                      cx={point.x}
                      cy={point.y}
                      r="2.5"
                      fill="#ffffff"
                      stroke="#2F7D5B"
                      strokeWidth="2"
                    />
                  ))}
                </svg>
              </div>

              <ul className="mt-4 divide-y divide-gray-100">
                {TRANSACTIONS.map((transaction) => (
                  <li key={transaction.name} className="flex items-center justify-between gap-2 py-2.5 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{transaction.name}</p>
                      <p className="text-xs text-muted">{transaction.date}</p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="whitespace-nowrap font-semibold text-ink">{transaction.amount} F</span>
                      <span
                        className={cn(
                          "whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
                          STATUS[transaction.status].className,
                        )}
                      >
                        {STATUS[transaction.status].label}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div
          className="pointer-events-none absolute inset-0 rounded-[1.75rem] bg-linear-to-tr from-white/0 via-white/10 to-white/0"
          aria-hidden="true"
        />

        <div className="relative mx-auto -mt-px h-3 w-24 rounded-b-xl bg-linear-to-b from-[#1a2823] to-[#0a1310]" aria-hidden="true" />
        <div className="mx-auto h-1.5 w-44 rounded-full bg-gray-300/70 shadow-sm" aria-hidden="true" />
      </div>

      <div
        className="absolute bottom-6 -left-4 z-10 hidden items-center gap-2 rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-lg shadow-black/5 sm:flex lg:-left-8"
        aria-hidden="true"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-4 w-4" />
        </span>
        <div>
          <p className="text-[11px] text-muted">Encaissement confirmé</p>
          <p className="text-sm font-semibold text-ink">45 000 F</p>
        </div>
      </div>
    </div>
  );
}
