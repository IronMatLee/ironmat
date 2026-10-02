import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    {
      // Ce petit plugin fait le même travail qu'un .htaccess pour les dossiers
      name: 'resolve-directory-index',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Si l'URL demandée se termine par un slash (ex: /course-lecture/) et n'est pas l'accueil
          if (req.url.endsWith('/') && req.url !== '/') {
            // On dit à Vite de chercher le fichier index.html à l'intérieur
            req.url = req.url + 'index.html';
          }
          next();
        });
      }
    }
  ]
});
