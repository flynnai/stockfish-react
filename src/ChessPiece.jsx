import styles from "./ChessPiece.module.scss";

function ChessPiece({ pieceLetter, rank, file }) {
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
                top: `${(rank * 100) / 8}%`,
                left: `${(file * 100) / 8}%`,
            }}
        >
            <img src={imgSrc} />
        </div>
    );
}

export default ChessPiece;
