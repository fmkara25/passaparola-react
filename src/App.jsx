import { useEffect, useRef, useState } from "react";
import "./App.css";

const QUESTIONS = [
    { letter: "A", question: "A: Türkiye'nin başkenti?", answer: "ankara" },
    { letter: "B", question: "B: Arının yaptığı tatlı şey?", answer: "bal" },
    { letter: "C", question: "C: Sıcak içilen, ince belli bardakta da içilen içecek?", answer: "cay" },
    { letter: "D", question: "D: Bugünden bir önceki gün?", answer: "dun" },
    { letter: "E", question: "E: At ve katira benzeyen hayvan?", answer: "esek" },
    { letter: "F", question: "F: Çok güçlü rüzgar olayı?", answer: "firtina" },
    { letter: "G", question: "G: Gökyüzünde görülen gaz topu, Güneş de bir...?", answer: "yildiz" },
    { letter: "H", question: "H: Yeryuzunun kagida aktarilmis hali?", answer: "harita" },
    { letter: "I", question: "I: Gözümüzün içindeki renkli kısım?", answer: "iris" },
    { letter: "J", question: "J: Besiktas ... Kulubu", answer: "jimnastik" },
    { letter: "K", question: "K: Besiktasin sembolu olan hayvan?", answer: "kartal" },
    { letter: "L", question: "L: Sari renkli eksi bir meyve?", answer: "limon" },
    { letter: "M", question: "M: Ingilizcede banana?", answer: "muz" },
    { letter: "N", question: "N: Atin ayagina cakilan sey", answer: "nal" },
    { letter: "O", question: "O: Okulda ders anlatan kişi?", answer: "ogretmen" },
    { letter: "P", question: "P: Futbolda rakibe dogru yapilan baski?", answer: "press" },
    { letter: "R", question: "R: Uykuda gorulen gercekci durum?", answer: "ruya" },
    { letter: "S", question: "S: 55 plakali sehrimiz?", answer: "samsun" },
    { letter: "T", question: "T: 61 plakali sehrimiz?", answer: "trabzon" },
    { letter: "U", question: "U: Kirmizi siyah renkli kucuk bir bocek turu", answer: "ugurbocegi" },
    { letter: "V", question: "V: Bir gezegen?", answer: "venus" },
    { letter: "Y", question: "Y: Haziran, temmuz agustos hangi mevsimdir", answer: "yaz" },
    { letter: "Z", question: "Z: Hayvanat bahçesinde görülen uzun boyunlu hayvan?", answer: "zurafa" },
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
    const inputRef = useRef(null);
    const [feedback, setFeedback] = useState(""); // "" | "correct" | "wrong" | "pass"
    const [playerName, setPlayerName] = useState("");
    const [savedName, setSavedName] = useState("");
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

    function resetGame() {
        setLetters(
            QUESTIONS.map((q) => ({
                char: q.letter,
                status: "empty",
            }))
        );
        setCurrentIndex(0);
        setAnswerText("");
        setRoundPasses([]);
        setGameOver(false);
        setTimeout(() => inputRef.current?.focus(), 0);
    }

    const currentQ = QUESTIONS[currentIndex];

    const correctCount = letters.filter((l) => l.status === "correct").length;
    const wrongCount = letters.filter((l) => l.status === "wrong").length;
    const remainingCount = letters.filter((l) => l.status === "empty").length;

    function clean(text) {
        return text.trim().toLowerCase();
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
            if (!nextPasses.includes(currentIndex)) nextPasses = [...nextPasses, currentIndex];
        } else {
            if (nextPasses.includes(currentIndex)) {
                nextPasses = nextPasses.filter((x) => x !== currentIndex);
            }
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

        // OYUN BITIYORSA: skoru nextLetters üzerinden hesapla (en güncel hali)
        const finalCorrect = nextLetters.filter((l) => l.status === "correct").length;
        const finalWrong = nextLetters.filter((l) => l.status === "wrong").length;

        const scoreObj = {
            correct: finalCorrect,
            wrong: finalWrong,
            total: QUESTIONS.length,
            name: savedName || playerName.trim() || "Anon",
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
                        const r = 170; // çember yarıçapı
                        const x = Math.cos(angle) * r;
                        const y = Math.sin(angle) * r;

                        return (
                            <div
                                key={l.char}
                                className={"letter " + (index === currentIndex ? "active " : "") + l.status}
                                style={{ "--tx": `${x}px`, "--ty": `${y}px`, transform: `translate(${x}px, ${y}px)` }}
                            >
                                {l.char}
                            </div>
                        );
                    })}

                        <div className="center">
                            <div className="nameLabel">İsim</div>

                            <input
                                className="nameInput"
                                placeholder="Adını yaz..."
                                value={playerName}
                                disabled={!!savedName}
                                onChange={(e) => setPlayerName(e.target.value)}
                            />

                            {!savedName && playerName.trim() !== "" && (
                                <button className="nameSaveBtn" onClick={() => setSavedName(playerName.trim())}>
                                    Kaydet
                                </button>
                            )}

                            {savedName && (
                                <button className="nameSaveBtn" onClick={() => setSavedName("")}>
                                    Değiştir
                                </button>
                            )}
                        </div>
                </div>
            </div>

                <div className={"card " + (feedback ? "shake " + feedback : "")}>

                <div className="score">
                    <span>Doğru: {correctCount}</span>
                    <span>Yanlış: {wrongCount}</span>
                    <span>Kalan: {remainingCount}</span>
                    </div>
                    {feedback && (
                        <div className={"spark " + feedback}>
                            ✦ ✦ ✦
                        </div>
                    )}
            </div>


                {lastScore && (
                    <div style={{ marginTop: "8px", fontSize: "14px" }}>
                        Son Skor ({lastScore.name}): {lastScore.correct} doğru / {lastScore.wrong} yanlış (Toplam: {lastScore.total})
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
                                placeholder="Cevabını yaz... (pass yazabilirsin)"
                                value={answerText}
                                onChange={(e) => setAnswerText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSubmit();
                                }}
                            />

                            <button className="answerBtn full" onClick={handleSubmit}>
                                Cevapla
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="summary">
                            <p><b>Oyun Özeti</b></p>
                            <p>Doğru: {correctCount}</p>
                            <p>Yanlış: {wrongCount}</p>
                            <p>Kalan: {remainingCount}</p>
                        </div>

                        <button className="answerBtn full" onClick={resetGame}>
                            Yeniden Başla
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
