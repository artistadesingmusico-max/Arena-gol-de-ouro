import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  CircleDollarSign,
  CircleX,
  Clock3,
  CreditCard,
  Footprints,
  Instagram,
  MapPin,
  Menu,
  Phone,
  QrCode,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
  Volleyball,
  X,
} from 'lucide-react';
import {
  getGetAdminSummaryQueryKey,
  getListAvailabilityQueryKey,
  getListBlockedSlotsQueryKey,
  getListFacilitiesQueryKey,
  getListReservationsQueryKey,
  useCreateBlockedSlot,
  useCreateLead,
  useCreateBooking,
  useDeleteBlockedSlot,
  useGetAdminSummary,
  useListAvailability,
  useListBlockedSlots,
  useListFacilities,
  useListReservations,
  useUpdateReservation,
} from '@workspace/api-client-react';
import type { BlockedSlot, Booking, Facility, Reservation, ReservationStatus } from '@workspace/api-client-react';
import NotFound from '@/pages/not-found';
import {
  Route,
  Switch,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, retryDelay: 800, refetchOnWindowFocus: false } } });

import aerialImage from '@assets/WhatsApp_Image_2026-09-03_at_16.36.01_1788473827328.jpeg';
import complexImage from '@assets/WhatsApp_Image_2026-09-03_at_16.36.02_1788473827328.jpeg';
import loungeImage from '@assets/WhatsApp_Image_2026-09-03_at_16.36.02_(1)_1788473827328.jpeg';
import muralImage from '@assets/WhatsApp_Image_2026-09-03_at_16.36.02_(2)_1788473827328.jpeg';
import facadeImage from '@assets/bffc5c55-9411-41ab-baf4-4c45c9e3a175_1788473821261.jpg';
import sandImage from '@assets/IMG_6740-scaled_1788473845694.webp';
import brandLogo from '@assets/logo-arena.png.jpeg';
import heroWordmarkImage from '@assets/Segunda dobra.png.jpeg';
import pixInstructionsImage from '@assets/pix-sicoob-instrucoes_1789696879.jpg';
import droneVideo from '@assets/drone-sports-complex.mp4';

