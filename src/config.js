// import.meta no existe bajo Karma/webpack: se protege con try/catch.
let env = {};
try {
  env = import.meta.env ?? {};
} catch {
  env = {};
}

export const API_URL = (env.VITE_API_URL ?? "http://localhost:8080").replace(/\/$/, "");
export const USE_MOCK = String(env.VITE_USE_MOCK ?? "true") === "true";
