

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false,
  "prerender": true
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.Bi3vIdPf.js","_app/immutable/chunks/D2llogEs.js","_app/immutable/chunks/ClkHHVPk.js","_app/immutable/chunks/Dmi8KfJh.js","_app/immutable/chunks/Ba17PWJD.js"];
export const stylesheets = ["_app/immutable/assets/0.tKc34nKd.css"];
export const fonts = [];
