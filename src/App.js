import { useEffect, useRef, useState } from "react";
import "./App.css";
const engine = new Worker(process.env.PUBLIC_URL + "/stockfish.js");

function App() {
    const [output, setOutput] = useState("");
    const hasRunRef = useRef(false);

    const blockForMessage = () =>
        new Promise((resolve) => {
            const handleMessage = (message) => {
                engine.removeEventListener("message", handleMessage);
                resolve(message);
            };
            engine.addEventListener("message", handleMessage);
        });

    useEffect(() => {
        if (hasRunRef.current) return;
        hasRunRef.current = true;

        const runAsync = async () => {
            let event;

            engine.postMessage("uci");
            event = await blockForMessage();
            engine.postMessage("uci");

            console.log( " > " + event.data);

            // setOutput(output => output + "\n" + event.data);
            engine.postMessage("ucinewgame");
            engine.postMessage("setoption name MultiPV value 5");
            engine.postMessage("position startpos");
            engine.postMessage("go depth 15");
        };

        runAsync();
    }, []);

    return <div>{output}</div>;
}

export default App;
