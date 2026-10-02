const { useState, useEffect, useRef } = React;

const DEFAULT_PLAYERS = [
    { id: 1, name: "Bernard", avatar: "👨‍🦰", score: 0 },
    { id: 2, name: "Brigitte", avatar: "👩‍🦱", score: 0 },
    { id: 3, name: "Roger", avatar: "👴", score: 0 },
    { id: 4, name: "Mireille", avatar: "👵", score: 0 },
    { id: 5, name: "Gérard", avatar: "👨‍🦳", score: 0 },
    { id: 6, name: "Chantal", avatar: "👱‍♀️", score: 0 },
    { id: 7, name: "Raymond", avatar: "🧔", score: 0 },
    { id: 8, name: "Cunégonde", avatar: "🧓", score: 0 },
];

function App() {
    const [gameState, setGameState] = useState('LOBBY'); // LOBBY, PASS, ROLE, QUESTIONS, VOTE, VERDICT, RESULT
    const [players, setPlayers] = useState(DEFAULT_PLAYERS.slice(0, 4));
    const [locations, setLocations] = useState([]);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [spyId, setSpyId] = useState(null);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [apiResult, setApiResult] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch('locations.json')
            .then(res => res.json())
            .then(data => setLocations(data))
            .catch(err => console.error("Erreur chargement lieux:", err));
    }, []);

    const startGame = () => {
        if (players.length < 3) return alert("Il faut au moins 3 joueurs !");
        
        // Pick a random location
        const randomLoc = locations[Math.floor(Math.random() * locations.length)];
        setCurrentLocation(randomLoc);

        // Pick a spy
        const randomSpyIndex = Math.floor(Math.random() * players.length);
        setSpyId(players[randomSpyIndex].id);

        setCurrentPlayerIndex(0);
        setGameState('PASS');
    };

    const nextPlayer = () => {
        if (currentPlayerIndex < players.length - 1) {
            setCurrentPlayerIndex(currentPlayerIndex + 1);
            setGameState('PASS');
        } else {
            setGameState('QUESTIONS');
        }
    };

    const submitSpyGuess = async (guess) => {
        setLoading(true);
        try {
            const res = await fetch('/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    vrai_lieu: currentLocation.name,
                    supposition_espion: guess
                })
            });
            const data = await res.json();
            setApiResult(data);
            
            // Score update
            let newPlayers = [...players];
            let spy = newPlayers.find(p => p.id === spyId);
            if (data.success) {
                spy.score += 1; // Bonus IA
            }
            setPlayers(newPlayers);
            setGameState('RESULT');
        } catch (error) {
            console.error(error);
            alert("Erreur de connexion à l'arbitre IA.");
        } finally {
            setLoading(false);
        }
    };

    const handleVote = (suspectId) => {
        let newPlayers = [...players];
        let spy = newPlayers.find(p => p.id === spyId);
        
        if (suspectId === spyId) {
            // Innocents win this round
            newPlayers.forEach(p => {
                if (p.id !== spyId) p.score += 1;
            });
        } else {
            // Spy wins this round
            spy.score += 2;
        }
        
        setPlayers(newPlayers);
        setGameState('VERDICT');
    };

    return (
        <div className="container mx-auto p-4 max-w-md min-h-screen flex flex-col justify-center animate-pop">
            {gameState === 'LOBBY' && <Lobby players={players} setPlayers={setPlayers} startGame={startGame} />}
            {gameState === 'PASS' && <PassScreen player={players[currentPlayerIndex]} onReveal={() => setGameState('ROLE')} />}
            {gameState === 'ROLE' && <RoleScreen 
                player={players[currentPlayerIndex]} 
                isSpy={players[currentPlayerIndex].id === spyId} 
                location={currentLocation} 
                onHide={nextPlayer} 
            />}
            {gameState === 'QUESTIONS' && <QuestionsScreen playerCount={players.length} onNext={() => setGameState('VOTE')} />}
            {gameState === 'VOTE' && <VoteScreen players={players} onVote={handleVote} />}
            {gameState === 'VERDICT' && <VerdictScreen onGuess={submitSpyGuess} loading={loading} />}
            {gameState === 'RESULT' && <ResultScreen result={apiResult} location={currentLocation} players={players} onNextRound={startGame} />}
        </div>
    );
}

