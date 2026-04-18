'use client';

import { useLayoutEffect, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, Smile } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { TeamIconEntry, TeamIconPickerProps } from './types';
import {
  Music, Mic, Mic2, Guitar, Radio, Headphones, Piano, Drum, Music2, Disc, Disc2,
  BookOpen, Megaphone, MessageSquare, Quote, Flame, Sparkles, BookMarked, Book, ScrollText,
  Palette, Paintbrush, Flower2, Leaf, Brush, Frame, Scissors, Wand2, Pen,
  UserCheck, Users, Users2, Heart, HandHeart, Smile as SmileIcon, Baby, PersonStanding, Handshake,
  HeartHandshake, UserRound, UserRoundCheck, UsersRound,
  UtensilsCrossed, Coffee, ChefHat, Cookie, Apple, Sandwich, Pizza, IceCream2, Wine, Soup, CupSoda,
  Crown, Shield, Award, Trophy, Star, Medal, BadgeCheck, Gem, Swords, Ribbon,
  ClipboardList, FileText, Mail, Phone, MessageCircle, PenLine, Printer, Clipboard, NotebookPen,
  Notebook, FolderOpen, Archive,
  Camera, Video, Monitor, Film, Projector, Clapperboard, RadioTower, Podcast,
  Car, Bus, Map as MapIcon, Truck, Bike, Navigation,
  HeartPulse, Stethoscope, Pill, Syringe, Bandage, Thermometer,
  Sun, Moon, Globe, Home, Building, Lightbulb, Gift, Tent, Zap, Wind, Waves,
  Mountain, Trees, CloudSun, Sunrise, Sunset, Snowflake, Rainbow, Umbrella,
  Church, Cross, Infinity, Anchor, Feather, Dumbbell, Backpack, Package,
  Hammer, Wrench, Settings, Key, Lock, Flashlight, HandMetal,
  Laugh, PartyPopper,
  Trash2, WashingMachine, SprayCan, Recycle,
  DollarSign, CreditCard, Wallet, Banknote, Coins, PiggyBank, Receipt, HandCoins, CircleDollarSign, Landmark,
  ShoppingCart, ShoppingBag, Store, Tag, Tags, TrendingUp, Percent, BadgeDollarSign,
} from 'lucide-react';

// ——— Icon registry ———

export type { TeamIconEntry };

