import { useEffect, useState } from "preact/hooks";
import { topicById } from "./engine/topics";
import { rankOf, totalXp } from "./state/progress";
import { useProgress } from "./ui/bits";
import { Home } from "./screens/Home";
import { TopicScreen } from "./screens/TopicScreen";
import { Learn } from "./screens/Learn";
import { Quick } from "./screens/Quick";
import { About } from "./screens/About";

/** Routes are plain #names so they survive a static host, a file:// URL and a wrapped desktop window alike. */
const currentRoute = (): string => location.hash.replace(/^#/, "");

export function App() {
  const [route, setRoute] = useState(currentRoute);
  useProgress();

  useEffect(() => {
    const onHash = () => {
      setRoute(currentRoute());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const total = totalXp();
  const rank = rankOf(total);
  const learnTopic = route.endsWith("-learn") ? topicById(route.slice(0, -6)) : undefined;
  const topic = topicById(route);

  return (
    <>
      <header class="top">
        <div class="wrap">
          <a class="brand" href="#" aria-label="Science Quest home">
            <i />
            Science Quest
          </a>
          <div class="rank" aria-label={`${rank.name}, ${total} XP`}>
            <span>{rank.name}</span>
            <b>{total} XP</b>
          </div>
        </div>
      </header>
      <main class="wrap">
        {route === "quick" ? <Quick key="quick" />
          : route === "about" ? <About key="about" />
          : learnTopic ? <Learn key={"learn-" + learnTopic.id} topic={learnTopic} />
          : topic ? <TopicScreen key={topic.id} topic={topic} />
          : <Home />}
      </main>
    </>
  );
}
