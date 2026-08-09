// 12 Handcrafted Apple-Style Clean Vector Animal Avatars
// Pure SVG Data URIs - 100% offline, zero latency, ultra-crisp resolution

function createSvgDataUri(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}

export const APPLE_ANIMAL_AVATARS = [
  // 1. Panda (Mint Green)
  createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="50" fill="#a7f3d0"/>
      <!-- Ears -->
      <circle cx="28" cy="28" r="13" fill="#1e293b"/>
      <circle cx="72" cy="28" r="13" fill="#1e293b"/>
      <!-- Head -->
      <circle cx="50" cy="54" r="32" fill="#ffffff"/>
      <!-- Eye Patches -->
      <ellipse cx="38" cy="48" rx="8.5" ry="11" fill="#1e293b" transform="rotate(-15 38 48)"/>
      <ellipse cx="62" cy="48" rx="8.5" ry="11" fill="#1e293b" transform="rotate(15 62 48)"/>
      <!-- Eyes -->
      <circle cx="39" cy="47" r="3" fill="#ffffff"/>
      <circle cx="61" cy="47" r="3" fill="#ffffff"/>
      <!-- Nose & Mouth -->
      <ellipse cx="50" cy="60" rx="5" ry="3.5" fill="#1e293b"/>
      <path d="M 46 64 Q 50 67 54 64" stroke="#1e293b" stroke-width="2" fill="none" stroke-linecap="round"/>
      <!-- Cheeks -->
      <circle cx="27" cy="58" r="4.5" fill="#fca5a5" opacity="0.6"/>
      <circle cx="73" cy="58" r="4.5" fill="#fca5a5" opacity="0.6"/>
    </svg>
  `),

  // 2. Brown Bear (Warm Amber)
  createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="50" fill="#fde68a"/>
      <!-- Ears -->
      <circle cx="26" cy="28" r="12" fill="#92400e"/>
      <circle cx="26" cy="28" r="7" fill="#fde68a"/>
      <circle cx="74" cy="28" r="12" fill="#92400e"/>
      <circle cx="74" cy="28" r="7" fill="#fde68a"/>
      <!-- Head -->
      <circle cx="50" cy="54" r="33" fill="#b45309"/>
      <!-- Muzzle -->
      <ellipse cx="50" cy="62" rx="16" ry="13" fill="#fef3c7"/>
      <!-- Eyes -->
      <circle cx="38" cy="48" r="3.5" fill="#1e293b"/>
      <circle cx="62" cy="48" r="3.5" fill="#1e293b"/>
      <!-- Nose & Mouth -->
      <ellipse cx="50" cy="58" rx="6" ry="4.5" fill="#451a03"/>
      <path d="M 50 62.5 L 50 67" stroke="#451a03" stroke-width="2" stroke-linecap="round"/>
      <path d="M 45 67 Q 50 71 55 67" stroke="#451a03" stroke-width="2" fill="none" stroke-linecap="round"/>
    </svg>
  `),

  // 3. Fox (Peach / Sunset)
  createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="50" fill="#fed7aa"/>
      <!-- Ears -->
      <polygon points="20,40 32,15 45,35" fill="#ea580c"/>
      <polygon points="23,38 32,18 41,34" fill="#1e293b"/>
      <polygon points="80,40 68,15 55,35" fill="#ea580c"/>
      <polygon points="77,38 68,18 59,34" fill="#1e293b"/>
      <!-- Head -->
      <ellipse cx="50" cy="54" rx="33" ry="28" fill="#ea580c"/>
      <!-- Cheeks White Mask -->
      <path d="M 18 54 Q 30 74 50 78 Q 70 74 82 54 Q 70 48 50 62 Q 30 48 18 54 Z" fill="#ffffff"/>
      <!-- Eyes -->
      <circle cx="36" cy="50" r="3.5" fill="#1e293b"/>
      <circle cx="64" cy="50" r="3.5" fill="#1e293b"/>
      <!-- Nose -->
      <circle cx="50" cy="68" r="4" fill="#1e293b"/>
    </svg>
  `),

  // 4. Lion (Golden Yellow)
  createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="50" fill="#fef08a"/>
      <!-- Mane -->
      <circle cx="50" cy="52" r="38" fill="#d97706"/>
      <!-- Ears -->
      <circle cx="25" cy="30" r="9" fill="#f59e0b"/>
      <circle cx="75" cy="30" r="9" fill="#f59e0b"/>
      <!-- Face -->
      <circle cx="50" cy="54" r="28" fill="#fbbf24"/>
      <!-- Eyes -->
      <circle cx="39" cy="48" r="3.5" fill="#1e293b"/>
      <circle cx="61" cy="48" r="3.5" fill="#1e293b"/>
      <!-- Muzzle -->
      <ellipse cx="50" cy="62" rx="12" ry="9" fill="#fef3c7"/>
      <!-- Nose & Mouth -->
      <polygon points="46,57 54,57 50,62" fill="#78350f"/>
      <path d="M 45 65 Q 50 69 55 65" stroke="#78350f" stroke-width="2" fill="none" stroke-linecap="round"/>
    </svg>
  `),

  // 5. Koala (Sky Blue)
  createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="50" fill="#bae6fd"/>
      <!-- Fluffy Ears -->
      <circle cx="22" cy="36" r="16" fill="#94a3b8"/>
      <circle cx="22" cy="36" r="10" fill="#f1f5f9"/>
      <circle cx="78" cy="36" r="16" fill="#94a3b8"/>
      <circle cx="78" cy="36" r="10" fill="#f1f5f9"/>
      <!-- Head -->
      <circle cx="50" cy="55" r="30" fill="#94a3b8"/>
      <!-- Eyes -->
      <circle cx="36" cy="48" r="3.5" fill="#1e293b"/>
      <circle cx="64" cy="48" r="3.5" fill="#1e293b"/>
      <!-- Big Koala Oval Nose -->
      <ellipse cx="50" cy="58" rx="8.5" ry="12" fill="#1e293b"/>
      <!-- Cheeks -->
      <circle cx="28" cy="58" r="4" fill="#fca5a5" opacity="0.6"/>
      <circle cx="72" cy="58" r="4" fill="#fca5a5" opacity="0.6"/>
    </svg>
  `),

  // 6. Owl (Indigo / Violet)
  createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="50" fill="#c7d2fe"/>
      <!-- Body/Head -->
      <ellipse cx="50" cy="54" rx="32" ry="34" fill="#6366f1"/>
      <!-- Ear Feathers -->
      <polygon points="24,28 34,16 42,32" fill="#4f46e5"/>
      <polygon points="76,28 66,16 58,32" fill="#4f46e5"/>
      <!-- Big Eye Rings -->
      <circle cx="36" cy="48" r="13" fill="#ffffff"/>
      <circle cx="64" cy="48" r="13" fill="#ffffff"/>
      <circle cx="36" cy="48" r="7" fill="#1e293b"/>
      <circle cx="64" cy="48" r="7" fill="#1e293b"/>
      <circle cx="38" cy="46" r="2.5" fill="#ffffff"/>
      <circle cx="66" cy="46" r="2.5" fill="#ffffff"/>
      <!-- Beak -->
      <polygon points="46,53 54,53 50,63" fill="#f59e0b"/>
      <!-- Belly Feather Detail -->
      <path d="M 42 72 Q 50 76 58 72" stroke="#ffffff" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.8"/>
    </svg>
  `),

  // 7. Penguin (Ice Blue)
  createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="50" fill="#e0f2fe"/>
      <!-- Head Body -->
      <ellipse cx="50" cy="55" rx="32" ry="34" fill="#0f172a"/>
      <!-- White Face/Tummy -->
      <ellipse cx="50" cy="62" rx="22" ry="24" fill="#ffffff"/>
      <!-- Eyes -->
      <circle cx="38" cy="48" r="3.5" fill="#0f172a"/>
      <circle cx="62" cy="48" r="3.5" fill="#0f172a"/>
      <!-- Beak -->
      <polygon points="44,54 56,54 50,62" fill="#f97316"/>
      <!-- Cheeks -->
      <circle cx="28" cy="56" r="4.5" fill="#fca5a5" opacity="0.6"/>
      <circle cx="72" cy="56" r="4.5" fill="#fca5a5" opacity="0.6"/>
    </svg>
  `),

  // 8. Cat (Rose Pink)
  createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="50" fill="#fecdd3"/>
      <!-- Ears -->
      <polygon points="20,44 28,18 46,38" fill="#fda4af"/>
      <polygon points="25,40 30,24 42,36" fill="#f43f5e"/>
      <polygon points="80,44 72,18 54,38" fill="#fda4af"/>
      <polygon points="75,40 70,24 58,36" fill="#f43f5e"/>
      <!-- Head -->
      <circle cx="50" cy="54" r="30" fill="#ffffff"/>
      <!-- Eyes -->
      <circle cx="37" cy="48" r="3.5" fill="#1e293b"/>
      <circle cx="63" cy="48" r="3.5" fill="#1e293b"/>
      <!-- Nose & Mouth -->
      <polygon points="47,56 53,56 50,60" fill="#f43f5e"/>
      <path d="M 44 63 Q 50 67 56 63" stroke="#94a3b8" stroke-width="2" fill="none" stroke-linecap="round"/>
      <!-- Whiskers -->
      <line x1="20" y1="56" x2="33" y2="57" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round"/>
      <line x1="20" y1="62" x2="33" y2="60" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round"/>
      <line x1="80" y1="56" x2="67" y2="57" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round"/>
      <line x1="80" y1="62" x2="67" y2="60" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `),

  // 9. Puppy / Dog (Pastel Cyan)
  createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="50" fill="#cffafe"/>
      <!-- Floppy Ears -->
      <ellipse cx="20" cy="48" rx="9" ry="17" fill="#78350f" transform="rotate(-15 20 48)"/>
      <ellipse cx="80" cy="48" rx="9" ry="17" fill="#78350f" transform="rotate(15 80 48)"/>
      <!-- Head -->
      <circle cx="50" cy="54" r="31" fill="#fde047"/>
      <!-- Eye Patch -->
      <ellipse cx="38" cy="48" rx="10" ry="11" fill="#facc15"/>
      <!-- Eyes -->
      <circle cx="38" cy="48" r="3.5" fill="#1e293b"/>
      <circle cx="62" cy="48" r="3.5" fill="#1e293b"/>
      <!-- Muzzle -->
      <ellipse cx="50" cy="62" rx="12" ry="9" fill="#ffffff"/>
      <!-- Nose & Tongue -->
      <ellipse cx="50" cy="58" rx="5" ry="3.5" fill="#1e293b"/>
      <path d="M 46 64 Q 50 68 54 64" stroke="#1e293b" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M 48 66 Q 50 73 52 66" fill="#f87171"/>
    </svg>
  `),

  // 10. Bunny / Rabbit (Soft Purple)
  createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="50" fill="#fce7f3"/>
      <!-- Long Ears -->
      <ellipse cx="36" cy="24" rx="7.5" ry="19" fill="#ffffff" transform="rotate(-6 36 24)"/>
      <ellipse cx="36" cy="24" rx="4" ry="14" fill="#fbcfe8" transform="rotate(-6 36 24)"/>
      <ellipse cx="64" cy="24" rx="7.5" ry="19" fill="#ffffff" transform="rotate(6 64 24)"/>
      <ellipse cx="64" cy="24" rx="4" ry="14" fill="#fbcfe8" transform="rotate(6 64 24)"/>
      <!-- Head -->
      <circle cx="50" cy="57" r="29" fill="#ffffff"/>
      <!-- Eyes -->
      <circle cx="37" cy="52" r="3.5" fill="#1e293b"/>
      <circle cx="63" cy="52" r="3.5" fill="#1e293b"/>
      <!-- Nose & Mouth -->
      <ellipse cx="50" cy="60" rx="4" ry="3" fill="#f472b6"/>
      <path d="M 46 64 Q 50 67 54 64" stroke="#94a3b8" stroke-width="2" fill="none" stroke-linecap="round"/>
      <!-- Cheeks -->
      <circle cx="28" cy="60" r="4.5" fill="#fca5a5" opacity="0.6"/>
      <circle cx="72" cy="60" r="4.5" fill="#fca5a5" opacity="0.6"/>
    </svg>
  `),

  // 11. Tiger (Tangerine)
  createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="50" fill="#ffedd5"/>
      <!-- Ears -->
      <circle cx="26" cy="30" r="11" fill="#ea580c"/>
      <circle cx="26" cy="30" r="6" fill="#1e293b"/>
      <circle cx="74" cy="30" r="11" fill="#ea580c"/>
      <circle cx="74" cy="30" r="6" fill="#1e293b"/>
      <!-- Head -->
      <circle cx="50" cy="54" r="31" fill="#f97316"/>
      <!-- Stripes -->
      <path d="M 50 26 L 50 34 M 45 28 L 47 34 M 55 28 L 53 34" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M 22 52 L 30 52 M 22 58 L 29 57" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M 78 52 L 70 52 M 78 58 L 71 57" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round"/>
      <!-- Muzzle -->
      <ellipse cx="50" cy="63" rx="14" ry="10" fill="#ffffff"/>
      <!-- Eyes -->
      <circle cx="37" cy="48" r="3.5" fill="#1e293b"/>
      <circle cx="63" cy="48" r="3.5" fill="#1e293b"/>
      <!-- Nose & Mouth -->
      <polygon points="46,58 54,58 50,63" fill="#ea580c"/>
      <path d="M 45 66 Q 50 70 55 66" stroke="#1e293b" stroke-width="2" fill="none" stroke-linecap="round"/>
    </svg>
  `),

  // 12. Monkey (Lime Pastel)
  createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="50" fill="#d9f99d"/>
      <!-- Big Ears -->
      <circle cx="20" cy="50" r="14" fill="#a16207"/>
      <circle cx="20" cy="50" r="8" fill="#fde047"/>
      <circle cx="80" cy="50" r="14" fill="#a16207"/>
      <circle cx="80" cy="50" r="8" fill="#fde047"/>
      <!-- Head -->
      <circle cx="50" cy="50" r="31" fill="#a16207"/>
      <!-- Face Mask -->
      <path d="M 33 46 A 9 9 0 0 1 50 46 A 9 9 0 0 1 67 46 Q 68 66 50 68 Q 32 66 33 46 Z" fill="#fef08a"/>
      <!-- Eyes -->
      <circle cx="41" cy="46" r="3.5" fill="#1e293b"/>
      <circle cx="59" cy="46" r="3.5" fill="#1e293b"/>
      <!-- Nose & Smile -->
      <ellipse cx="50" cy="56" rx="4" ry="2.5" fill="#713f12"/>
      <path d="M 44 61 Q 50 66 56 61" stroke="#713f12" stroke-width="2" fill="none" stroke-linecap="round"/>
    </svg>
  `)
];
