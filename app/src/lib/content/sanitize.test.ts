import { describe, expect, it } from "vitest";

import {
  cleanDek,
  extractFirstImage,
  extractYouTubeId,
  replaceSocialEmbeds,
  sanitizeHtml,
  stripLeadingDek,
  toPlainText,
} from "./html";

describe("sanitizeHtml", () => {
  it("removes script tags and their content", () => {
    const clean = sanitizeHtml('<p>Testo</p><script>alert("x")</script><p>Dopo</p>');
    expect(clean).not.toContain("script");
    expect(clean).toContain("<p>Testo</p>");
    expect(clean).toContain("<p>Dopo</p>");
  });

  it("strips inline event handlers", () => {
    const clean = sanitizeHtml('<img src="https://teleambiente.tv/a.jpg" onerror="alert(1)">');
    expect(clean).not.toContain("onerror");
    expect(clean).toContain("a.jpg");
  });

  it("drops iframes from unknown hosts and keeps YouTube embeds", () => {
    const bad = sanitizeHtml('<iframe src="https://evil.example/frame"></iframe>');
    expect(bad).toBe("");

    const good = sanitizeHtml(
      '<iframe src="https://www.youtube.com/embed/abc123" title="Servizio"></iframe>',
    );
    expect(good).toContain("youtube.com/embed/abc123");
  });

  it("neutralises javascript: links", () => {
    const clean = sanitizeHtml('<a href="javascript:alert(1)">clic</a>');
    expect(clean).not.toContain("javascript:");
  });

  it("keeps editorial structure intact", () => {
    const html =
      '<figure><img src="https://teleambiente.tv/b.jpg" alt="Campo"><figcaption>Didascalia</figcaption></figure><blockquote>Una frase</blockquote>';
    const clean = sanitizeHtml(html);
    expect(clean).toContain("<figure>");
    expect(clean).toContain("<blockquote>");
    expect(clean).toContain("Didascalia");
  });
});

describe("cleanDek", () => {
  it("removes the WordPress truncation marker without leaving a dangling phrase", () => {
    expect(cleanDek("Un testo che continua e si interrompe [...]")).toBe(
      "Un testo che continua e si interrompe …",
    );
    expect(cleanDek("Un testo che continua e si interrompe […]")).toBe(
      "Un testo che continua e si interrompe …",
    );
  });

  it("leaves a complete dek alone", () => {
    expect(cleanDek("Un dek che finisce bene.")).toBe("Un dek che finisce bene.");
  });

  it("cuts a long truncated excerpt back to its last sentence", () => {
    const dek = cleanDek(
      "La prima frase è completa e abbastanza lunga da essere utile al lettore. La seconda invece si interrompe e finisce male [...]",
    );
    expect(dek).toBe("La prima frase è completa e abbastanza lunga da essere utile al lettore.");
  });
});

describe("extraction helpers", () => {
  it("finds a YouTube id in an embed", () => {
    expect(extractYouTubeId('<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ"></iframe>')).toBe(
      "dQw4w9WgXcQ",
    );
  });

  it("finds a YouTube id in a watch link", () => {
    expect(extractYouTubeId('<a href="https://youtu.be/dQw4w9WgXcQ">video</a>')).toBe("dQw4w9WgXcQ");
  });

  it("finds the first image", () => {
    expect(extractFirstImage('<p>x</p><img src="https://teleambiente.tv/foto.jpg">')).toEqual({
      url: "https://teleambiente.tv/foto.jpg",
      alt: "",
    });
  });

  it("strips tags into readable text", () => {
    expect(toPlainText("<p>Ciao <strong>mondo</strong></p>")).toBe("Ciao mondo");
  });
});

describe("body preparation", () => {
  it("drops a first paragraph that repeats the dek", () => {
    const html = "<p>La stessa frase che il CMS usa come estratto del pezzo.</p><p>Il corpo vero.</p>";
    expect(stripLeadingDek(html, "La stessa frase che il CMS usa come estratto del pezzo.")).toBe(
      "<p>Il corpo vero.</p>",
    );
  });

  it("finds the duplicate even when a video embed opens the body", () => {
    const dek = "La stessa frase che il CMS usa come estratto del pezzo.";
    const html = `<iframe src="https://www.youtube.com/embed/abc"></iframe><p><em>${dek}</em></p><p>Il corpo vero.</p>`;
    expect(stripLeadingDek(html, dek)).toBe(
      '<iframe src="https://www.youtube.com/embed/abc"></iframe><p>Il corpo vero.</p>',
    );
  });

  it("also matches when the duplicate is marked up as a heading", () => {
    const dek = "La stessa frase che il CMS usa come estratto del pezzo.";
    const html = `<h4><em><strong>${dek}</strong></em></h4><p>Il corpo vero.</p>`;
    expect(stripLeadingDek(html, dek)).toBe("<p>Il corpo vero.</p>");
  });

  it("keeps the first paragraph when it is not the dek", () => {
    const html = "<p>Un incipit diverso.</p><p>Il corpo.</p>";
    expect(stripLeadingDek(html, "Un estratto del tutto differente.")).toBe(html);
  });

  it("turns a dead Instagram embed into a link", () => {
    const html =
      '<blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/p/abc/"><div>card</div></blockquote>';
    expect(replaceSocialEmbeds(html)).toBe(
      '<p><a href="https://www.instagram.com/p/abc/" rel="noopener">Guarda il post su Instagram</a></p>',
    );
  });
});
