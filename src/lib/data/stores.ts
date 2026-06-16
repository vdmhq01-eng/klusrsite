import type { Store } from "@/types";

const standardHours = [
  { day: "Maandag", hours: "09:00 - 18:00" },
  { day: "Dinsdag", hours: "09:00 - 18:00" },
  { day: "Woensdag", hours: "09:00 - 18:00" },
  { day: "Donderdag", hours: "09:00 - 21:00" },
  { day: "Vrijdag", hours: "09:00 - 18:00" },
  { day: "Zaterdag", hours: "09:00 - 17:00" },
  { day: "Zondag", hours: "Gesloten" },
];

export const stores: Store[] = [
  {
    id: "nijverdal",
    name: "KLUSR Nijverdal",
    slug: "nijverdal",
    city: "Nijverdal",
    address: "Van den Bergsweg 3",
    postalCode: "7442 CK",
    phone: "+31 85 273 8338",
    email: "klantenservice@klus-r.nl",
    openingHours: standardHours,
    lat: 52.3633,
    lng: 6.4631,
    image: "https://picsum.photos/seed/klusr-store-nijverdal/1200/800",
    isFlagship: true,
    opening: "Geopend — ons eerste filiaal",
  },
  {
    id: "emmen",
    name: "KLUSR Emmen",
    slug: "emmen",
    city: "Emmen",
    address: "Weerdingerstraat 22",
    postalCode: "7811 CA",
    phone: "0591 - 23 45 67",
    email: "emmen@klus-r.nl",
    openingHours: standardHours,
    lat: 52.7792,
    lng: 6.9069,
    image: "https://picsum.photos/seed/klusr-store-emmen/1200/800",
    opening: "Binnenkort open",
  },
  {
    id: "zutphen",
    name: "KLUSR Zutphen",
    slug: "zutphen",
    city: "Zutphen",
    address: "Industrieweg 8",
    postalCode: "7202 CA",
    phone: "0575 - 34 56 78",
    email: "zutphen@klus-r.nl",
    openingHours: standardHours,
    lat: 52.1383,
    lng: 6.2014,
    image: "https://picsum.photos/seed/klusr-store-zutphen/1200/800",
    opening: "Binnenkort open",
  },
  {
    id: "apeldoorn",
    name: "KLUSR Apeldoorn",
    slug: "apeldoorn",
    city: "Apeldoorn",
    address: "Laan van Malkenschoten 40",
    postalCode: "7333 NP",
    phone: "055 - 45 67 89",
    email: "apeldoorn@klus-r.nl",
    openingHours: standardHours,
    lat: 52.2012,
    lng: 5.9699,
    image: "https://picsum.photos/seed/klusr-store-apeldoorn/1200/800",
    opening: "Binnenkort open",
  },
  {
    id: "deventer",
    name: "KLUSR Deventer",
    slug: "deventer",
    city: "Deventer",
    address: "Hanzeweg 16",
    postalCode: "7418 AT",
    phone: "0570 - 56 78 90",
    email: "deventer@klus-r.nl",
    openingHours: standardHours,
    lat: 52.2553,
    lng: 6.1639,
    image: "https://picsum.photos/seed/klusr-store-deventer/1200/800",
    opening: "Binnenkort open",
  },
];

export const flagshipStore = stores[0];

export function getStore(slug: string): Store | undefined {
  return stores.find((s) => s.slug === slug || s.id === slug);
}

export function getStoreName(id: string): string {
  return stores.find((s) => s.id === id)?.city ?? id;
}