const money = (cents: number) => (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const todayISO = () => new Date().toISOString().slice(0, 10);
const dateOnly = (value: string | Date) => typeof value === 'string' ? value.slice(0, 10) : value.toISOString().slice(0, 10);
const prettyDate = (value: string | Date) => new Date(`${dateOnly(value)}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
const prettyDateShort = (value: string | Date) => new Date(`${dateOnly(value)}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

function Brand({ compact = false }: { compact?: boolean }) {
  return <div className="flex items-center gap-3" data-testid="brand-arena">
    <img
      src={brandLogo}
      alt="Arena Gol de Ouro"
      className={
        compact
          ? 'glow-pulse h-16 w-auto rounded-xl shadow-[0_0_0_2px_rgba(242,193,58,.6),0_0_30px_rgba(242,193,58,.35),0_8px_24px_rgba(242,193,58,.25)] sm:h-24'
          : 'glow-pulse h-24 w-auto rounded-2xl shadow-[0_0_0_3px_rgba(242,193,58,.65),0_0_45px_rgba(242,193,58,.4),0_12px_32px_rgba(0,0,0,.45)] sm:h-32'
      }
    />
  </div>;
}

function LoadingState({ label = 'Carregando dados da arena' }: { label?: string }) {
  return <div className="rounded-2xl border border-[#28303c] bg-[#151a23] p-6" data-testid="state-loading">
    <div className="flex items-center gap-3 text-sm text-[#aeb4bf]"><span className="h-2 w-2 animate-pulse rounded-full bg-[#f2c13a]" /> {label}</div>
    <div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="h-14 animate-pulse rounded-lg bg-[#202633]" /><div className="h-14 animate-pulse rounded-lg bg-[#202633]" /><div className="h-14 animate-pulse rounded-lg bg-[#202633]" /></div>
  </div>;
}

function ErrorState({ onRetry, label = 'Não conseguimos carregar esta informação.' }: { onRetry: () => void; label?: string }) {
  return <div className="rounded-2xl border border-[#583238] bg-[#241a20] p-6" data-testid="state-error">
    <div className="flex items-start justify-between gap-5"><div><div className="font-semibold text-[#f5e4d4]">A bola saiu pela lateral.</div><p className="mt-1 text-sm text-[#b99da0]">{label}</p></div><button type="button" onClick={onRetry} className="flex shrink-0 items-center gap-2 rounded-lg border border-[#744149] px-3 py-2 text-sm text-[#f4c4b8] transition hover:bg-[#3a2029]" data-testid="button-retry"><RefreshCw size={14} /> Tentar de novo</button></div>
  </div>;
}

function SiteHeader() {
  const [open, setOpen] = useState(false);
  const nav = [['A arena', '#arena'], ['Estrutura', '#estrutura'], ['Reservas', '#reservar'], ['Contato', '#contato']];
  return <header className="absolute left-0 right-0 top-0 z-30 border-b border-white/10 bg-[#0e1118]/60 backdrop-blur-md">
    <div className="mx-auto flex max-w-[1280px] items-center justify-between px-5 py-4 lg:px-8">
      <a href="#topo" className="flex min-w-0 items-center gap-3 sm:gap-5" data-testid="link-home"><Brand compact /><span className="arena-display flex flex-col font-bold uppercase leading-[1.05] tracking-wide text-[#f2c13a] drop-shadow-[0_2px_12px_rgba(242,193,58,.45)]" data-testid="text-header-location"><span className="text-sm sm:text-xl lg:text-2xl">Shopping de</span><span className="text-lg sm:text-3xl lg:text-4xl">Águas Lindas</span></span></a>
      <nav className="hidden items-center gap-7 lg:flex" aria-label="Navegação principal">
        {nav.map(([label, href]) => <a key={href} href={href} className="text-[13px] font-medium text-[#c6c9c9] transition hover:text-[#f2c13a]" data-testid={`link-nav-${href.slice(1)}`}>{label}</a>)}
      </nav>
      <div className="flex items-center gap-3">
        <a href="#reservar" className="hidden rounded-full bg-[#f2c13a] px-5 py-2.5 text-[13px] font-bold text-[#15171d] transition hover:bg-[#ffd45a] sm:block" data-testid="link-header-reserve">Reservar horário</a>
        <button type="button" onClick={() => setOpen(!open)} className="rounded-lg border border-white/15 p-2 text-[#f6f0dc] lg:hidden" aria-label="Abrir menu" data-testid="button-mobile-menu">{open ? <X size={20} /> : <Menu size={20} />}</button>
      </div>
    </div>
    {open && <nav className="border-t border-white/10 bg-[#10151d] px-5 py-3 lg:hidden" aria-label="Menu mobile">
      {nav.map(([label, href]) => <a onClick={() => setOpen(false)} key={href} href={href} className="block border-b border-white/5 py-3 text-sm text-[#d8d8cf]" data-testid={`link-mobile-${href.slice(1)}`}>{label}</a>)}
      <a onClick={() => setOpen(false)} href="#reservar" className="mt-3 block rounded-lg bg-[#f2c13a] px-4 py-3 text-center text-sm font-bold text-[#15171d]" data-testid="link-mobile-reserve">Reservar horário</a>
    </nav>}
  </header>;
}

function Hero({ facilities, initialFacilityId, initialCourt, onSuccess }: { facilities: Facility[]; initialFacilityId?: number; initialCourt?: number; onSuccess: (booking: Booking) => void }) {
  return <section id="topo" className="hero-glow relative overflow-hidden border-b border-white/10 bg-[#0e1118] pt-28">
    <img src={aerialImage} alt="Vista aérea da Arena Gol de Ouro ao pôr do sol" className="absolute inset-0 h-full w-full object-cover object-top opacity-70" />
    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(40,28,6,.5)_4%,rgba(40,28,6,.3)_35%,rgba(40,28,6,.05)_100%)]" />
    <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(40,28,6,.22)_38%,rgba(40,28,6,.5)_58%,#171006_78%,#171006_100%)]" />
    <div className="relative mx-auto max-w-[1280px] px-5 pb-20 pt-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[560px_1fr] lg:items-center lg:gap-12">
        <div>
          <div className="reveal flex items-center gap-3"><span className="h-px w-10 bg-[#a8e85d]" /><span className="eyebrow">Esporte depois do pôr do sol</span></div>
          <img src={heroWordmarkImage} alt="Jogue onde a vitória acontece — Arena Gol de Ouro" className="reveal reveal-delay-1 mt-6 w-full max-w-[560px] rounded-2xl shadow-2xl" />
        </div>
        <div className="max-w-[475px]">
          <p className="reveal reveal-delay-2 text-base leading-7 text-[#c5c9c6] sm:text-lg">Futebol society, vôlei e futevôlei com estrutura premium no estacionamento do <strong className="font-bold text-[#f2c13a]">Shopping de Águas Lindas</strong>.</p>
          <div className="reveal reveal-delay-2 mt-5 inline-flex items-center gap-2.5 rounded-full border border-[#f2c13a]/50 bg-[#f2c13a]/10 px-5 py-2.5" data-testid="badge-shopping-location"><MapPin size={19} className="text-[#f2c13a]" /><span className="arena-display text-base font-bold uppercase tracking-wide text-[#f2c13a] sm:text-lg">Shopping de Águas Lindas</span></div>
          <div className="reveal reveal-delay-3 mt-9 flex flex-col gap-3 sm:flex-row">
            <a href="#reservar" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#f2c13a] px-6 py-3.5 text-sm font-bold text-[#15171d] transition hover:bg-[#ffd45a]" data-testid="link-hero-reserve">Escolher meu horário <ChevronRight size={17} /></a>
            <a href="#estrutura" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3.5 text-sm font-semibold text-[#f2f0e4] transition hover:border-[#f2c13a] hover:text-[#f2c13a]" data-testid="link-hero-structure">Conhecer a arena <ArrowDownRight size={16} /></a>
          </div>
          <div className="mt-14 flex flex-wrap items-center gap-x-7 gap-y-3 text-xs text-[#aeb6b4]"><span className="flex items-center gap-2"><Clock3 size={14} className="text-[#f2c13a]" /> 07h — 02h</span><span className="flex items-center gap-2"><ShieldCheck size={14} className="text-[#a8e85d]" /> Ambiente seguro</span></div>
        </div>
      </div>
      <div className="mt-16 -mx-5 lg:-mx-8"><BookingWidget facilities={facilities} initialFacilityId={initialFacilityId} initialCourt={initialCourt} onSuccess={onSuccess} /></div>
      <div id="arena" className="mt-16 grid gap-12 border-t border-white/10 pt-16 lg:grid-cols-[.95fr_1.05fr] lg:items-end">
        <div><p className="eyebrow">A casa do seu jogo</p><h2 className="arena-display mt-5 max-w-[580px] text-4xl font-semibold leading-[1.05] text-[#f5f0df] sm:text-6xl">Jogue onde<br /><span className="gold-text">a vitória acontece.</span></h2></div>
        <div className="max-w-[510px] lg:justify-self-end"><p className="text-lg leading-8 text-[#bbc0be]">A Arena nasceu para transformar uma partida comum em programa obrigatório. Luz na medida, gramado impecável, areia solta e um bar para esticar a resenha.</p><div className="mt-8 grid grid-cols-3 gap-5 border-t border-[#2a313d] pt-6"><div><div className="arena-display text-3xl font-bold text-[#f2c13a]">03</div><div className="mt-1 text-xs uppercase tracking-wider text-[#89929a]">modalidades</div></div><div><div className="arena-display text-3xl font-bold text-[#f2c13a]">06</div><div className="mt-1 text-xs uppercase tracking-wider text-[#89929a]">espaços de jogo</div></div><div><div className="arena-display text-3xl font-bold text-[#f2c13a]">∞</div><div className="mt-1 text-xs uppercase tracking-wider text-[#89929a]">bons momentos</div></div></div></div>
      </div>
    </div>
    <div className="relative mx-auto flex max-w-[1280px] items-center justify-between px-5 pb-6 pt-10 lg:px-8"><span className="text-[10px] font-bold uppercase tracking-[.22em] text-white/30">Águas Lindas • GO</span><span className="pulse-line h-px w-24 bg-[#f2c13a]" /></div>
  </section>;
}

const courtsLabel: Record<string, string> = { 'Quadra de Areia': '6 campos' };
const facilityVisual = (name: string) => (name.includes('Society') ? complexImage : name.includes('Areia') ? sandImage : loungeImage);
const facilityIcon = (name: string) => (name.includes('Society') ? Footprints : name.includes('Areia') ? Volleyball : Sparkles);

function Facilities({ facilities, isLoading, isError, onRetry, onSelect }: { facilities: Facility[]; isLoading: boolean; isError: boolean; onRetry: () => void; onSelect: (id: number, court?: number) => void }) {
  const [expandedFacilityId, setExpandedFacilityId] = useState<number | null>(null);
  const displayFacilities = facilities.filter((facility) => facility.name !== 'Área de Lazer');
  return <section id="estrutura" className="arena-grid relative overflow-hidden border-y border-[#252d38] bg-[#111720] px-5 pb-24 pt-36 lg:px-8 lg:pt-40">
    <video src={droneVideo} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover opacity-80" />
    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(42,30,6,.22)_0%,rgba(42,30,6,.45)_38%,#1a1408_100%)]" />
    <div className="relative mx-auto max-w-[1280px]"><div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><div className="flex items-center gap-3"><span className="h-px w-10 bg-[#f2c13a]" /><p className="eyebrow !text-[#f2c13a]">O palco está pronto</p></div><h2 className="arena-display mt-5 text-5xl font-bold leading-[.95] text-[#f5f0df] sm:text-7xl lg:text-[80px]">Escolha<br /><span className="gold-text">seu jogo.</span></h2></div><p className="max-w-[330px] text-sm leading-6 text-[#c1c6c4]">Tudo o que você precisa para chegar, jogar e sair querendo marcar o próximo.</p></div>
      {isLoading ? <div className="mt-10"><LoadingState label="Carregando espaços da arena" /></div> :
      isError ? <div className="mt-10"><ErrorState onRetry={onRetry} /></div> :
      displayFacilities.length === 0 ? <div className="mt-10 rounded-2xl border border-dashed border-[#34404b] p-10 text-center text-sm text-[#9da5a8]" data-testid="empty-facilities">Nenhuma modalidade disponível no momento. Tente novamente em instantes.</div> :
      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{displayFacilities.map((facility) => { const Icon = facilityIcon(facility.name); const hasCourts = facility.courts > 1; const expanded = expandedFacilityId === facility.id; return <article key={facility.id} className="lift group relative overflow-hidden rounded-2xl border border-[#2b3540] bg-[#171e28]" data-testid={`card-facility-${facility.id}`}>
        <div className="relative h-52 overflow-hidden"><img src={facilityVisual(facility.name)} alt={facility.name} className="h-full w-full object-cover opacity-75 transition duration-500 group-hover:scale-105 group-hover:opacity-95" /><div className="absolute inset-0 bg-gradient-to-t from-[#171e28] via-transparent to-transparent" /><span className="absolute left-4 top-4 rounded-full bg-[#10151c]/80 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#d9dfd4]">{facility.capacity} pessoas</span>{courtsLabel[facility.name] && <span className="absolute right-4 top-4 rounded-full bg-[#f2c13a] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#12151c]" data-testid={`badge-courts-${facility.id}`}>{courtsLabel[facility.name]}</span>}</div>
        <div className="p-5"><div className="flex items-start justify-between gap-4"><div><h3 className="arena-display text-2xl font-semibold text-[#f4f0df]">{facility.name}</h3><p className="mt-2 text-sm leading-6 text-[#9ea6aa]">{facility.description}</p></div><div className="rounded-lg bg-[#232b25] p-2 text-[#a8e85d]"><Icon size={19} /></div></div>
          <div className="mt-5 flex items-center justify-between border-t border-[#2a323c] pt-4"><div><span className="text-[11px] text-[#89929a]">a partir de</span><strong className="ml-2 text-sm text-[#f2c13a]">{money(facility.priceCents)} <span className="font-normal text-[#89929a]">/ hora</span></strong></div><button type="button" onClick={() => hasCourts ? setExpandedFacilityId(expanded ? null : facility.id) : onSelect(facility.id)} className="flex items-center gap-1 text-sm font-bold text-[#f2c13a] transition hover:text-[#ffe07b]" data-testid={`button-select-facility-${facility.id}`}>Reservar <ArrowUpRight size={15} /></button></div>
          {hasCourts && expanded && <div className="mt-4 rounded-xl border border-[#35404d] bg-[#111720] p-4" data-testid={`box-facility-courts-${facility.id}`}><p className="mb-3 text-sm font-semibold text-[#e8e5d5]">Escolha o campo</p><div className="grid grid-cols-3 gap-2">{Array.from({ length: facility.courts }, (_, index) => index + 1).map((n) => <button type="button" key={n} onClick={() => onSelect(facility.id, n)} className="rounded-lg border border-[#35404d] bg-[#171e28] px-2 py-3 text-sm font-semibold text-[#d8d9d0] transition hover:border-[#a8e85d]" data-testid={`button-facility-court-${facility.id}-${n}`}>Campo {n}</button>)}</div></div>}
        </div>
      </article>; })}</div>}
    </div>
  </section>;
}

function Experience() {
  return <section className="bg-[#0e1118] px-5 py-24 lg:px-8 lg:py-32"><div className="mx-auto grid max-w-[1280px] gap-5 md:grid-cols-12 md:grid-rows-[240px_210px]">
    <div className="group relative overflow-hidden rounded-2xl md:col-span-7 md:row-span-2"><img src={aerialImage} alt="Vista aérea da Arena Gol de Ouro" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-[#0e1118]/90 via-transparent to-transparent" /><div className="absolute bottom-6 left-6"><p className="eyebrow">Identidade em cada detalhe</p><h3 className="arena-display mt-2 text-3xl font-semibold text-[#f6f0df]">Aqui, o jogo<br />também é cultura.</h3></div></div>
    <div className="group relative overflow-hidden rounded-2xl md:col-span-5"><img src={loungeImage} alt="Bar e lounge da Arena" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-[#0e1118]/90 via-transparent to-transparent" /><div className="absolute bottom-5 left-5"><span className="text-sm font-semibold text-[#f2c13a]">Bar & lounge</span><p className="mt-1 text-xs text-[#d3d0c1]">A partida continua por aqui.</p></div></div>
    <div className="relative overflow-hidden rounded-2xl border border-[#2b3540] bg-[#151b24] p-6 md:col-span-5"><div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: `url(${facadeImage})` }} /><div className="relative"><div className="absolute right-0 top-0 text-[#a8e85d]"><Users size={25} /></div><p className="eyebrow">Para o seu time</p><h3 className="arena-display mt-3 max-w-[260px] text-2xl font-semibold text-[#f5f0df]">Aniversário, campeonato ou só aquela quarta-feira.</h3><a href="#contato" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#f2c13a]" data-testid="link-events">Falar sobre eventos <ChevronRight size={15} /></a></div></div>
  </div></section>;
}

type CartItem = { facilityId: number; court: number; date: string; startTime: string; endTime: string };
const cartKey = (item: Pick<CartItem, 'facilityId' | 'court' | 'date' | 'startTime'>) => `${item.facilityId}|${item.court}|${item.date}|${item.startTime}`;
const MAX_COMBO_ITEMS = 40;

function BookingWidget({ facilities, initialFacilityId, initialCourt, onSuccess }: { facilities: Facility[]; initialFacilityId?: number; initialCourt?: number; onSuccess: (booking: Booking) => void }) {
  const bookableFacilities = useMemo(() => facilities.filter((facility) => facility.name !== 'Área de Lazer'), [facilities]);
  const [date, setDate] = useState(todayISO());
  const [facilityId, setFacilityId] = useState(initialFacilityId ?? bookableFacilities[0]?.id ?? 0);
  const [court, setCourt] = useState(initialCourt ?? 1);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState({ name: '', phone: '', email: '' });
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitError, setSubmitError] = useState('');
  const availabilityParams = useMemo(() => ({ date, facilityId: facilityId || undefined }), [date, facilityId]);
  const availabilityQuery = useListAvailability(availabilityParams, { query: { queryKey: getListAvailabilityQueryKey(availabilityParams), enabled: Boolean(facilityId && date) } });
  const createBooking = useCreateBooking();
  const queryClient = useQueryClient();
  const selectedFacility = bookableFacilities.find((facility) => facility.id === facilityId);
  const slots = availabilityQuery.data ?? [];
  const availableSlots = slots.filter((item) => item.status === 'available' && item.court === court);
  const priceOf = (id: number) => facilities.find((facility) => facility.id === id)?.priceCents ?? 0;
  const nameOf = (item: CartItem) => { const facility = facilities.find((entry) => entry.id === item.facilityId); return `${facility?.name ?? 'Espaço'}${(facility?.courts ?? 1) > 1 ? ` · Campo ${item.court}` : ''}`; };
  const isInCart = (startTime: string) => cart.some((item) => cartKey(item) === cartKey({ facilityId, court, date, startTime }));
  const toggleSlot = (item: { startTime: string; endTime: string }) => setCart((current) => {
    const key = cartKey({ facilityId, court, date, startTime: item.startTime });
    if (current.some((entry) => cartKey(entry) === key)) return current.filter((entry) => cartKey(entry) !== key);
    if (current.length >= MAX_COMBO_ITEMS) return current;
    return [...current, { facilityId, court, date, startTime: item.startTime, endTime: item.endTime }];
  });
  const removeItem = (key: string) => setCart((current) => current.filter((entry) => cartKey(entry) !== key));
  const sortedCart = useMemo(() => [...cart].sort((a, b) => a.date.localeCompare(b.date) || a.facilityId - b.facilityId || a.court - b.court || a.startTime.localeCompare(b.startTime)), [cart]);
  const totalCents = cart.reduce((sum, item) => sum + priceOf(item.facilityId), 0);
  const updateCustomer = (key: 'name' | 'phone' | 'email', value: string) => setCustomer((current) => ({ ...current, [key]: value }));
  const canContinue = Boolean(cart.length > 0 && customer.name.trim().length > 1 && customer.phone.trim().length >= 10 && customer.email.includes('@'));
  useEffect(() => {
    if (!initialFacilityId) return;
    setFacilityId(initialFacilityId);
    setCourt(initialCourt ?? 1);
    setStep(1);
    // Only react to the parent explicitly requesting a facility (e.g. a "Reservar" card click) —
    // not to the user's own manual changes in the dropdown below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFacilityId, initialCourt]);
  useEffect(() => {
    if (!facilityId && bookableFacilities[0]) {
      setFacilityId(bookableFacilities[0].id);
    }
  }, [bookableFacilities, facilityId]);
  const submit = () => {
    if (cart.length === 0) return;
    setSubmitError('');
    createBooking.mutate({ data: { items: cart.map(({ facilityId: id, court: courtNumber, date: day, startTime, endTime }) => ({ facilityId: id, court: courtNumber, date: day, startTime, endTime })), customerName: customer.name, customerPhone: customer.phone, customerEmail: customer.email, paymentMethod } }, {
      onSuccess: (created) => {
        void queryClient.invalidateQueries({ queryKey: getListAvailabilityQueryKey(availabilityParams) });
        void queryClient.invalidateQueries({ queryKey: getListReservationsQueryKey() });
        setCart([]);
        setStep(1);
        onSuccess(created);
      },
      onError: (error) => {
        const status = (error as { status?: number }).status;
        if (status === 409) {
          void queryClient.invalidateQueries({ queryKey: getListAvailabilityQueryKey(availabilityParams) });
          setSubmitError('Algum horário do combo acabou de ser reservado por outra pessoa. Volte, revise o combo e escolha outro horário.');
        } else {
          setSubmitError('Não foi possível concluir agora. Confira os dados e tente novamente.');
        }
      },
    });
  };
  const comboList = (removable: boolean) => <ul className="space-y-2" data-testid="list-combo">{sortedCart.map((item) => <li key={cartKey(item)} className="flex items-center justify-between gap-3 rounded-lg bg-[#16231e] px-3 py-2 text-sm text-[#dce6d3]"><span>{nameOf(item)} · {prettyDateShort(item.date)} · {item.startTime}–{item.endTime}</span><span className="flex shrink-0 items-center gap-3"><strong className="text-[#f2c13a]">{money(priceOf(item.facilityId))}</strong>{removable && <button type="button" onClick={() => removeItem(cartKey(item))} className="text-[#a8b9a1] hover:text-[#f4a59b]" aria-label={`Remover ${item.startTime} do combo`} data-testid={`button-remove-${cartKey(item)}`}><X size={14} /></button>}</span></li>)}</ul>;
  return <section id="reservar" className="arena-grid border-y border-[#252d38] bg-[#121923] px-5 py-24 lg:px-8"><div className="mx-auto max-w-[1280px]"><div className="grid gap-10 lg:grid-cols-[.75fr_1.25fr] lg:items-start"><div className="lg:sticky lg:top-24"><p className="eyebrow">Reserva online</p><h2 className="arena-display mt-4 text-4xl font-semibold leading-[1.05] text-[#f5f0df] sm:text-5xl">Seu próximo<br /><span className="gold-text">jogo começa aqui.</span></h2><p className="mt-5 max-w-[360px] text-base leading-7 text-[#aeb6b4]">Monte seu combo: escolha um ou vários horários, em um ou mais campos, e pague tudo de uma vez. É rápido, seguro e sem ligação.</p><div className="mt-10 space-y-5"><div className="flex gap-4"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f2c13a] text-sm font-bold text-[#11151c]">1</span><div><strong className="text-sm text-[#f4f0df]">Monte o combo</strong><p className="mt-1 text-xs text-[#89929a]">Vários horários e campos na mesma reserva.</p></div></div><div className="flex gap-4"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#27302d] text-sm font-bold text-[#a8e85d]">2</span><div><strong className="text-sm text-[#f4f0df]">Preencha seus dados</strong><p className="mt-1 text-xs text-[#89929a]">Só o essencial para confirmar.</p></div></div><div className="flex gap-4"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#27302d] text-sm font-bold text-[#a8e85d]">3</span><div><strong className="text-sm text-[#f4f0df]">Pague com Pix</strong><p className="mt-1 text-xs text-[#89929a]">Valor calculado e fixo no QR Code.</p></div></div></div></div>
      <div className="rounded-2xl border border-[#2d3744] bg-[#171e28] p-5 shadow-2xl sm:p-7" data-testid="booking-widget"><div className="mb-7 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#89929a]">Agendar espaço</p><p className="mt-1 text-sm text-[#d9d8cc]">Passo {step} de 3</p></div><div className="flex gap-1.5">{[1, 2, 3].map((item) => <span key={item} className={`h-1 w-10 rounded-full ${item <= step ? 'bg-[#f2c13a]' : 'bg-[#303946]'}`} />)}</div></div>
        {step === 1 && <div className="space-y-6"><div><label htmlFor="booking-date" className="mb-2 block text-sm font-semibold text-[#e8e5d5]">Qual dia?</label><input id="booking-date" type="date" min={todayISO()} value={date} onChange={(event) => setDate(event.target.value)} className="w-full rounded-xl border border-[#35404d] bg-[#111720] px-4 py-3 text-sm text-[#f3f0e1] [color-scheme:dark]" data-testid="input-booking-date" /></div><div><label htmlFor="booking-facility" className="mb-2 block text-sm font-semibold text-[#e8e5d5]">Qual modalidade?</label><div className="relative"><select id="booking-facility" value={facilityId} onChange={(event) => { setFacilityId(Number(event.target.value)); setCourt(1); }} className="w-full appearance-none rounded-xl border border-[#35404d] bg-[#111720] px-4 py-3 text-sm text-[#f3f0e1]" data-testid="select-booking-facility">{bookableFacilities.map((facility) => <option key={facility.id} value={facility.id}>{facility.name} · {money(facility.priceCents)}/h</option>)}</select><ChevronDown className="pointer-events-none absolute right-4 top-3.5 text-[#a8e85d]" size={17} /></div></div>{(selectedFacility?.courts ?? 1) > 1 && <div className="rounded-xl border border-[#35404d] bg-[#111720] p-4" data-testid="box-court-selector"><label className="mb-3 block text-sm font-semibold text-[#e8e5d5]">Escolha o campo</label><div className="grid grid-cols-3 gap-2 sm:grid-cols-6">{Array.from({ length: selectedFacility?.courts ?? 1 }, (_, index) => index + 1).map((n) => <button type="button" key={n} onClick={() => setCourt(n)} className={`rounded-lg border px-2 py-3 text-sm font-semibold transition ${court === n ? 'border-[#a8e85d] bg-[#a8e85d] text-[#11151c]' : 'border-[#35404d] bg-[#171e28] text-[#d8d9d0] hover:border-[#a8e85d]'}`} data-testid={`button-court-${n}`}>Campo {n}</button>)}</div></div>}<div><div className="mb-2 flex items-center justify-between"><label className="block text-sm font-semibold text-[#e8e5d5]">Horários disponíveis <span className="font-normal text-[#7f8993]">· escolha quantos quiser</span></label><span className="text-xs text-[#7f8993]">{prettyDate(date)}</span></div>{availabilityQuery.isLoading ? <LoadingState label="Buscando horários livres" /> : availabilityQuery.isError ? <ErrorState onRetry={() => availabilityQuery.refetch()} /> : availableSlots.length === 0 ? <div className="rounded-xl border border-dashed border-[#35404d] px-4 py-8 text-center text-sm text-[#929ca2]" data-testid="empty-slots">Nenhum horário livre para este dia. Tente outra data.</div> : <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{availableSlots.map((item) => <button type="button" key={`${item.startTime}-${item.endTime}`} aria-pressed={isInCart(item.startTime)} onClick={() => toggleSlot(item)} className={`rounded-lg border px-3 py-3 text-sm font-semibold transition ${isInCart(item.startTime) ? 'border-[#f2c13a] bg-[#f2c13a] text-[#11151c]' : 'border-[#35404d] bg-[#111720] text-[#d8d9d0] hover:border-[#a8e85d]'}`} data-testid={`button-slot-${item.startTime}`}>{item.startTime} — {item.endTime}</button>)}</div>}</div>{cart.length > 0 && <div className="rounded-xl border border-[#4e532e] bg-[#1c2c25] p-4" data-testid="box-combo"><div className="mb-3 flex items-center justify-between"><p className="text-sm font-bold text-[#eff3dd]">Seu combo</p><span className="text-xs text-[#a8b9a1]">{cart.length} {cart.length === 1 ? 'horário' : 'horários'}</span></div>{comboList(true)}<div className="mt-3 flex items-center justify-between border-t border-[#2e4a3a] pt-3"><span className="text-sm text-[#a8b9a1]">Total</span><strong className="text-lg text-[#f2c13a]" data-testid="text-combo-total">{money(totalCents)}</strong></div></div>}<button type="button" disabled={cart.length === 0} onClick={() => setStep(2)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#f2c13a] px-5 py-3.5 text-sm font-bold text-[#12151c] transition hover:bg-[#ffd45a] disabled:cursor-not-allowed disabled:opacity-40" data-testid="button-booking-next">{cart.length > 0 ? `Continuar · ${money(totalCents)}` : 'Escolha ao menos um horário'} <ChevronRight size={17} /></button></div>}
        {step === 2 && <div className="space-y-6"><div><p className="text-sm font-semibold text-[#e8e5d5]">Quem vai jogar?</p><p className="mt-1 text-xs text-[#89929a]">Enviaremos a confirmação por WhatsApp e e-mail.</p></div><div className="grid gap-4 sm:grid-cols-2"><label className="sm:col-span-2"><span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#9da5a8]">Nome completo</span><input value={customer.name} onChange={(event) => updateCustomer('name', event.target.value)} placeholder="Como podemos te chamar?" className="w-full rounded-xl border border-[#35404d] bg-[#111720] px-4 py-3 text-sm text-[#f3f0e1] placeholder:text-[#69747e]" data-testid="input-customer-name" /></label><label><span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#9da5a8]">WhatsApp</span><input value={customer.phone} onChange={(event) => updateCustomer('phone', event.target.value)} placeholder="(61) 9 0000-0000" className="w-full rounded-xl border border-[#35404d] bg-[#111720] px-4 py-3 text-sm text-[#f3f0e1] placeholder:text-[#69747e]" data-testid="input-customer-phone" /></label><label><span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#9da5a8]">E-mail</span><input type="email" value={customer.email} onChange={(event) => updateCustomer('email', event.target.value)} placeholder="voce@email.com" className="w-full rounded-xl border border-[#35404d] bg-[#111720] px-4 py-3 text-sm text-[#f3f0e1] placeholder:text-[#69747e]" data-testid="input-customer-email" /></label></div><div className="flex gap-3"><button type="button" onClick={() => setStep(1)} className="flex-1 rounded-xl border border-[#35404d] px-5 py-3.5 text-sm font-semibold text-[#c2c7c3] hover:border-[#a8e85d]" data-testid="button-booking-back">Voltar</button><button type="button" disabled={!canContinue} onClick={() => setStep(3)} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#f2c13a] px-5 py-3.5 text-sm font-bold text-[#12151c] transition hover:bg-[#ffd45a] disabled:cursor-not-allowed disabled:opacity-40" data-testid="button-customer-next">Revisar <ChevronRight size={17} /></button></div></div>}
        {step === 3 && <div className="space-y-5"><div><p className="text-sm font-semibold text-[#e8e5d5]">Revise seu combo</p><p className="mt-1 text-xs text-[#89929a]">Tudo certo? Falta só escolher o pagamento.</p></div><div className="rounded-xl border border-[#35404d] bg-[#111720] p-4"><div className="mb-3 flex items-center justify-between"><p className="text-xs uppercase tracking-wider text-[#87919a]">{cart.length} {cart.length === 1 ? 'horário' : 'horários'}</p><CalendarDays className="text-[#a8e85d]" size={20} /></div>{comboList(false)}<div className="mt-4 flex items-center justify-between border-t border-[#28313d] pt-4"><span className="text-sm text-[#aeb6b4]">Total da reserva</span><strong className="text-lg text-[#f2c13a]" data-testid="text-review-total">{money(totalCents)}</strong></div></div><div><p className="mb-2 text-sm font-semibold text-[#e8e5d5]">Forma de pagamento</p><div className="grid grid-cols-2 gap-3"><button type="button" onClick={() => setPaymentMethod('pix')} className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${paymentMethod === 'pix' ? 'border-[#a8e85d] bg-[#1c2c25]' : 'border-[#35404d] bg-[#111720]'}`} data-testid="button-payment-pix"><QrCode size={18} className="text-[#a8e85d]" /><span><strong className="block text-sm text-[#eeeada]">Pix</strong><small className="text-xs text-[#8f9a9e]">Valor fixo, sem digitar</small></span></button><button type="button" onClick={() => setPaymentMethod('card')} className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${paymentMethod === 'card' ? 'border-[#f2c13a] bg-[#302a1d]' : 'border-[#35404d] bg-[#111720]'}`} data-testid="button-payment-card"><CreditCard size={18} className="text-[#f2c13a]" /><span><strong className="block text-sm text-[#eeeada]">Cartão</strong><small className="text-xs text-[#8f9a9e]">Débito ou crédito</small></span></button></div></div>{submitError && <p className="text-sm text-[#f4a59b]" data-testid="status-booking-error">{submitError}</p>}<div className="flex gap-3"><button type="button" onClick={() => setStep(submitError ? 1 : 2)} className="flex-1 rounded-xl border border-[#35404d] px-5 py-3.5 text-sm font-semibold text-[#c2c7c3]" data-testid="button-review-back">Voltar</button><button type="button" disabled={createBooking.isPending} onClick={submit} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#f2c13a] px-5 py-3.5 text-sm font-bold text-[#12151c] transition hover:bg-[#ffd45a] disabled:opacity-60" data-testid="button-confirm-booking">{createBooking.isPending ? 'Confirmando...' : `Confirmar · ${money(totalCents)}`}</button></div></div>}
      </div>
    </div></div></section>;
}

function Confirmation({ booking, onReset }: { booking: Booking; onReset: () => void }) {
  const [copied, setCopied] = useState(false);
  const [qrImage, setQrImage] = useState('');
  const pixPayload = booking.pix?.payload ?? '';
  useEffect(() => {
    if (!pixPayload) return;
    let active = true;
    QRCode.toDataURL(pixPayload, { margin: 1, width: 320, errorCorrectionLevel: 'M' }).then((url) => { if (active) setQrImage(url); }).catch(() => undefined);
    return () => { active = false; };
  }, [pixPayload]);
  const copyPix = async () => {
    await navigator.clipboard?.writeText(pixPayload);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#090c11]/85 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" data-testid="reservation-confirmation"><div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-[#4e532e] bg-[#171e28] p-7 shadow-2xl sm:p-9"><div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#a8e85d] text-[#11151c]"><CircleCheck size={29} /></div><p className="eyebrow mt-6">Reserva recebida</p><h2 className="arena-display mt-2 text-3xl font-semibold text-[#f5f0df]">Está marcado.</h2><p className="mt-3 text-sm leading-6 text-[#aeb6b4]">Seu pedido foi enviado para a equipe. Em breve você recebe os detalhes no WhatsApp.</p><div className="mt-6 rounded-xl border border-[#35404d] bg-[#111720] p-4"><div className="flex justify-between"><span className="text-xs uppercase tracking-wider text-[#89929a]">Protocolo</span><strong className="text-sm text-[#f2c13a]" data-testid="text-booking-code">{booking.code}</strong></div><ul className="mt-3 space-y-2">{booking.reservations.map((reservation) => <li key={reservation.id} className="flex justify-between gap-3 text-sm text-[#d8d9d0]"><span>{reservation.facilityName}{reservation.court && reservation.court > 1 ? ` · Campo ${reservation.court}` : ''} · {prettyDateShort(reservation.date)} · {reservation.startTime}–{reservation.endTime}</span><span className="shrink-0 text-[#f2c13a]">{money(reservation.priceCents)}</span></li>)}</ul><div className="mt-3 flex items-center justify-between border-t border-[#28313d] pt-3"><span className="text-sm text-[#aeb6b4]">Total</span><strong className="text-lg text-[#f2c13a]" data-testid="text-confirmation-total">{money(booking.totalCents)}</strong></div></div>{booking.pix && <div className="mt-4 rounded-xl border border-[#4e532e] bg-[#1c2c25] p-4" data-testid="box-pix"><p className="text-sm font-bold text-[#eff3dd]">Pague com Pix</p><p className="mt-1 text-xs text-[#a8b9a1]">Escaneie o QR Code ou use o Pix copia e cola. O valor de <strong className="text-[#f2c13a]">{money(booking.pix.amountCents)}</strong> já vem fixo e não pode ser alterado.</p><div className="mt-3 flex justify-center rounded-lg bg-white p-3">{qrImage ? <img src={qrImage} alt={`QR Code Pix no valor de ${money(booking.pix.amountCents)}`} className="h-56 w-56" data-testid="image-pix-qr" /> : <div className="flex h-56 w-56 items-center justify-center text-xs text-[#5c6470]">Gerando QR Code...</div>}</div><div className="mt-3 rounded-lg border border-[#56714b] bg-[#16231e] px-3 py-2 text-center"><span className="text-[11px] uppercase tracking-wider text-[#a8b9a1]">Valor a pagar</span><strong className="block text-2xl text-[#f2c13a]" data-testid="text-pix-amount">{money(booking.pix.amountCents)}</strong></div><button type="button" onClick={copyPix} className="mt-3 flex w-full items-center justify-between rounded-lg border border-[#56714b] bg-[#16231e] px-3 py-2 text-left text-xs text-[#dce6d3]" data-testid="button-copy-pix"><span className="truncate">{pixPayload}</span><span className="ml-3 shrink-0 font-bold text-[#a8e85d]">{copied ? 'Copiado' : 'Copiar código'}</span></button><details className="mt-3 text-xs text-[#a8b9a1]"><summary className="cursor-pointer font-semibold text-[#dce6d3]">Como pagar com Pix</summary><img src={pixInstructionsImage} alt="Como pagar com Pix: acesse o Pix no app do seu banco, selecione leitura de QR Code, escaneie e confirme a transferência" className="mt-3 w-full rounded-lg border border-[#56714b]" data-testid="image-pix-instructions" /></details></div>}<button type="button" onClick={onReset} className="mt-7 w-full rounded-xl bg-[#f2c13a] px-5 py-3.5 text-sm font-bold text-[#12151c]" data-testid="button-close-confirmation">Fazer outra reserva</button></div></div>;
}

function LeadCapture() {
  const createLead = useCreateLead();
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const submit = () => { setError(''); createLead.mutate({ data: form }, { onSuccess: () => setDone(true), onError: () => setError('Não foi possível cadastrar agora. Tente novamente.') }); };
  return <section id="contato" className="relative overflow-hidden bg-[#d8b33b] px-5 py-20 text-[#15171d] lg:px-8"><div className="absolute right-0 top-0 h-full w-1/3 bg-cover opacity-10 mix-blend-multiply" style={{ backgroundImage: `url(${muralImage})` }} /><div className="relative mx-auto grid max-w-[1280px] gap-10 lg:grid-cols-[1fr_1fr] lg:items-center"><div><p className="eyebrow !text-[#2c4c34]">Fique por dentro</p><h2 className="arena-display mt-4 max-w-[520px] text-4xl font-bold leading-[1.04] sm:text-6xl">Os melhores jogos começam com um convite.</h2><p className="mt-5 max-w-[410px] text-sm leading-6 text-[#3c3b29]">Cadastre-se para receber novidades, campeonatos e horários especiais da Arena.</p><div className="mt-7 flex flex-wrap gap-5 text-xs font-semibold text-[#4b482b]"><span className="flex items-center gap-2"><Phone size={14} /> (61) 9263-6485</span><span className="flex items-center gap-2"><MapPin size={14} /> Águas Lindas, GO</span><a href="https://instagram.com/goldeouroshopping" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[#2c4c34]" data-testid="link-contact-instagram"><Instagram size={14} /> @goldeouroshopping</a></div></div>{done ? <div className="rounded-2xl border border-[#2c4c34]/30 bg-[#e4c655] p-8" data-testid="lead-success"><CircleCheck size={32} className="text-[#2c4c34]" /><h3 className="arena-display mt-4 text-2xl font-bold">Cadastro feito.</h3><p className="mt-2 text-sm text-[#4b482b]">Quando a próxima resenha começar, você vai saber.</p></div> : <div className="rounded-2xl bg-[#111720] p-6 text-[#f5f0df] shadow-2xl sm:p-8"><h3 className="text-lg font-semibold">Receba a agenda da arena</h3><div className="mt-5 space-y-3"><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Seu nome" className="w-full rounded-xl border border-[#35404d] bg-[#1a222d] px-4 py-3 text-sm text-[#f5f0df] placeholder:text-[#7d8892]" data-testid="input-lead-name" /><input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="WhatsApp" className="w-full rounded-xl border border-[#35404d] bg-[#1a222d] px-4 py-3 text-sm text-[#f5f0df] placeholder:text-[#7d8892]" data-testid="input-lead-phone" /><input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="Seu melhor e-mail" className="w-full rounded-xl border border-[#35404d] bg-[#1a222d] px-4 py-3 text-sm text-[#f5f0df] placeholder:text-[#7d8892]" data-testid="input-lead-email" /></div>{error && <p className="mt-3 text-sm text-[#f3a59b]" data-testid="status-lead-error">{error}</p>}<button type="button" disabled={createLead.isPending || !form.name || !form.phone || !form.email} onClick={submit} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#f2c13a] px-5 py-3.5 text-sm font-bold text-[#15171d] disabled:opacity-50" data-testid="button-submit-lead">{createLead.isPending ? 'Cadastrando...' : 'Quero receber novidades'} <ArrowUpRight size={16} /></button><p className="mt-3 text-center text-[11px] text-[#78838c]">Sem spam. Só o que vale a pena.</p></div>}</div></section>;
}

function BlockedSlots({ facilities }: { facilities: Facility[] }) {
  const blockedQuery = useListBlockedSlots({ query: { queryKey: getListBlockedSlotsQueryKey() } });
  const createBlockedSlot = useCreateBlockedSlot();
  const deleteBlockedSlot = useDeleteBlockedSlot();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ facilityId: facilities[0]?.id ?? 1, date: todayISO(), startTime: '21:00', reason: 'Manutenção' });

  useEffect(() => {
    if (facilities.length && !facilities.some((facility) => facility.id === form.facilityId)) {
      setForm((current) => ({ ...current, facilityId: facilities[0].id }));
    }
  }, [facilities, form.facilityId]);

  const submit = () => {
    const hour = Number(form.startTime.slice(0, 2));
    createBlockedSlot.mutate({
      data: {
        facilityId: form.facilityId,
        date: form.date,
        startTime: form.startTime,
        endTime: `${String(hour + 1).padStart(2, '0')}:00`,
        reason: form.reason || undefined,
      },
    }, {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: getListBlockedSlotsQueryKey() });
        void queryClient.invalidateQueries({ queryKey: getListAvailabilityQueryKey({ date: form.date, facilityId: form.facilityId }) });
      },
    });
  };

  const release = (slot: BlockedSlot) => {
    deleteBlockedSlot.mutate({ id: slot.id }, {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: getListBlockedSlotsQueryKey() });
        void queryClient.invalidateQueries({ queryKey: getListAvailabilityQueryKey({ date: slot.date, facilityId: slot.facilityId }) });
      },
    });
  };

  return <section className="mt-10 rounded-2xl border border-[#2c3540] bg-[#151b24] p-5 sm:p-6" data-testid="blocked-slots-panel"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="eyebrow">Agenda interna</p><h2 className="arena-display mt-2 text-2xl font-semibold text-[#f5f0df]">Bloquear um horário</h2><p className="mt-1 text-sm text-[#89929a]">Feche a agenda para manutenção, eventos ou ajustes operacionais.</p></div><ShieldCheck className="hidden text-[#a8e85d] sm:block" size={24} /></div><div className="mt-5 grid gap-3 md:grid-cols-[1.3fr_1fr_1fr_1.4fr_auto]"><select value={form.facilityId} onChange={(event) => setForm({ ...form, facilityId: Number(event.target.value) })} className="rounded-lg border border-[#35404d] bg-[#111720] px-3 py-2.5 text-sm text-[#e4e5d9]" aria-label="Espaço do bloqueio" data-testid="select-block-facility">{facilities.map((facility) => <option key={facility.id} value={facility.id}>{facility.shortName}</option>)}</select><input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className="rounded-lg border border-[#35404d] bg-[#111720] px-3 py-2.5 text-sm text-[#e4e5d9] [color-scheme:dark]" aria-label="Data do bloqueio" /><select value={form.startTime} onChange={(event) => setForm({ ...form, startTime: event.target.value })} className="rounded-lg border border-[#35404d] bg-[#111720] px-3 py-2.5 text-sm text-[#e4e5d9]" aria-label="Horário do bloqueio">{Array.from({ length: 16 }, (_, index) => { const hour = index + 7; const value = `${String(hour).padStart(2, '0')}:00`; return <option key={value} value={value}>{value}</option>; })}</select><input value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} placeholder="Motivo (opcional)" className="rounded-lg border border-[#35404d] bg-[#111720] px-3 py-2.5 text-sm text-[#e4e5d9] placeholder:text-[#69747e]" aria-label="Motivo do bloqueio" /><button type="button" onClick={submit} disabled={createBlockedSlot.isPending || !form.date || !facilities.length} className="rounded-lg bg-[#a8e85d] px-4 py-2.5 text-sm font-bold text-[#12151c] disabled:opacity-50" data-testid="button-block-slot">{createBlockedSlot.isPending ? 'Salvando...' : 'Bloquear'}</button></div>{blockedQuery.isLoading ? <div className="mt-5 text-sm text-[#89929a]">Carregando bloqueios...</div> : blockedQuery.isError ? <div className="mt-5"><ErrorState label="Não foi possível carregar os bloqueios." onRetry={() => blockedQuery.refetch()} /></div> : <div className="mt-5 flex flex-wrap gap-2">{(blockedQuery.data ?? []).length === 0 ? <p className="text-sm text-[#89929a]" data-testid="empty-blocked-slots">Nenhum horário bloqueado.</p> : (blockedQuery.data ?? []).map((slot) => <div key={slot.id} className="flex items-center gap-3 rounded-lg border border-[#35404d] bg-[#111720] px-3 py-2 text-xs" data-testid={`row-blocked-slot-${slot.id}`}><span className="font-bold text-[#f2c13a]">{prettyDateShort(slot.date)} · {slot.startTime}</span><span className="text-[#aeb6b4]">{facilities.find((facility) => facility.id === slot.facilityId)?.shortName ?? 'Espaço'}</span><span className="hidden text-[#7f8993] sm:inline">{slot.reason ?? 'Bloqueio operacional'}</span><button type="button" onClick={() => release(slot)} className="ml-1 text-[#a8e85d] hover:text-[#efffb4]" aria-label={`Liberar ${slot.startTime}`} data-testid={`button-release-slot-${slot.id}`}>Liberar</button></div>)}</div>}</section>;
}

