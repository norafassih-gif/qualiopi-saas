// Logo Google (4 couleurs officielles) en SVG inline — évite de dépendre
// d'une image externe pour un simple pictogramme réutilisé sur les pages
// login et signup.
export function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.9 5.1 29.7 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.7-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.9 5.1 29.7 3 24 3 15.9 3 8.9 7.6 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 45c5.6 0 10.7-2.1 14.5-5.6l-6.7-5.7C29.6 35.6 26.9 36.5 24 36.5c-5.2 0-9.6-3.3-11.3-7.9l-6.6 5.1C8.9 40.4 15.9 45 24 45z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.7 5.7C41.6 36 45 30.6 45 24c0-1.4-.1-2.7-.4-3.5z"
      />
    </svg>
  );
}
