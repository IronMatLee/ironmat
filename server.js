import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Servir les fichiers statiques de l'application (Vite génère dans 'dist', mais on peut aussi servir 'public' en dev si besoin)
app.use(express.static(path.join(__dirname, 'dist')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Initialisation de l'IA Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/api/gemini', async (req, res) => {
    try {
        const { vrai_lieu, supposition_espion } = req.body;

        if (!vrai_lieu || !supposition_espion) {
            return res.status(400).json({ error: 'vrai_lieu et supposition_espion sont requis.' });
        }

        const prompt = `Tu es l'arbitre cynique et drôle du jeu de société '¿dónde estás?'. Le lieu secret de la manche était : [${vrai_lieu}]. L'espion a tenté de deviner en disant : [${supposition_espion}]. Analyse sémantiquement si le joueur a trouvé l'idée générale du lieu (tolère les synonymes et approximations proches). 
        Renvoie UNIQUEMENT un objet JSON avec deux clés :
        1. 'success' : un booléen (true s'il a trouvé, false sinon).
        2. 'message' : une courte phrase très drôle annonçant le résultat au joueur, validant son intuition ou se moquant gentiment de lui, tout en révélant le vrai lieu.
        IMPORTANT: Ne renvoie QUE l'objet JSON, sans formatage markdown ni rien d'autre.`;

        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        const textResponse = response.text;
        
        try {
            const parsed = JSON.parse(textResponse);
            res.json(parsed);
        } catch (e) {
            console.error("Erreur de parsing JSON de la réponse Gemini :", textResponse);
            res.status(500).json({ error: 'Erreur lors de la communication avec l\'IA.' });
        }

    } catch (error) {
        console.error("Erreur de l'API Gemini:", error);
        res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
});

// Pour toutes les autres requêtes, on renvoie l'index principal (SPA / statique)
app.get('*', (req, res) => {
    // Si on veut que ça marche sans build, on peut aussi renvoyer l'index.html de la racine
    // S'il existe un index.html dans dist, on le renvoie :
    res.sendFile(path.join(__dirname, 'dist', 'index.html'), (err) => {
        if(err) {
            res.sendFile(path.join(__dirname, 'index.html'));
        }
    });
});

app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});