function Footer() {
  return <footer className="bg-[#0a0d12] px-5 pb-8 pt-14 lg:px-8"><div className="mx-auto max-w-[1280px]"><div className="flex flex-col justify-between gap-8 border-b border-[#232b35] pb-10 sm:flex-row"><div><Brand /><p className="mt-4 max-w-[250px] text-sm leading-6 text-[#78838c]">O lugar onde o esporte encontra a boa noite.</p><a href="https://instagram.com/goldeouroshopping" target="_blank" rel="noreferrer" className="mt-4 flex w-fit items-center gap-2 text-sm text-[#aeb6b4] hover:text-[#f2c13a]" data-testid="link-footer-instagram"><Instagram size={15} /> @goldeouroshopping</a></div><div className="grid grid-cols-2 gap-10 text-sm"><div><p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#a8e85d]">Navegue</p><a href="#arena" className="block py-1 text-[#aeb6b4] hover:text-[#f2c13a]">A arena</a><a href="#estrutura" className="block py-1 text-[#aeb6b4] hover:text-[#f2c13a]">Estrutura</a><a href="#reservar" className="block py-1 text-[#aeb6b4] hover:text-[#f2c13a]">Reservas</a></div><div><p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#a8e85d]">Equipe</p><a href="#contato" className="block py-1 text-[#aeb6b4] hover:text-[#f2c13a]">Eventos</a><a href="#contato" className="block py-1 text-[#aeb6b4] hover:text-[#f2c13a]">Contato</a><a href="/admin" className="block py-1 text-[#aeb6b4] hover:text-[#f2c13a]" data-testid="link-admin-footer">Área da equipe</a></div></div></div><div className="flex flex-col justify-between gap-3 pt-6 text-xs text-[#667079] sm:flex-row"><span>© {new Date().getFullYear()} Arena Gol de Ouro</span><span>Shopping de Águas Lindas · Goiás</span></div></div></footer>;
}

