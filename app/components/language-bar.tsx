export function LanguageBar() {
  return (
    <div className="language-bar" aria-label="Idiomas">
      <span className="language active">Español</span>
      <span className="language pending" title="Traducción pendiente">English</span>
      <span className="language pending" title="Traducción pendiente">Deutsch</span>
      <span className="language pending" title="Traducción pendiente">Français</span>
    </div>
  );
}
