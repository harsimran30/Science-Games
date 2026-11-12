import type { Topic } from "../engine/types";
import { LearnForces } from "../learn/Forces";
import { LearnLiving } from "../learn/Living";
import { LearnMatter } from "../learn/Matter";
import { LearnEarth } from "../learn/Earth";
import { LearnSpace } from "../learn/Space";
import { LearnEnergy } from "../learn/Energy";
import { LearnElectricity } from "../learn/Electricity";

const INTRO: Record<string, [string, string, () => preact.JSX.Element]> = {
  living: ["Who eats whom?", "Every food chain starts with a plant that makes its own food from sunlight. Build a chain, then see what happens when one link goes missing.", LearnLiving],
  forces: ["One push, then friction", "A force is a push or a pull. Give the crate a push and watch how the surface decides where it stops.", LearnForces],
  matter: ["Hot, cold and what particles do", "Everything is made of tiny particles. Heating makes them move faster. That is all it takes to turn ice into water and water into gas.", LearnMatter],
  earth: ["Follow a drop of water", "Water is always on the move: up from the sea, into clouds, down as rain and back along rivers. Follow one drop the whole way round.", LearnEarth],
  space: ["A spinning Earth and a circling Moon", "Day and night, and the changing shape of the Moon, both come from things turning. Move them yourself and see.", LearnSpace],
  energy: ["Vibrations and moving heat", "Sound is made by vibrations. Heat always moves from hotter things to cooler things. Try both.", LearnEnergy],
  electricity: ["A complete loop", "Electricity only flows when there is an unbroken loop from the battery, through everything, and back again.", LearnElectricity],
};

export function Learn({ topic }: { topic: Topic }) {
  const [title, lede, Model] = INTRO[topic.id];
  return (
    <section class="learn">
      <div class="row between">
        <a class="back" href={"#" + topic.id}>{topic.name}</a>
        <a class="btn ghost" href={"#" + topic.id}>Practise this</a>
      </div>
      <header class="hero">
        <h1>{title}</h1>
        <p class="lede">{lede}</p>
      </header>
      <Model />
    </section>
  );
}