export const TEAM_ICONS: TeamIconEntry[] = [
  // Música
  { name: 'Music',        label: 'Música',       icon: Music },
  { name: 'Music2',       label: 'Nota',         icon: Music2 },
  { name: 'Mic',          label: 'Microfone',    icon: Mic },
  { name: 'Mic2',         label: 'Microfone 2',  icon: Mic2 },
  { name: 'Guitar',       label: 'Violão',       icon: Guitar },
  { name: 'Piano',        label: 'Piano',        icon: Piano },
  { name: 'Drum',         label: 'Percussão',    icon: Drum },
  { name: 'Radio',        label: 'Rádio',        icon: Radio },
  { name: 'Headphones',   label: 'Fones',        icon: Headphones },
  { name: 'Disc',         label: 'Disco',        icon: Disc },
  { name: 'Disc2',        label: 'Disco 2',      icon: Disc2 },
  // Fé / Liturgia
  { name: 'Church',       label: 'Igreja',       icon: Church },
  { name: 'Cross',        label: 'Cruz',         icon: Cross },
  { name: 'BookOpen',     label: 'Palavra',      icon: BookOpen },
  { name: 'Book',         label: 'Livro',        icon: Book },
  { name: 'BookMarked',   label: 'Bíblia',       icon: BookMarked },
  { name: 'ScrollText',   label: 'Liturgia',     icon: ScrollText },
  { name: 'Megaphone',    label: 'Pregação',     icon: Megaphone },
  { name: 'MessageSquare',label: 'Testemunho',   icon: MessageSquare },
  { name: 'Quote',        label: 'Citação',      icon: Quote },
  { name: 'Flame',        label: 'Chama',        icon: Flame },
  { name: 'Sparkles',     label: 'Brilho',       icon: Sparkles },
  { name: 'Infinity',     label: 'Eternidade',   icon: Infinity },
  { name: 'Anchor',       label: 'Âncora',       icon: Anchor },
  { name: 'Feather',      label: 'Pena',         icon: Feather },
  // Arte / Decoração
  { name: 'Palette',      label: 'Arte',         icon: Palette },
  { name: 'Paintbrush',   label: 'Pincel',       icon: Paintbrush },
  { name: 'Brush',        label: 'Escova',       icon: Brush },
  { name: 'Pen',          label: 'Caneta',       icon: Pen },
  { name: 'Wand2',        label: 'Varinha',      icon: Wand2 },
  { name: 'Frame',        label: 'Moldura',      icon: Frame },
  { name: 'Scissors',     label: 'Tesoura',      icon: Scissors },
  { name: 'Flower2',      label: 'Flores',       icon: Flower2 },
  { name: 'Leaf',         label: 'Natureza',     icon: Leaf },
  // Recepção / Pessoas
  { name: 'UserCheck',    label: 'Recepção',     icon: UserCheck },
  { name: 'UserRound',    label: 'Pessoa',       icon: UserRound },
  { name: 'UserRoundCheck', label: 'Confirmado', icon: UserRoundCheck },
  { name: 'Users',        label: 'Pessoas',      icon: Users },
  { name: 'Users2',       label: 'Grupo',        icon: Users2 },
  { name: 'UsersRound',   label: 'Comunidade',   icon: UsersRound },
  { name: 'PersonStanding', label: 'Pessoa 2',   icon: PersonStanding },
  { name: 'Heart',        label: 'Coração',      icon: Heart },
  { name: 'HandHeart',    label: 'Cuidado',      icon: HandHeart },
  { name: 'HeartHandshake', label: 'Parceria',   icon: HeartHandshake },
  { name: 'Handshake',    label: 'Acordo',       icon: Handshake },
  { name: 'Smile',        label: 'Acolhida',     icon: SmileIcon },
  { name: 'Laugh',        label: 'Alegria',      icon: Laugh },
  { name: 'Baby',         label: 'Crianças',     icon: Baby },
  // Alimentação
  { name: 'UtensilsCrossed', label: 'Alimentação', icon: UtensilsCrossed },
  { name: 'ChefHat',      label: 'Cozinha',      icon: ChefHat },
  { name: 'Coffee',       label: 'Café',         icon: Coffee },
  { name: 'CupSoda',      label: 'Bebidas',      icon: CupSoda },
  { name: 'Wine',         label: 'Vinho',        icon: Wine },
  { name: 'Sandwich',     label: 'Lanches',      icon: Sandwich },
  { name: 'Pizza',        label: 'Pizza',        icon: Pizza },
  { name: 'Soup',         label: 'Sopa',         icon: Soup },
  { name: 'Cookie',       label: 'Biscoito',     icon: Cookie },
  { name: 'IceCream2',    label: 'Sobremesa',    icon: IceCream2 },
  { name: 'Apple',        label: 'Frutas',       icon: Apple },
  // Coordenação / Honrarias
  { name: 'Crown',        label: 'Coordenação',  icon: Crown },
  { name: 'Shield',       label: 'Segurança',    icon: Shield },
  { name: 'Award',        label: 'Honra',        icon: Award },
  { name: 'Trophy',       label: 'Troféu',       icon: Trophy },
  { name: 'Star',         label: 'Destaque',     icon: Star },
  { name: 'Medal',        label: 'Medalha',      icon: Medal },
  { name: 'BadgeCheck',   label: 'Certificado',  icon: BadgeCheck },
  { name: 'Gem',          label: 'Joia',         icon: Gem },
  { name: 'Ribbon',       label: 'Fita',         icon: Ribbon },
  { name: 'Swords',       label: 'Batalha',      icon: Swords },
  // Secretaria / Comunicação
  { name: 'ClipboardList',label: 'Secretaria',   icon: ClipboardList },
  { name: 'Clipboard',    label: 'Prancheta',    icon: Clipboard },
  { name: 'NotebookPen',  label: 'Caderno',      icon: NotebookPen },
  { name: 'Notebook',     label: 'Bloco',        icon: Notebook },
  { name: 'FileText',     label: 'Documentos',   icon: FileText },
  { name: 'FolderOpen',   label: 'Pasta',        icon: FolderOpen },
  { name: 'Archive',      label: 'Arquivo',      icon: Archive },
  { name: 'Printer',      label: 'Impressora',   icon: Printer },
  { name: 'PenLine',      label: 'Escrita',      icon: PenLine },
  { name: 'Mail',         label: 'E-mail',       icon: Mail },
  { name: 'Phone',        label: 'Telefone',     icon: Phone },
  { name: 'MessageCircle',label: 'Mensagem',     icon: MessageCircle },
  { name: 'Podcast',      label: 'Podcast',      icon: Podcast },
  // Audiovisual
  { name: 'Camera',       label: 'Foto',         icon: Camera },
  { name: 'Video',        label: 'Vídeo',        icon: Video },
  { name: 'Monitor',      label: 'Telão',        icon: Monitor },
  { name: 'Projector',    label: 'Projetor',     icon: Projector },
  { name: 'Film',         label: 'Cinema',       icon: Film },
  { name: 'Clapperboard', label: 'Gravação',     icon: Clapperboard },
  { name: 'RadioTower',   label: 'Transmissão',  icon: RadioTower },
  // Transporte / Logística
  { name: 'Car',          label: 'Carro',        icon: Car },
  { name: 'Bus',          label: 'Ônibus',       icon: Bus },
  { name: 'Truck',        label: 'Caminhão',     icon: Truck },
  { name: 'Bike',         label: 'Bicicleta',    icon: Bike },
  { name: 'Map',          label: 'Localização',  icon: MapIcon },
  { name: 'Navigation',   label: 'Navegação',    icon: Navigation },
  { name: 'Backpack',     label: 'Mochila',      icon: Backpack },
  { name: 'Package',      label: 'Pacote',       icon: Package },
  // Saúde
  { name: 'HeartPulse',   label: 'Saúde',        icon: HeartPulse },
  { name: 'Stethoscope',  label: 'Enfermagem',   icon: Stethoscope },
  { name: 'Bandage',      label: 'Curativo',     icon: Bandage },
  { name: 'Pill',         label: 'Remédio',      icon: Pill },
  { name: 'Syringe',      label: 'Injeção',      icon: Syringe },
  { name: 'Thermometer',  label: 'Temperatura',  icon: Thermometer },
  // Infraestrutura
  { name: 'Hammer',       label: 'Construção',   icon: Hammer },
  { name: 'Wrench',       label: 'Ferramentas',  icon: Wrench },
  { name: 'Settings',     label: 'Configuração', icon: Settings },
  { name: 'Key',          label: 'Chave',        icon: Key },
  { name: 'Lock',         label: 'Segurança 2',  icon: Lock },
  { name: 'Flashlight',   label: 'Lanterna',     icon: Flashlight },
  { name: 'HandMetal',    label: 'Louvor',       icon: HandMetal },
  // Natureza / Ambiente
  { name: 'Sun',          label: 'Sol',          icon: Sun },
  { name: 'Sunrise',      label: 'Amanhecer',    icon: Sunrise },
  { name: 'Sunset',       label: 'Entardecer',   icon: Sunset },
  { name: 'CloudSun',     label: 'Tempo',        icon: CloudSun },
  { name: 'Moon',         label: 'Lua',          icon: Moon },
  { name: 'Snowflake',    label: 'Neve',         icon: Snowflake },
  { name: 'Rainbow',      label: 'Arco-íris',    icon: Rainbow },
  { name: 'Umbrella',     label: 'Chuva',        icon: Umbrella },
  { name: 'Wind',         label: 'Vento',        icon: Wind },
  { name: 'Waves',        label: 'Águas',        icon: Waves },
  { name: 'Mountain',     label: 'Montanha',     icon: Mountain },
  { name: 'Trees',        label: 'Floresta',     icon: Trees },
  { name: 'Globe',        label: 'Global',       icon: Globe },
  // Espaços
  { name: 'Home',         label: 'Casa',         icon: Home },
  { name: 'Building',     label: 'Edifício',     icon: Building },
  { name: 'Tent',         label: 'Acampamento',  icon: Tent },
  // Limpeza
  { name: 'Trash2',         label: 'Lixo',         icon: Trash2 },
  { name: 'WashingMachine', label: 'Lavanderia',   icon: WashingMachine },
  { name: 'SprayCan',       label: 'Spray',        icon: SprayCan },
  { name: 'Recycle',        label: 'Reciclagem',   icon: Recycle },
  // Dinheiro / Finanças
  { name: 'DollarSign',     label: 'Dinheiro',     icon: DollarSign },
  { name: 'CircleDollarSign', label: 'Valor',      icon: CircleDollarSign },
  { name: 'Banknote',       label: 'Nota',         icon: Banknote },
  { name: 'Coins',          label: 'Moedas',       icon: Coins },
  { name: 'Wallet',         label: 'Carteira',     icon: Wallet },
  { name: 'CreditCard',     label: 'Cartão',       icon: CreditCard },
  { name: 'PiggyBank',      label: 'Poupança',     icon: PiggyBank },
  { name: 'Receipt',        label: 'Recibo',       icon: Receipt },
  { name: 'HandCoins',      label: 'Oferta',       icon: HandCoins },
  { name: 'Landmark',       label: 'Banco',        icon: Landmark },
  // Vendas
  { name: 'ShoppingCart',   label: 'Carrinho',     icon: ShoppingCart },
  { name: 'ShoppingBag',    label: 'Sacola',       icon: ShoppingBag },
  { name: 'Store',          label: 'Loja',         icon: Store },
  { name: 'Tag',            label: 'Etiqueta',     icon: Tag },
  { name: 'Tags',           label: 'Etiquetas',    icon: Tags },
  { name: 'TrendingUp',     label: 'Crescimento',  icon: TrendingUp },
  { name: 'Percent',        label: 'Desconto',     icon: Percent },
  { name: 'BadgeDollarSign',label: 'Promoção',     icon: BadgeDollarSign },
  // Celebração / Outros
  { name: 'PartyPopper',  label: 'Celebração',   icon: PartyPopper },
  { name: 'Gift',         label: 'Presente',     icon: Gift },
  { name: 'Dumbbell',     label: 'Esporte',      icon: Dumbbell },
  { name: 'Lightbulb',    label: 'Ideia',        icon: Lightbulb },
  { name: 'Zap',          label: 'Energia',      icon: Zap },
];

