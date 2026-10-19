import { Col, Grid, SectionLabel } from "@/components/layout/Grid";
import { Button } from "@/components/ui/Button";

// Temporary foundation preview: tokens, grid and buttons. Replaced by the real Home later.
export default function Home() {
  return (
    <main className="pb-(--space-24)">
      <Grid as="header" className="text-label max-md:flex! justify-between py-(--space-4)">
        <span>ENDAH LIYUSLIHA</span>
        <nav className="hidden gap-(--space-4) md:flex">
          {["Work", "Playground", "About", "Contact"].map((item) => (
            <a key={item} href="#" className="hover:text-muted">
              {item}
            </a>
          ))}
        </nav>
        <span className="hidden text-right text-muted xl:block">Foundation preview</span>
      </Grid>

      <Grid lines className="border-y border-line">
        <Col className="py-(--space-12)">
          <p className="text-label text-muted">Product Designer</p>
        </Col>
        <Col span={2} className="py-(--space-12)">
          <h1 className="text-display">
            Endah
            <br />
            Liyusliha
          </h1>
          <p className="text-body-l mt-(--space-8) max-w-[36ch] text-muted">
            Tidy structure, playful interactions. UI/UX case studies and design explorations.
          </p>
          <div className="mt-(--space-8) flex flex-wrap gap-(--space-3)">
            <Button href="#work" size="lg">
              View work <span aria-hidden>→</span>
            </Button>
            <Button href="#contact" variant="outline" size="lg">
              Get in touch
            </Button>
          </div>
        </Col>
      </Grid>

      <Grid className="mt-(--space-16)">
        <Col span={3}>
          <SectionLabel index="01" title="Buttons" count="04" />
        </Col>
        <Col span={3} className="flex flex-wrap items-center gap-(--space-3)">
          <Button>Solid</Button>
          <Button variant="outline">Outline</Button>
          <Button size="lg">Solid large</Button>
          <Button disabled>Disabled</Button>
        </Col>
      </Grid>

      <Grid className="mt-(--space-16)">
        <Col span={3}>
          <SectionLabel index="02" title="Type scale" count="06" />
        </Col>
        <Col span={3} className="space-y-(--space-4)">
          <p className="text-h1">Heading one</p>
          <p className="text-h2">Heading two</p>
          <p className="text-body-l">Body large — intro paragraphs.</p>
          <p>Body — default reading text for case studies.</p>
          <p className="text-label text-muted">LABEL / GEIST MONO — (01) [05]</p>
        </Col>
      </Grid>

      <Grid lines className="mt-(--space-16) border-y border-line">
        {["Column 01", "Column 02", "Column 03"].map((c) => (
          <Col key={c} className="py-(--space-8)">
            <p className="text-label text-muted">{c}</p>
            <p className="mt-(--space-2)">Editorial grid with hairlines.</p>
          </Col>
        ))}
      </Grid>
    </main>
  );
}
