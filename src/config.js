// All the invitation's wording lives here; edit this file to change any detail.
export const wedding = {
  groom: { name: "Mohamed Ibrahim", first: "Ibrahim", parents: "Mr. Abdul Azees" },
  bride: { name: "Naseeha Fathima", first: "Naseeha", parents: "Mr. Abdul Kalam" },

  // Shown behind the scratch foil.
  reveal: { date: "December 24, 2026", dayTime: "Thursday • 05:00 PM" },

  events: [
    {
      name: "Reception",
      when: "December 24 • 4:00 PM",
      place: "Chekkadi Masjid",
      mapUrl: "https://maps.app.goo.gl/16sSErxox6QnqiFw9",
    },
    {
      name: "Nikkah",
      when: "December 24 • 5:00 PM",
      place: "Chekkadi Masjid",
      mapUrl: "https://maps.app.goo.gl/16sSErxox6QnqiFw9",
    },
    {
      name: "Valima",
      when: "December 25 • 1:00 PM",
      place: "Groom's Residence",
      mapUrl: "https://maps.app.goo.gl/ymDG8mRnvQpiKvnw5",
    },
  ],

  // Optional background music: put an mp3 in /public and set e.g. "/music.mp3".
  music: null,
};

// Painted artwork lives in /public/art. Each slot falls back to a plain colour until its file exists.
export const art = {
  tapScene: "/art/tap-scene.jpg",
  curtains: "/art/curtains.jpg",
  archWall: "/art/arch-wall.jpg",
  stage: "/art/stage.jpg",
  garland: "/art/garland.jpg",
  scratchFrame: "/art/scratch-frame.jpg",
  introFilm: "/art/intro.mp4", // optional; when present it replaces the animated stills
};
