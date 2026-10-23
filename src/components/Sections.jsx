import { wedding } from "../config";
import Reveal from "./Reveal";
import { DiamondRule, Garland, Kicker } from "./Ornaments";

const couple = (
  <>
    {wedding.groom.first} <span className="amp">&amp;</span> {wedding.bride.first}
  </>
);

export function Blessed() {
  return (
    <section className="sec sec-ivory blessed">
      <Garland className="garland-top" />
      <span className="ring ring-l" aria-hidden="true" />
      <span className="ring ring-r" aria-hidden="true" />
      <Reveal>
        <h2 className="script heading">A Blessed Beginning</h2>
        <p className="body-serif">
          With hearts full of gratitude, we warmly invite you to join us as we celebrate this
          beautiful beginning with the love, prayers, and blessings of our families.
        </p>
        <p className="script couple">{couple}</p>
      </Reveal>
    </section>
  );
}

export function Festivities() {
  return (
    <section className="sec sec-ivory festivities">
      <Garland className="garland-top" />
      <Reveal>
        <Kicker>The festivities</Kicker>
        <h2 className="script heading">Days filled with joy</h2>
        <DiamondRule />
      </Reveal>
      <div className="event-list">
        {wedding.events.map(ev => (
          <Reveal key={ev.name}>
            <article className="event-card">
              <h3 className="event-name">{ev.name}</h3>
              <p className="event-when">{ev.when}</p>
              <p className="event-place">{ev.place}</p>
              <a className="btn-outline" href={ev.mapUrl} target="_blank" rel="noopener noreferrer">
                View on Google Maps
              </a>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function Hearts() {
  return (
    <section className="sec hearts">
      <Garland className="garland-top" />
      <Reveal>
        <Kicker>With all our hearts</Kicker>
        <p className="script hearts-quote">
          Two souls. One heart.
          <br />
          One promise. Forever in God’s love.
        </p>
        <p className="body-italic">Your love, blessings, and presence are the greatest gifts we could ever ask for.</p>
      </Reveal>
      <Garland className="garland-bottom" />
    </section>
  );
}

export function Venue() {
  const { venue } = wedding;
  return (
    <section className="sec sec-ivory venue-sec">
      <Reveal>
        <div className="venue-card">
          <p className="venue-kicker">The venue</p>
          <div className="venue-rule" aria-hidden="true">
            <span />
            <svg width="12" height="12" viewBox="-6 -6 12 12">
              <path d="M0 -5.5 L1.4 -1.4 L5.5 0 L1.4 1.4 L0 5.5 L-1.4 1.4 L-5.5 0 L-1.4 -1.4 Z" fill="var(--gold)" />
            </svg>
            <span />
          </div>
          {venue.photo && <img className="venue-photo" src={venue.photo} alt={venue.name} />}
          <h2 className="script venue-name">{venue.name}</h2>
          <p className="venue-line">{venue.line}</p>
          <a className="btn-outline btn-gold" href={venue.mapUrl} target="_blank" rel="noopener noreferrer">
            View on Google Maps
          </a>
        </div>
      </Reveal>
    </section>
  );
}

export function Closing() {
  return (
    <section className="sec closing">
      <Garland className="garland-top" />
      <div className="closing-arch">
        <Reveal>
          <DiamondRule />
          <p className="script couple closing-couple">{couple}</p>
          <p className="closing-line">{wedding.closingLine}</p>
        </Reveal>
      </div>
    </section>
  );
}
