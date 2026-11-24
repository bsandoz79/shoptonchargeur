/**
 * Logo de Shop ton chargeur : le monogramme « STC », espacé, en titane brossé. Le nom complet reste lu par les
 * lecteurs d'écran. Les icônes du site (public/*.png) reprennent le monogramme sur fond noir.
 */
export function Logo() {
  return (
    <>
      <span aria-hidden="true" className="monogramme">STC</span>
      <span className="sr-only">Shop ton chargeur</span>
    </>
  );
}
