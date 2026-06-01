// Explicit lucide icon map.
//
// Components, group rails and detail panels resolve their icon by string name
// (component.icon, GROUP_ICONS[g.key]). Importing lucide-react with `import * as
// Icons` pulls in the entire ~800KB library; by listing only the icons we
// actually reference here we let Vite tree-shake to ~40 icons total.
//
// If you add a new component.icon or GROUP_ICONS value, add it below as well.

import {
  Activity, BadgeCheck, BookCheck, BotMessageSquare, Box, Bug, CircleDot,
  ClipboardCheck, Cpu, FileKey, Filter, Flame, GitMerge, Globe, Headphones,
  KeyRound, Layers, LoaderCircle, Lock, LogIn, Map, Network, PackagePlus,
  PlayCircle, Radar, Rocket, ScanEye, Settings, Shield, ShieldCheck, ShieldHalf,
  ShieldOff, ShieldX, SlidersHorizontal, Sparkles, Store, Terminal, TrendingUp,
  UserCog, Users
} from 'lucide-react'

export const ICONS = {
  Activity, BadgeCheck, BookCheck, BotMessageSquare, Box, Bug, CircleDot,
  ClipboardCheck, Cpu, FileKey, Filter, Flame, GitMerge, Globe, Headphones,
  KeyRound, Layers, LoaderCircle, Lock, LogIn, Map, Network, PackagePlus,
  PlayCircle, Radar, Rocket, ScanEye, Settings, Shield, ShieldCheck, ShieldHalf,
  ShieldOff, ShieldX, SlidersHorizontal, Sparkles, Store, Terminal, TrendingUp,
  UserCog, Users
}

// Convenience: resolve an icon by name with a Box fallback.
export function resolveIcon(name) {
  return ICONS[name] || Box
}