function Lobby({ players, setPlayers, startGame }) {
    const addPlayer = () => {
        if (players.length < 8) {
            setPlayers([...players, DEFAULT_PLAYERS[players.length]]);
        }
    };
    const removePlayer = () => {
        if (players.length > 3) {
            setPlayers(players.slice(0, -1));
        }
    };

    const updatePlayerName = (index, newName) => {
        const newPlayers = [...players];
        newPlayers[index].name = newName;
        setPlayers(newPlayers);
    };

    const updateAvatar = async (index) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            const video = document.createElement('video');
            video.srcObject = stream;
            video.play();
            
            // Simple logic: wait a second, draw on canvas, get data URL
            setTimeout(() => {
                const canvas = document.createElement('canvas');
                canvas.width = 100;
                canvas.height = 100;
                const ctx = canvas.getContext('2d');
                // Calculate square crop
                const size = Math.min(video.videoWidth, video.videoHeight);
                const x = (video.videoWidth - size) / 2;
                const y = (video.videoHeight - size) / 2;
                ctx.drawImage(video, x, y, size, size, 0, 0, 100, 100);
                const dataUrl = canvas.toDataURL('image/jpeg');
                
                stream.getTracks().forEach(track => track.stop()); // stop webcam
                
                const newPlayers = [...players];
                newPlayers[index].avatar = dataUrl;
                setPlayers(newPlayers);
            }, 1000);
            
            alert("Souriez ! Capture dans 1 seconde...");

        } catch (err) {
            alert("Erreur d'accès à la caméra.");
            console.error(err);
        }
    };

    return (
        <div className="text-center space-y-8">
            <h1 className="text-5xl font-bold text-glow-cyan text-neon-cyan mb-2">¿dónde estás?</h1>
            <p className="text-gray-400 italic">Party Game - Mensonges & Néons</p>
            
            <div className="flex justify-center items-center space-x-4 my-6">
                <button onClick={removePlayer} className="w-12 h-12 rounded-full border-2 border-neon-pink text-neon-pink text-2xl box-glow-pink hover:bg-neon-pink hover:text-white transition">-</button>
                <span className="text-2xl font-bold">{players.length} Joueurs</span>
                <button onClick={addPlayer} className="w-12 h-12 rounded-full border-2 border-neon-cyan text-neon-cyan text-2xl box-glow-cyan hover:bg-neon-cyan hover:text-black transition">+</button>
            </div>

            <div className="space-y-3 text-left bg-gray-900 p-4 rounded-xl">
                {players.map((p, i) => (
                    <div key={p.id} className="flex items-center space-x-3 bg-gray-800 p-2 rounded-lg">
                        <button 
                            onClick={() => updateAvatar(i)}
                            className="w-12 h-12 text-3xl bg-gray-700 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 relative group"
                            title="Changer d'avatar (Webcam)"
                        >
                            {p.avatar.startsWith('data:') ? <img src={p.avatar} className="w-full h-full object-cover" /> : p.avatar}
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 text-xs">📷</div>
                        </button>
                        <input 
                            value={p.name} 
                            onChange={(e) => updatePlayerName(i, e.target.value)}
                            className="bg-transparent border-b border-gray-600 focus:border-neon-cyan outline-none text-lg flex-grow font-bold text-white px-1"
                        />
                    </div>
                ))}
            </div>

            <button onClick={startGame} className="w-full py-4 bg-neon-pink text-white font-bold text-xl rounded-xl box-glow-pink uppercase tracking-widest mt-8 hover:scale-105 transition">
                Lancer la partie
            </button>
        </div>
    );
}