// ——— Icon resolver (for rendering by name) ———

const ICON_MAP = new Map<string, LucideIcon>(
  TEAM_ICONS.map(({ name, icon }) => [name, icon]),
);

export function resolveTeamIcon(name: string | null | undefined): LucideIcon | null {
  if (!name) return null;
  return ICON_MAP.get(name) ?? null;
}

// ——— Picker component ———

const TeamIconPicker: React.FC<TeamIconPickerProps> = ({ value, onChange, label = 'Ícone' }) => {
  const [open, setOpen] = useState(false);
  const [rendered, setRendered] = useState(false);
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selectedEntry = value ? TEAM_ICONS.find((e) => e.name === value) : null;
  const SelectedIcon = selectedEntry?.icon ?? null;

  function openPicker() {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setPos({
      top:   rect.bottom + 6,
      left:  rect.left,
      width: Math.max(rect.width, 320),
    });
    setSearch('');
    setOpen(true);
  }

  useEffect(() => {
    if (open) { setRendered(true); }
    else {
      setVisible(false);
      const t = setTimeout(() => setRendered(false), 200);
      return () => clearTimeout(t);
    }
  }, [open]);

  useLayoutEffect(() => {
    if (!rendered || !open) return;
    const raf = requestAnimationFrame(() => {
      setVisible(true);
      setTimeout(() => searchRef.current?.focus(), 30);
    });
    return () => cancelAnimationFrame(raf);
  }, [rendered, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return TEAM_ICONS;
    return TEAM_ICONS.filter((e) => e.label.toLowerCase().includes(q) || e.name.toLowerCase().includes(q));
  }, [search]);

  return (
    <>
      <div className="space-y-1">
        {label && <label className="text-sm font-medium text-text block">{label}</label>}
        <div className="flex items-center gap-2">
          <button
            ref={buttonRef}
            type="button"
            onClick={openPicker}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-input-border bg-input-bg text-input-text text-sm hover:border-primary/60 transition-colors min-w-0 flex-1"
          >
            {SelectedIcon ? (
              <>
                <SelectedIcon size={16} className="text-primary shrink-0" />
                <span className="truncate">{selectedEntry!.label}</span>
              </>
            ) : (
              <>
                <Smile size={16} className="text-text-muted/60 shrink-0" />
                <span className="text-text-muted/60">Selecionar ícone...</span>
              </>
            )}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="p-2 rounded-lg border border-input-border bg-input-bg text-text-muted hover:text-red-500 hover:border-red-300 transition-colors"
              title="Remover ícone"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {rendered && createPortal(
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className={`fixed z-50 bg-panel border border-border rounded-xl shadow-2xl flex flex-col
              transition-all duration-200 ease-out
              ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'}`}
            style={{ top: pos.top, left: pos.left, width: pos.width, maxHeight: 320 }}
          >
            {/* Search */}
            <div className="px-3 pt-3 pb-2 shrink-0">
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                <input
                  ref={searchRef}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar ícone..."
                  className="w-full pl-7 pr-3 py-1.5 text-xs rounded-lg border border-input-border bg-input-bg text-input-text placeholder:text-text-muted/60 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                />
              </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto px-2 pb-2">
              {filtered.length === 0 ? (
                <p className="text-xs text-text-muted text-center py-6">Nenhum ícone encontrado</p>
              ) : (
                <div className="grid grid-cols-6 gap-1">
                  {filtered.map(({ name, label: iconLabel, icon: Icon }) => (
                    <button
                      key={name}
                      type="button"
                      title={iconLabel}
                      onClick={() => { onChange(name); setOpen(false); }}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors group
                        ${value === name
                          ? 'bg-primary text-white'
                          : 'hover:bg-hover text-text-muted hover:text-text'}`}
                    >
                      <Icon size={18} />
                      <span className={`text-[9px] leading-tight text-center truncate w-full
                        ${value === name ? 'text-white/90' : 'text-text-muted/80 group-hover:text-text-muted'}`}>
                        {iconLabel}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>,
        document.body,
      )}
    </>
  );
};

export default TeamIconPicker;
