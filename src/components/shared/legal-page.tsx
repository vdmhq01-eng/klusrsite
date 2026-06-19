import { Breadcrumb } from "@/components/plp/breadcrumb";

/** Bedrijfsgegevens — KLUSR is een handelsnaam van VDM Online BV. */
export const COMPANY = {
  legalName: "VDM Online BV",
  tradeName: "KLUSR",
  email: "klantenservice@klus-r.nl",
  phone: "+31 85 273 8338",
  address: "Van den Bergsweg 3, 7442 CK Nijverdal",
  postalAddress: {
    street: "Van den Bergsweg 3",
    postalCode: "7442 CK",
    city: "Nijverdal",
  },
  country: "Nederland",
  kvk: "70367922",
  btw: "NL855528618B01",
  iban: "NL41INGB0105014877",
  note: "KLUSR is een handelsnaam van VDM Online BV",
};

export interface LegalSection {
  heading: string;
  body: React.ReactNode;
}

export function LegalPage({
  title,
  intro,
  updated,
  sections,
}: {
  title: string;
  intro?: string;
  updated?: string;
  sections: LegalSection[];
}) {
  return (
    <div className="pb-16">
      <div className="container-klusr">
        <Breadcrumb items={[{ label: title }]} />
      </div>
      <article className="container-klusr mt-6 max-w-3xl">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
        {updated && (
          <p className="mt-2 text-sm text-muted-foreground">Laatst bijgewerkt: {updated}</p>
        )}
        {intro && <p className="mt-4 text-base leading-relaxed text-muted-foreground">{intro}</p>}

        <div className="mt-8 space-y-8">
          {sections.map((s, i) => (
            <section key={i}>
              <h2 className="text-lg font-bold sm:text-xl">{s.heading}</h2>
              <div className="mt-2 space-y-3 text-sm leading-relaxed text-muted-foreground [&_a]:font-medium [&_a]:text-primary [&_a:hover]:underline [&_li]:ml-1 [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
                {s.body}
              </div>
            </section>
          ))}
        </div>
      </article>
    </div>
  );
}
