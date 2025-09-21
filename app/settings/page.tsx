import { registerDiscordCommands } from "./action";


export default function Home() {
  return (
    <div>
        <button onClick={registerDiscordCommands}>Update commands</button>
    </div>
  );
}
