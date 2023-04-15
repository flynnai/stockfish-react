import styles from "./ChessPiece.module.scss";

function ChessPiece({ pieceLetter, rank, file, moveSelf }) {
    const imgSrc =
        process.env.PUBLIC_URL +
        "/chesspieces/" +
        (pieceLetter === pieceLetter.toUpperCase() ? "w" : "b") +
        pieceLetter.toUpperCase() +
        ".png";

    return (
        <div
            className={styles.main}
            style={{
                top: `${((7 - rank) * 100) / 8}%`,
                left: `${(file * 100) / 8}%`,
            }}
            onClick={() => moveSelf(rank + 1, file)}
        >
            <img src={imgSrc} draggable={false} />
        </div>
    );
}

export default ChessPiece;
