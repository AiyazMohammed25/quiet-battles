export interface Series {
  id: string;
  title: string;
  subtitle: string;
  description: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  details: string[];
  color: string;
  chapterId: string;
}

export interface Chapter {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  story: string[];
  visual: string;
  productId: string;
}

export const SERIES_01: Series = {
  id: "series-01",
  title: "The Gentle Armor™",
  subtitle: "Series 01 — Five studies in quiet resilience",
  description:
    "An inaugural collection exploring the tension between softness and strength. Five chapters. One belief: the battles no one sees still shape who we become.",
};

export const PRODUCTS: Product[] = [
  {
    id: "genesis-shell-jacket",
    name: "The Genesis Shell Jacket",
    price: 14999,
    category: "Series 01 / Chapter 01",
    description:
      "A considered outer layer for the long way home. Heavy cotton canvas, a concealed storm placket and considered utility meet in a silhouette made for everyday resistance.",
    details: [
      "450 GSM weather-resistant cotton canvas",
      "Matte-black hardware and reinforced eyelets",
      "Concealed storm placket and deep utility pockets",
      "Reinforced structural stitching",
    ],
    color: "Carbon black",
    chapterId: "1",
  },
  {
    id: "weight-of-silence-overshirt",
    name: "The Weight of Silence Overshirt",
    price: 8999,
    category: "Series 01 / Chapter 02",
    description:
      "A quiet mid-layer built around focus. Soft structure and measured warmth make room for the work that happens away from the noise.",
    details: [
      "Midweight brushed cotton twill",
      "Relaxed, layer-ready fit",
      "Two concealed chest pockets",
      "Soft-touch matte buttons",
    ],
    color: "Ash black",
    chapterId: "2",
  },
  {
    id: "obsidian-weave-cargo",
    name: "The Obsidian Weave Cargo",
    price: 10999,
    category: "Series 01 / Chapter 03",
    description:
      "Movement without compromise. Articulated seams and purposeful storage give this everyday uniform a quietly resilient structure.",
    details: [
      "Durable cotton ripstop weave",
      "Articulated knee construction",
      "Low-profile cargo storage",
      "Adjustable drawcord hems",
    ],
    color: "Obsidian",
    chapterId: "3",
  },
  {
    id: "solitary-guard-utility-vest",
    name: "The Solitary Guard Utility Vest",
    price: 11999,
    category: "Series 01 / Chapter 04",
    description:
      "A weather-minded layer that keeps essentials close. Built for changing conditions and the calm of being prepared.",
    details: [
      "Water-resistant recycled shell fabric",
      "Weather-sealed front zip",
      "Four considered utility pockets",
      "Adjustable side tabs",
    ],
    color: "Night",
    chapterId: "4",
  },
  {
    id: "unbroken-line-field-coat",
    name: "The Unbroken Line Field Coat",
    price: 17999,
    category: "Series 01 / Chapter 05",
    description:
      "The collection's closing statement: a longline outer shell with a clean, uninterrupted silhouette and protection for uncertain weather.",
    details: [
      "Weather-resistant cotton blend",
      "Longline, relaxed silhouette",
      "Hidden two-way front closure",
      "Fully lined with internal storage",
    ],
    color: "Carbon black",
    chapterId: "5",
  },
];

export const CHAPTERS: Chapter[] = [
  {
    id: "1",
    title: "The Genesis Shell",
    subtitle: "A first line of defense",
    description:
      "The beginning is rarely loud. It is the choice to get dressed, step outside, and keep moving.",
    story: [
      "Every garment begins with a conflict. The friction of transit, the pressure of deadlines, and the quiet resilience required to move through both. The Genesis Shell was imagined for the moments between leaving and arriving.",
      "A weather-minded cotton canvas, considered hardware, and room to move turn the familiar outer layer into a small daily ritual: prepare, protect, proceed.",
      "The first chapter is not about becoming invulnerable. It is about showing up with care, even when the day asks more than expected.",
    ],
    visual: "visual-genesis",
    productId: "genesis-shell-jacket",
  },
  {
    id: "2",
    title: "The Weight of Silence",
    subtitle: "Room for your own signal",
    description:
      "A study in focus, and the strength it takes to protect a little quiet.",
    story: [
      "Silence is not an absence. It is a space you make for the thoughts that are easily lost in the rush of the day.",
      "This chapter is built around thoughtful layers and softened structure. Nothing asks for attention; everything earns its place.",
      "Wear it as a reminder that slowing down can be its own kind of forward motion.",
    ],
    visual: "visual-silence",
    productId: "weight-of-silence-overshirt",
  },
  {
    id: "3",
    title: "Obsidian Weave",
    subtitle: "Strength in the structure",
    description:
      "The unseen construction that lets you move through whatever comes next.",
    story: [
      "Resilience is often a matter of small things holding together. A seam reinforced. A step taken. A plan revised without being abandoned.",
      "Obsidian Weave turns that idea into articulated construction: durable materials, useful details, and no ornament without purpose.",
      "A uniform for movement, made to feel like your own.",
    ],
    visual: "visual-obsidian",
    productId: "obsidian-weave-cargo",
  },
  {
    id: "4",
    title: "The Solitary Guard",
    subtitle: "Prepared, never hardened",
    description:
      "Practical protection for the elements outside—and a little more ease within.",
    story: [
      "Preparation is a quiet kindness you extend to your future self. A place for what matters. A layer for the weather as it is, not as you hoped it would be.",
      "This chapter is about useful protection without unnecessary weight. Clean lines keep the focus on movement and the essentials close at hand.",
      "Carry what you need. Leave room for what you cannot plan.",
    ],
    visual: "visual-guard",
    productId: "solitary-guard-utility-vest",
  },
  {
    id: "5",
    title: "Unbroken Lineage",
    subtitle: "A beginning that continues",
    description:
      "The final chapter returns to where the collection began: the choice to continue.",
    story: [
      "An ending is not a verdict. It is a line connecting everything that came before to whatever comes after.",
      "The closing piece brings the collection's ideas together in one purposeful outer layer: protection, room to move, and a silhouette that lets the wearer speak first.",
      "Wear your battles—not as a burden, but as proof that you made it through them.",
    ],
    visual: "visual-lineage",
    productId: "unbroken-line-field-coat",
  },
];

// Find a starter product by its catalog ID.
export function getProduct(productId: string): Product | undefined {
  return PRODUCTS.find((product) => product.id === productId);
}

// Find a starter chapter by its catalog ID.
export function getChapter(chapterId: string): Chapter | undefined {
  return CHAPTERS.find((chapter) => chapter.id === chapterId);
}
