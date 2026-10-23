/* Loaded synchronously in <head> so the correct theme is applied before first paint (no flash). */
(function () {
    var theme = 'light';
    try {
        theme = localStorage.getItem('fg_theme') ||
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    } catch (e) { /* storage unavailable: keep light */ }
    document.documentElement.setAttribute('data-theme', theme);
})();
