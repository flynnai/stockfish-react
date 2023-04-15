import { converters } from "fen-reader";
import { useEffect, useRef, useState } from "react";
import styles from "./App.module.scss";
import ChessPiece from "./ChessPiece";
const engine = new Worker(process.env.PUBLIC_URL + "/stockfish.js");

const initBoardState = converters
    .fen2array("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR")
    .map((row, rank) =>
        row.map(
            (letter, file) =>
                letter && {
                    letter,
                    file,
                    rank,
                }
        )
    )
    .flat()
    .filter(Boolean);

function App() {
    const [boardState, setBoardState] = useState(initBoardState);
    const hasRunRef = useRef(false);
    console.log("State", boardState);

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
            const MULTIPV_COUNT = 5;
            const DEPTH = 15;

            let event;

            engine.postMessage("uci");
            for (let i = 0; i < 5000; i++) {
                event = await blockForMessage();
                console.log("1 > '" + event.data + "'");
                if (event.data === "uciok") {
                    break;
                }
            }

            // setOutput(output => output + "\n" + event.data);
            engine.postMessage("ucinewgame");
            // (no output)
            engine.postMessage(`setoption name MultiPV value ${MULTIPV_COUNT}`);
            // (no output)
            engine.postMessage("position startpos");
            // (no output)

            engine.postMessage(`go depth ${DEPTH}`);
            const bestMoves = [];
            // `MULTIPV_COUNT` messages for `DEPTH` plies
            for (let i = 0; i < MULTIPV_COUNT * DEPTH; i++) {
                event = await blockForMessage();
                if (i >= MULTIPV_COUNT * (DEPTH - 1)) {
                    console.log(">> " + event.data);
                    const match = event.data.match(
                        /multipv (\d+) pv ([^ ]+?) /
                    );
                    if (
                        match === null ||
                        parseInt(match[1]) !== bestMoves.length + 1
                    ) {
                        console.log(
                            "ERROR: unexpected format for multiPV line: \n",
                            event.data
                        );
                        return;
                    }
                    bestMoves.push(match[2]);
                }
            }

            console.log(`My ${MULTIPV_COUNT} best moves are `, bestMoves);

            // finish 'er off
            // something like "info nodes 2028789 time 1592" and "bestmove d2d4 ponder g8f6"
            for (let i = 0; i < 2; i++) {
                event = await blockForMessage();
            }
        };

        runAsync();
    }, []);

    return (
        <div className={styles.main}>
            <div className={styles.piecesContainer}>
                {boardState.map(({ letter, rank, file }) => (
                    <ChessPiece
                        pieceLetter={letter}
                        rank={rank}
                        file={file}
                        key={rank + "-" + file}
                    />
                ))}
            </div>
        </div>
    );
}

export default App;
