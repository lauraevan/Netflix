/* GitHack works only when repository files are public.
   The Netflix repository is private; use an authenticated preview or local server.
   EvanPlayer is the existing FastAPI player. Host it separately and put its URL here.
   The browser-visible TMDB metadata key is inherited from the user's EvanPlayer repo.
   For a production deployment, replace client-side TMDB calls with a backend proxy. */
window.NETFLIX_CONFIG = Object.freeze({
  playerBaseUrl: "",
  tmdbApiKey: "439c478a771f35c05022f9feabcca01c"
});
