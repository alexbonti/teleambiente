import { describe, expect, it } from "vitest";

import { cleanTitle, decodeEntities, extractFirstImage, extractYouTubeId, toPlainText } from "./html";
import { mapWpPost } from "./wp";

const rawPost = {
  id: 200443,
  date: "2026-11-25T11:28:06",
  modified: "2026-11-25T11:30:00",
  slug: "intelligenza-artificiale-opportunita-natura-video",
  link: "https://teleambiente.tv/intelligenza-artificiale-opportunita-natura-video/",
  title: { rendered: "Intelligenza artificiale, le opportunit&agrave; per la natura" },
  excerpt: { rendered: "<p>Un Professore spiega l&rsquo;AI per la natura.</p>\n" },
  content: {
    rendered:
      '<p>Testo dell&rsquo;articolo.</p><iframe src="https://www.youtube.com/embed/9coeSHW3Lhk"></iframe>',
  },
  _embedded: {
    "wp:featuredmedia": [
      {
        id: 1,
        source_url: "https://teleambiente.tv/wp-content/uploads/2026/11/ai.jpg",
        alt_text: "",
        media_details: { width: 1240, height: 600 },
      },
    ],
    author: [
      { id: 7, name: "Fausto Piu", slug: "fausto-piu", link: "https://teleambiente.tv/author/fausto-piu/" },
    ],
    "wp:term": [
      [
        { id: 10, name: "Attualità", slug: "attualita", taxonomy: "category" },
        { id: 11, name: "Animali", slug: "animali", taxonomy: "category" },
        { id: 12, name: "Video", slug: "video", taxonomy: "category" },
      ],
      [{ id: 20, name: "intelligenza artificiale", slug: "intelligenza-artificiale", taxonomy: "post_tag" }],
    ],
  },
};

describe("html helpers", () => {
  it("decodes the entities WordPress actually emits", () => {
    expect(decodeEntities("opportunit&agrave; &rsquo;&ldquo;citt&agrave;&rdquo; &amp; 5&#8217;")).toBe(
      "opportunità ’“città” & 5’",
    );
  });

  it("strips tags and collapses whitespace", () => {
    expect(toPlainText("<p>ciao <strong>mondo</strong></p>\n")).toBe("ciao mondo");
  });

  it("cleans titles without leaving entities behind", () => {
    expect(cleanTitle("Caccia, la proposta &egrave; legge")).toBe("Caccia, la proposta è legge");
  });

  it("extracts a YouTube id from an embed", () => {
    expect(extractYouTubeId('<iframe src="https://www.youtube.com/embed/9coeSHW3Lhk"></iframe>')).toBe(
      "9coeSHW3Lhk",
    );
    expect(extractYouTubeId("<p>nessun video</p>")).toBeNull();
  });

  it("extracts the first inline image", () => {
    expect(extractFirstImage('<img src="https://x/y.jpg" alt="Un&rsquo;immagine">')).toEqual({
      url: "https://x/y.jpg",
      alt: "Un’immagine",
    });
  });
});

describe("mapWpPost", () => {
  it("maps a real WordPress payload to the domain Article", () => {
    const article = mapWpPost(rawPost);

    expect(article.slug).toBe("intelligenza-artificiale-opportunita-natura-video");
    expect(article.title).toBe("Intelligenza artificiale, le opportunità per la natura");
    expect(article.dek).toBe("Un Professore spiega l’AI per la natura.");
    expect(article.videoId).toBe("9coeSHW3Lhk");
    expect(article.authors[0]?.name).toBe("Fausto Piu");
    expect(article.heroImage?.width).toBe(1240);
    expect(article.tags).toEqual(["intelligenza artificiale"]);
    // "Video" is a format, not a topic: it must not become a hub.
    expect(article.hubs.map((hub) => hub.slug)).toEqual(["attualita", "animali"]);
  });

  it("rejects payloads missing the required identity fields", () => {
    expect(() => mapWpPost({ id: 1 })).toThrow();
  });
});