function PassScreen({ player, onReveal }) {
    return (
        <div className="text-center space-y-12">
            <h2 className="text-3xl text-gray-300">Passe le téléphone à</h2>
            <div className="text-glow-cyan">
                <div className="text-7xl mb-4">
                    {player.avatar.startsWith('data:') ? <img src={player.avatar} className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-neon-cyan box-glow-cyan" /> : player.avatar}
                </div>
                <h1 className="text-5xl font-bold text-neon-cyan">{player.name}</h1>
            </div>
            
            <button onClick={onReveal} className="w-full py-5 bg-neon-cyan text-black font-bold text-xl rounded-xl box-glow-cyan mt-12 hover:scale-105 transition">
                C'est moi, révéler mon rôle
            </button>
        </div>
    );
}

function RoleScreen({ player, isSpy, location, onHide }) {
    return (
        <div className="text-center flex flex-col h-[80vh]">
            <div className="flex-grow flex flex-col items-center justify-center">
                {isSpy ? (
                    <div className="space-y-6 fog-bg p-8 rounded-2xl border border-gray-700 w-full">
                        <h1 className="text-6xl">🌫️</h1>
                        <h2 className="text-3xl font-bold text-red-500 text-glow-pink">ESPION</h2>
                        <p className="text-xl text-gray-300">Oups... on dirait que t'es dans le brouillard ! Essaie de deviner où les autres se trouvent.</p>
                    </div>
                ) : (
                    <div className="space-y-6 w-full">
                        <h2 className="text-2xl text-gray-400">Nous sommes ici :</h2>
                        <div className="relative rounded-2xl overflow-hidden border-2 border-neon-pink box-glow-pink">
                            <img src={location.image} alt="Location" className="w-full h-64 object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent flex items-end p-4">
                                <h1 className="text-3xl font-bold text-white text-glow-pink">{location.name}</h1>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            <button onClick={onHide} className="w-full py-5 bg-gray-800 text-white border border-gray-600 font-bold text-xl rounded-xl hover:bg-gray-700 transition">
                Cacher l'écran
            </button>
        </div>
    );
}

function QuestionsScreen({ playerCount, onNext }) {
    return (
        <div className="text-center space-y-8">
            <h2 className="text-4xl font-bold text-neon-cyan text-glow-cyan">Phase de Questions</h2>
            <div className="text-8xl my-8">⏳</div>
            <div className="bg-gray-900 p-6 rounded-xl border border-neon-cyan box-glow-cyan">
                <p className="text-xl leading-relaxed">
                    C'est parti l'équipe ! Posez-vous <strong className="text-neon-pink text-3xl">{playerCount * 2}</strong> questions en tournant.
                </p>
                <p className="text-gray-400 mt-4">Soyez subtils... L'espion écoute !</p>
            </div>
            
            <button onClick={onNext} className="w-full py-5 bg-neon-cyan text-black font-bold text-xl rounded-xl box-glow-cyan mt-12 hover:scale-105 transition">
                ¡Ya está! On passe au verdict
            </button>
        </div>
    );
}

function VoteScreen({ players, onVote }) {
    return (
        <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold text-neon-pink text-glow-pink mb-2">L'heure du verdict !</h2>
            <p className="text-gray-300">À la fin du décompte (3..2..1), pointez le coupable. Qui a reçu la majorité des votes ?</p>
            
            <div className="grid grid-cols-2 gap-4 mt-8">
                {players.map(p => (
                    <button 
                        key={p.id}
                        onClick={() => onVote(p.id)}
                        className="bg-gray-800 hover:bg-gray-700 p-4 rounded-xl flex flex-col items-center justify-center space-y-2 border border-gray-600 hover:border-neon-pink transition"
                    >
                        <div className="text-5xl">
                            {p.avatar.startsWith('data:') ? <img src={p.avatar} className="w-16 h-16 rounded-full object-cover" /> : p.avatar}
                        </div>
                        <span className="font-bold text-lg">{p.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

function VerdictScreen({ onGuess, loading }) {
    const [guess, setGuess] = useState('');

    return (
        <div className="text-center space-y-8">
            <h2 className="text-3xl font-bold text-red-500 text-glow-pink">Dernière chance !</h2>
            <p className="text-xl">Espion, à toi de jouer. Où étions-nous ?</p>
            
            <input 
                type="text" 
                value={guess}
                onChange={e => setGuess(e.target.value)}
                placeholder="Je pense qu'on est à..."
                className="w-full bg-gray-900 border-2 border-neon-cyan rounded-xl p-4 text-xl text-center text-white focus:outline-none box-glow-cyan"
            />
            
            {loading ? (
                <div className="py-8"><div className="loader"></div></div>
            ) : (
                <button 
                    onClick={() => onGuess(guess)} 
                    disabled={!guess.trim()}
                    className="w-full py-5 bg-neon-cyan text-black font-bold text-xl rounded-xl box-glow-cyan hover:scale-105 transition disabled:opacity-50 disabled:hover:scale-100"
                >
                    Soumettre à l'arbitre IA
                </button>
            )}
        </div>
    );
}

function ResultScreen({ result, location, players, onNextRound }) {
    return (
        <div className="text-center space-y-8">
            <h2 className="text-4xl font-bold text-neon-cyan text-glow-cyan">Le Verdict de l'IA</h2>
            
            <div className="relative rounded-2xl overflow-hidden border-2 border-neon-cyan box-glow-cyan">
                <img src={location.image} alt="Location" className="w-full h-48 object-cover opacity-50" />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black bg-opacity-60 text-center">
                    <p className="text-2xl font-bold mb-4">{result.success ? "✅ L'espion a trouvé !" : "❌ L'espion a échoué !"}</p>
                    <p className="text-lg italic">"{result.message}"</p>
                </div>
            </div>

            <div className="bg-gray-900 p-4 rounded-xl">
                <h3 className="text-2xl font-bold mb-4 text-neon-pink">Scores</h3>
                <div className="space-y-2">
                    {[...players].sort((a, b) => b.score - a.score).map(p => (
                        <div key={p.id} className="flex justify-between items-center bg-gray-800 p-2 rounded">
                            <div className="flex items-center space-x-2">
                                <span className="text-2xl">{p.avatar.startsWith('data:') ? <img src={p.avatar} className="w-8 h-8 rounded-full object-cover" /> : p.avatar}</span>
                                <span className="font-bold">{p.name}</span>
                            </div>
                            <span className="font-bold text-neon-cyan">{p.score} pts</span>
                        </div>
                    ))}
                </div>
            </div>
            
            <button onClick={onNextRound} className="w-full py-5 bg-neon-pink text-white font-bold text-xl rounded-xl box-glow-pink hover:scale-105 transition">
                Manche suivante
            </button>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
