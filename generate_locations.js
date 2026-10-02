import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const locationsList = [
    "Plage naturiste", "Station spatiale internationale", "Sous-marin nucléaire",
    "Toilettes d'une discothèque", "Cabine d'essayage", "IKEA le samedi après-midi",
    "Tournoi de pétanque", "Réunion Tupperware", "Plateau de tournage porno",
    "Vaisseau extraterrestre", "EHPAD", "Cellule de prison", "Bouchon sur le périph",
    "Ascenseur en panne", "Cours de yoga naturiste", "Sommet de l'Everest",
    "Concert de Jul", "Salle d'attente chez le dentiste", "Club libertin",
    "Enterrement", "Banquet de mariage de l'ex", "Laboratoire secret",
    "Sous le lit", "Grotte préhistorique", "Plateau télé d'Hanouna",
    "Tribunal", "Garde à vue", "Camping des Flots Bleus",
    "Parc d'attractions abandonné", "Bateau pirate", "Tour Eiffel (au sommet)",
    "Catacombes de Paris", "Salon de coiffure afro", "Boutique érotique",
    "Taverne médiévale", "Hôpital psychiatrique", "Réunion d'Alcooliques Anonymes",
    "Bureau des impôts", "Confessionnal", "Tapis rouge de Cannes",
    "Concert de Métal", "Abattoir", "Casino de Las Vegas", "Toundra sibérienne",
    "Égouts de New York", "Convention Cosplay", "Refuge pour animaux",
    "Sous-marin nazi", "Plateforme pétrolière", "Base militaire",
    "Caserne de pompiers", "Foire à la saucisse", "Fête de l'Huma",
    "Dans une secte", "Congélateur géant", "Camion poubelle",
    "Montgolfière", "Sous l'océan (avec Bob)", "Maison hantée",
    "Bal des vampires", "Concours de Miss France", "Bunker anti-atomique",
    "Zoo (dans l'enclos des lions)", "Arène de gladiateurs", "Bordel clandestin",
    "Marché aux puces", "Usine nucléaire", "Messe de minuit",
    "Toilettes publiques", "Salon de massage", "Fosse septique",
    "Tournoi de e-sport", "Casting de télé-réalité", "Ferme aux crocodiles",
    "Bibliothèque silencieuse", "Train fantôme", "Soirée mousse",
    "Hôpital (salle d'opération)", "Dans un Uber bourré", "Asile d'Arkham"
];

const locations = locationsList.map((name, index) => {
    // Generate a deterministically random-looking image using picsum seeds based on the location name
    const seed = Buffer.from(name).toString('base64').substring(0, 8);
    return {
        id: index + 1,
        name: name,
        image: `https://picsum.photos/seed/${seed}/600/400` // Using picsum for realistic placeholder images
    };
});

const outputPath = path.join(__dirname, 'public', 'donde-estas', 'locations.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(locations, null, 2), 'utf-8');

console.log("locations.json généré avec 80 lieux dans public/donde-estas/locations.json");