function Home() {
  const facilitiesQuery = useListFacilities({ query: { queryKey: getListFacilitiesQueryKey() } });
  const [initialFacilityId, setInitialFacilityId] = useState<number>();
  const [initialCourt, setInitialCourt] = useState<number>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const facilities = facilitiesQuery.data ?? [];
  const scrollToBooking = (id: number, court?: number) => { setInitialFacilityId(id); setInitialCourt(court); document.getElementById('reservar')?.scrollIntoView({ behavior: 'smooth' }); };
  return <div className="noise min-h-[100dvh] overflow-hidden bg-[#0e1118]"><SiteHeader /><main><Facilities facilities={facilities} isLoading={facilitiesQuery.isLoading} isError={facilitiesQuery.isError} onRetry={() => facilitiesQuery.refetch()} onSelect={scrollToBooking} /><Hero facilities={facilities} initialFacilityId={initialFacilityId} initialCourt={initialCourt} onSuccess={setBooking} /><Experience /><LeadCapture /></main><Footer />{booking && <Confirmation booking={booking} onReset={() => setBooking(null)} />}</div>;
}

function StatusPill({ status }: { status: ReservationStatus }) {
  const map = { pending: ['Pendente', 'bg-[#342b19] text-[#f2c13a]'], confirmed: ['Confirmada', 'bg-[#1c332b] text-[#a8e85d]'], cancelled: ['Cancelada', 'bg-[#372127] text-[#ed9c92]'] } as const;
  const [label, className] = map[status];
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${className}`} data-testid={`status-reservation-${status}`}>{label}</span>;
}

function Admin() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  const queryClient = useQueryClient();
  const facilitiesQuery = useListFacilities({ query: { queryKey: getListFacilitiesQueryKey() } });
  const summaryQuery = useGetAdminSummary({ query: { queryKey: getGetAdminSummaryQueryKey() } });
  const reservationsParams = filter === 'all' ? undefined : { status: filter };
  const reservationsQuery = useListReservations(reservationsParams, { query: { queryKey: getListReservationsQueryKey(reservationsParams) } });
  const updateReservation = useUpdateReservation();
  const reservations = reservationsQuery.data ?? [];
  const changeStatus = (reservation: Reservation, status: 'confirmed' | 'cancelled') => updateReservation.mutate({ id: reservation.id, data: { status } }, { onSuccess: () => { void queryClient.invalidateQueries({ queryKey: getListReservationsQueryKey() }); void queryClient.invalidateQueries({ queryKey: getGetAdminSummaryQueryKey() }); } });
  return <div className="noise min-h-[100dvh] bg-[#0e1118]"><header className="border-b border-[#252d38] bg-[#10151d]"><div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 lg:px-8"><a href="/" data-testid="link-admin-home"><Brand compact /></a><div className="flex items-center gap-4"><span className="hidden text-xs text-[#89929a] sm:block">Painel da equipe</span><a href="/" className="rounded-lg border border-[#35404d] px-3 py-2 text-xs font-semibold text-[#d3d5ca] hover:border-[#f2c13a]" data-testid="link-view-site">Ver site</a></div></div></header><main className="mx-auto max-w-[1440px] px-5 py-8 lg:px-8 lg:py-12"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="eyebrow">Visão geral</p><h1 className="arena-display mt-3 text-4xl font-semibold text-[#f5f0df]">Operação da arena.</h1><p className="mt-2 text-sm text-[#89929a]">Acompanhe as reservas e mantenha a noite em movimento.</p></div><button type="button" onClick={() => { void summaryQuery.refetch(); void reservationsQuery.refetch(); }} className="flex items-center gap-2 self-start rounded-lg border border-[#35404d] px-3 py-2 text-sm text-[#cbd0ca] hover:border-[#a8e85d]" data-testid="button-refresh-admin"><RefreshCw size={15} /> Atualizar dados</button></div>
      {summaryQuery.isLoading ? <div className="mt-8"><LoadingState label="Calculando operação" /></div> : summaryQuery.isError ? <div className="mt-8"><ErrorState onRetry={() => summaryQuery.refetch()} /></div> : <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><div className="rounded-2xl border border-[#2c3540] bg-[#171e28] p-5"><div className="flex justify-between"><span className="text-xs font-bold uppercase tracking-wider text-[#89929a]">Hoje</span><CalendarDays size={18} className="text-[#f2c13a]" /></div><strong className="arena-display mt-4 block text-4xl text-[#f5f0df]" data-testid="metric-reservations-today">{summaryQuery.data?.reservationsToday ?? 0}</strong><span className="mt-1 block text-xs text-[#89929a]">reservas marcadas</span></div><div className="rounded-2xl border border-[#2c3540] bg-[#171e28] p-5"><div className="flex justify-between"><span className="text-xs font-bold uppercase tracking-wider text-[#89929a]">Este mês</span><BarChart3 size={18} className="text-[#a8e85d]" /></div><strong className="arena-display mt-4 block text-4xl text-[#f5f0df]" data-testid="metric-confirmed-month">{summaryQuery.data?.confirmedThisMonth ?? 0}</strong><span className="mt-1 block text-xs text-[#89929a]">confirmadas</span></div><div className="rounded-2xl border border-[#2c3540] bg-[#171e28] p-5"><div className="flex justify-between"><span className="text-xs font-bold uppercase tracking-wider text-[#89929a]">Receita prevista</span><CircleDollarSign size={18} className="text-[#f2c13a]" /></div><strong className="arena-display mt-4 block text-3xl text-[#f5f0df]" data-testid="metric-revenue">{money(summaryQuery.data?.expectedRevenueCents ?? 0)}</strong><span className="mt-1 block text-xs text-[#89929a]">reservas confirmadas</span></div><div className="rounded-2xl border border-[#2c3540] bg-[#171e28] p-5"><div className="flex justify-between"><span className="text-xs font-bold uppercase tracking-wider text-[#89929a]">Clientes ativos</span><UserRound size={18} className="text-[#a8e85d]" /></div><strong className="arena-display mt-4 block text-4xl text-[#f5f0df]" data-testid="metric-active-customers">{summaryQuery.data?.activeCustomers ?? 0}</strong><span className="mt-1 block text-xs text-[#89929a]">no período recente</span></div></div>}
      <section className="mt-10"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="arena-display text-2xl font-semibold text-[#f5f0df]">Reservas</h2><p className="mt-1 text-sm text-[#89929a]">Ações rápidas para a equipe.</p></div><div className="flex flex-wrap gap-2">{(['all', 'pending', 'confirmed', 'cancelled'] as const).map((item) => <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${filter === item ? 'border-[#f2c13a] bg-[#f2c13a] text-[#12151c]' : 'border-[#35404d] text-[#aeb6b4] hover:border-[#a8e85d]'}`} data-testid={`button-filter-${item}`}>{item === 'all' ? 'Todas' : item === 'pending' ? 'Pendentes' : item === 'confirmed' ? 'Confirmadas' : 'Canceladas'}</button>)}</div></div>{reservationsQuery.isLoading ? <div className="mt-5"><LoadingState label="Buscando reservas" /></div> : reservationsQuery.isError ? <div className="mt-5"><ErrorState onRetry={() => reservationsQuery.refetch()} /></div> : reservations.length === 0 ? <div className="mt-5 rounded-2xl border border-dashed border-[#35404d] p-14 text-center" data-testid="empty-reservations"><CalendarDays className="mx-auto text-[#a8e85d]" size={28} /><h3 className="mt-4 font-semibold text-[#e9e6d8]">Nenhuma reserva por aqui.</h3><p className="mt-1 text-sm text-[#89929a]">Quando a agenda se movimentar, ela aparece nesta lista.</p></div> : <div className="mt-5 overflow-hidden rounded-2xl border border-[#2c3540] bg-[#151b24]"><div className="hidden grid-cols-[1.4fr_1fr_1fr_1fr_1fr_auto] gap-4 border-b border-[#2c3540] bg-[#1a222d] px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-[#7f8993] lg:grid"><span>Cliente</span><span>Espaço</span><span>Data</span><span>Pagamento</span><span>Status</span><span>Ação</span></div>{reservations.map((reservation) => <div key={reservation.id} className="grid gap-4 border-b border-[#28313b] px-5 py-5 last:border-0 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr_auto] lg:items-center" data-testid={`row-reservation-${reservation.id}`}><div><div className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2a3038] text-xs font-bold text-[#f2c13a]">{reservation.customerName.slice(0, 1).toUpperCase()}</span><strong className="text-sm text-[#eceadd]" data-testid={`text-customer-${reservation.id}`}>{reservation.customerName}</strong></div><p className="mt-1 pl-9 text-xs text-[#89929a]">{reservation.customerPhone}</p></div><div><span className="mb-1 block text-[10px] uppercase tracking-wider text-[#7f8993] lg:hidden">Espaço</span><span className="text-sm text-[#d1d4cd]">{reservation.facilityName}</span></div><div><span className="mb-1 block text-[10px] uppercase tracking-wider text-[#7f8993] lg:hidden">Data e hora</span><span className="text-sm text-[#d1d4cd]">{prettyDateShort(reservation.date)} · {reservation.startTime}</span></div><div><span className="mb-1 block text-[10px] uppercase tracking-wider text-[#7f8993] lg:hidden">Pagamento</span><span className="text-sm capitalize text-[#d1d4cd]">{reservation.paymentMethod === 'pix' ? 'Pix' : 'Cartão'} · {money(reservation.priceCents)}</span></div><div><span className="mb-1 block text-[10px] uppercase tracking-wider text-[#7f8993] lg:hidden">Status</span><StatusPill status={reservation.status} /></div><div className="flex gap-2">{reservation.status === 'pending' && <><button type="button" disabled={updateReservation.isPending} onClick={() => changeStatus(reservation, 'confirmed')} className="flex items-center gap-1 rounded-lg bg-[#a8e85d] px-3 py-2 text-xs font-bold text-[#12151c] disabled:opacity-50" data-testid={`button-confirm-reservation-${reservation.id}`}><CircleCheck size={14} /> Confirmar</button><button type="button" disabled={updateReservation.isPending} onClick={() => changeStatus(reservation, 'cancelled')} className="rounded-lg border border-[#583238] px-3 py-2 text-xs font-bold text-[#ed9c92] disabled:opacity-50" data-testid={`button-cancel-reservation-${reservation.id}`}><CircleX size={14} /></button></>}{reservation.status === 'confirmed' && <button type="button" disabled={updateReservation.isPending} onClick={() => changeStatus(reservation, 'cancelled')} className="rounded-lg border border-[#583238] px-3 py-2 text-xs font-bold text-[#ed9c92] disabled:opacity-50" data-testid={`button-cancel-confirmed-${reservation.id}`}>Cancelar</button>}</div></div>)}</div>}</section>
       <BlockedSlots facilities={facilitiesQuery.data ?? []} /></main></div>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
