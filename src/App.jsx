import { useEffect, useRef, useState } from "react";
import "./App.css";

const QUESTIONS = [
    { letter: "A", question: "A: What fruit is red or green and grows on trees?", answer: "apple" },
    { letter: "B", question: "B: What yellow fruit do monkeys like?", answer: "banana" },
    { letter: "C", question: "C: What animal says meow?", answer: "cat" },
    { letter: "D", question: "D: What animal says woof?", answer: "dog" },
    { letter: "E", question: "E: What do we call online mail?", answer: "email" },
    { letter: "F", question: "F: What animal swims and has fins?", answer: "fish" },
    { letter: "G", question: "G: What color is grass?", answer: "green" },
    { letter: "H", question: "H: What do you wear on your head?", answer: "hat" },
    { letter: "I", question: "I: What sweet frozen dessert is cold?", answer: "ice cream" },
    { letter: "J", question: "J: What is a sweet spread made from fruit?", answer: "jam" },
    { letter: "K", question: "K: What opens a locked door?", answer: "key" },
    { letter: "L", question: "L: What animal is called the king of the jungle?", answer: "lion" },
    { letter: "M", question: "M: What is Earth's natural satellite?", answer: "moon" },
    { letter: "N", question: "N: What comes after day?", answer: "night" },
    { letter: "O", question: "O: What fruit is round and orange?", answer: "orange" },
    { letter: "P", question: "P: What do you write with?", answer: "pen" },
    { letter: "Q", question: "Q: What word means a short test?", answer: "quiz" },
    { letter: "R", question: "R: What falls from clouds?", answer: "rain" },
    { letter: "S", question: "S: What shines in the sky during the day?", answer: "sun" },
    { letter: "T", question: "T: What hot drink is made with leaves?", answer: "tea" },
    { letter: "U", question: "U: What do you use when it rains?", answer: "umbrella" },
    { letter: "V", question: "V: What planet starts with V?", answer: "venus" },
    { letter: "W", question: "W: What do you drink when you are thirsty?", answer: "water" },
    { letter: "X", question: "X: What instrument starts with X?", answer: "xylophone" },
    { letter: "Y", question: "Y: What color is a banana?", answer: "yellow" },
    { letter: "Z", question: "Z: What animal has black and white stripes?", answer: "zebra" },
];

