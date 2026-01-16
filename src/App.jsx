import { useState } from "react";
import "./App.css";

const QUESTIONS = [
    { letter: "A", question: "Türkiye'nin başkenti neresidir?", answer: "ankara" },
    { letter: "B", question: "2015/16 Süper Lig şampiyonu takımın kısaltması?", answer: "bjk" },
    { letter: "C", question: "Messi'nin yıllarca rekabet ettiği rakibinin ilk ismi?", answer: "cristiano" },
];

export default function App() {
    const [letters, setLetters] = useState(
        QUESTIONS.map((q) => ({
            char: q.letter,
            status: "empty", // empty | correct | wrong | pass
        }))
    );

    const [currentIndex, setCurrentIndex] = useState(0);
    const [answerText, setAnswerText] = useState("");
    const [gameOver, setGameOver] = useState(false);
    const [roundPasses, setRoundPasses] = useState([]);

    const currentQ = QUESTIONS[currentIndex];
    const correctCount = letters.filter((l) => l.status === "correct").length;
    const wrongCount = letters.filter((l) => l.status === "wrong").length;

    function clean(text) {
        return text.trim().toLowerCase();
    }

    function handleSubmit() {
        const user = clean(answerText);
        if (user === "" || gameOver) return;

        // 1) yeni status
        let newStatus = "wrong";
        if (user === "pass") newStatus = "pass";
        else if (user === clean(currentQ.answer)) newStatus = "correct";

        // 2) letters'ın "bir sonraki halini" hesapla
        const nextLetters = letters.map((l, i) =>
            i === currentIndex ? { ...l, status: newStatus } : l
        );

        // 3) pass listesi güncelle (lokal)
        let nextPasses = roundPasses;
        if (newStatus === "pass") {
            if (!nextPasses.includes(currentIndex)) nextPasses = [...nextPasses, currentIndex];
        } else {
            // bu harf daha önce pass'e girdiyse, artık çıkar (çünkü cevaplandı)
            if (nextPasses.includes(currentIndex)) {
                nextPasses = nextPasses.filter((x) => x !== currentIndex);
            }
        }

        // 4) state'leri bas
        setLetters(nextLetters);
        setRoundPasses(nextPasses);
        setAnswerText("");

        // 5) sıradaki soru seçimi
        const emptyIndex = nextLetters.findIndex((l) => l.status === "empty");
        if (emptyIndex !== -1) {
            setCurrentIndex(emptyIndex);
            return;
        }

        if (nextPasses.length > 0) {
            const [first, ...rest] = nextPasses;

            // o harfi tekrar sorabilmek için empty yap
            const reopened = nextLetters.map((l, i) =>
                i === first ? { ...l, status: "empty" } : l
            );

            setLetters(reopened);
            setRoundPasses(rest);
            setCurrentIndex(first);
            return;
        }

        setGameOver(true);
    }


    return (
        <div className="page">
            <h1>Passaparola</h1>

            <div className="letters">
                {letters.map((l, index) => (
                    <div
                        key={l.char}
                        className={
                            "letter " + (index === currentIndex ? "active " : "") + l.status
                        }
                    >
                        {l.char}
                    </div>
                ))}
            </div>

            <div className="card">
                {gameOver && (
                    <p>
                        <b>Oyun bitti!</b>
                    </p>
                )}

                <p className="question">
                    <b>{currentQ.letter}</b> — {currentQ.question}
                </p>

                <div className="answerRow">
                    <input
                        className="answerInput"
                        placeholder="Cevabını yaz... (pass yazabilirsin)"
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleSubmit();
                        }}
                    />
                    <button className="answerBtn" onClick={handleSubmit}>
                        Cevapla
                    </button>
                </div>

                <div className="score">
                    <span>Doğru: {correctCount}</span>
                    <span>Yanlış: {wrongCount}</span>
                </div>
            </div>
        </div>
    );
}