export default function App() {
    const [letters, setLetters] = useState(
        QUESTIONS.map((q) => ({ char: q.letter, status: "empty" }))
    );

    const [currentIndex, setCurrentIndex] = useState(0);
    const [answerText, setAnswerText] = useState("");
    const [gameOver, setGameOver] = useState(false);
    const [roundPasses, setRoundPasses] = useState([]);
    const [feedback, setFeedback] = useState("");
    const [playerName, setPlayerName] = useState("");
    const [savedName, setSavedName] = useState("");

    const inputRef = useRef(null);

    const [lastScore, setLastScore] = useState(() => {
        const saved = localStorage.getItem("passaparola:lastScore");
        if (!saved) return null;

        const obj = JSON.parse(saved);
        if (obj.total !== QUESTIONS.length) return null;
        return obj;
    });

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const currentQ = QUESTIONS[currentIndex];

    const correctCount = letters.filter((l) => l.status === "correct").length;
    const wrongCount = letters.filter((l) => l.status === "wrong").length;
    const remainingCount = letters.filter((l) => l.status === "empty").length;

    function clean(text) {
        return text.trim().toLowerCase();
    }

    function resetGame() {
        setLetters(QUESTIONS.map((q) => ({ char: q.letter, status: "empty" })));
        setCurrentIndex(0);
        setAnswerText("");
        setRoundPasses([]);
        setGameOver(false);
        setFeedback("");
        setTimeout(() => inputRef.current?.focus(), 0);
    }

    function handleSubmit() {
        const user = clean(answerText);
        if (user === "" || gameOver) return;

        let newStatus = "wrong";
        if (user === "pass") newStatus = "pass";
        else if (user === clean(currentQ.answer)) newStatus = "correct";

        setFeedback(newStatus);
        setTimeout(() => setFeedback(""), 220);

        const nextLetters = letters.map((l, i) =>
            i === currentIndex ? { ...l, status: newStatus } : l
        );

        let nextPasses = roundPasses;

        if (newStatus === "pass") {
            if (!nextPasses.includes(currentIndex)) {
                nextPasses = [...nextPasses, currentIndex];
            }
        } else {
            nextPasses = nextPasses.filter((x) => x !== currentIndex);
        }

        setLetters(nextLetters);
        setRoundPasses(nextPasses);
        setAnswerText("");
        inputRef.current?.focus();

        const emptyIndex = nextLetters.findIndex((l) => l.status === "empty");

        if (emptyIndex !== -1) {
            setCurrentIndex(emptyIndex);
            return;
        }

        if (nextPasses.length > 0) {
            const [first, ...rest] = nextPasses;

            const reopened = nextLetters.map((l, i) =>
                i === first ? { ...l, status: "empty" } : l
            );

            setLetters(reopened);
            setRoundPasses(rest);
            setCurrentIndex(first);
            return;
        }

        const finalCorrect = nextLetters.filter((l) => l.status === "correct").length;
        const finalWrong = nextLetters.filter((l) => l.status === "wrong").length;

        const scoreObj = {
            correct: finalCorrect,
            wrong: finalWrong,
            total: QUESTIONS.length,
            name: savedName || playerName.trim() || "Anonymous",
        };

        localStorage.setItem("passaparola:lastScore", JSON.stringify(scoreObj));
        setLastScore(scoreObj);
        setGameOver(true);
    }

    return (
        <div className="page">
            <div className="topbar">
                <h1 className="title">Passaparola</h1>
            </div>

            <div className="layout">
                <div className="arena">
                    <div className="ring">
                        {letters.map((l, index) => {
                            const total = letters.length;
                            const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
                            const r = 170;
                            const x = Math.cos(angle) * r;
                            const y = Math.sin(angle) * r;

                            return (
                                <div
                                    key={l.char}
                                    className={
                                        "letter " +
                                        (index === currentIndex ? "active " : "") +
                                        l.status
                                    }
                                    style={{
                                        "--tx": `${x}px`,
                                        "--ty": `${y}px`,
                                        transform: `translate(${x}px, ${y}px)`,
                                    }}
                                >
                                    {l.char}
                                </div>
                            );
                        })}

                        <div className="center">
                            <div className="nameLabel">Name</div>

                            <input
                                className="nameInput"
                                placeholder="Enter your name..."
                                value={playerName}
                                disabled={!!savedName}
                                onChange={(e) => setPlayerName(e.target.value)}
                            />

                            {!savedName && playerName.trim() !== "" && (
                                <button
                                    className="nameSaveBtn"
                                    onClick={() => setSavedName(playerName.trim())}
                                >
                                    Save
                                </button>
                            )}

                            {savedName && (
                                <button className="nameSaveBtn" onClick={() => setSavedName("")}>
                                    Change
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className={"card " + (feedback ? "shake " + feedback : "")}>
                    <div className="score">
                        <span>Correct: {correctCount}</span>
                        <span>Wrong: {wrongCount}</span>
                        <span>Remaining: {remainingCount}</span>
                    </div>

                    {feedback && <div className={"spark " + feedback}>✦ ✦ ✦</div>}

                    {lastScore && (
                        <div className="lastScore">
                            Last Score ({lastScore.name}): {lastScore.correct} correct /{" "}
                            {lastScore.wrong} wrong (Total: {lastScore.total})
                        </div>
                    )}

                    {!gameOver ? (
                        <div className="rightPanel">
                            <div className="questionPanel">
                                <div className="questionLetter">{currentQ.letter}</div>
                                <div className="questionText">{currentQ.question}</div>
                            </div>

                            <div className="qaStack">
                                <input
                                    ref={inputRef}
                                    className="answerInput"
                                    placeholder="Type your answer... (or type pass)"
                                    value={answerText}
                                    onChange={(e) => setAnswerText(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleSubmit();
                                    }}
                                />

                                <button className="answerBtn full" onClick={handleSubmit}>
                                    Submit
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="summary">
                            <p>
                                <b>Game Summary</b>
                            </p>
                            <p>Correct: {correctCount}</p>
                            <p>Wrong: {wrongCount}</p>
                            <p>Remaining: {remainingCount}</p>

                            <button className="answerBtn full" onClick={resetGame}>
                                Restart Game
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}