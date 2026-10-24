import { realpathSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { isAbsolute, join, relative, resolve } from "node:path";

export interface Config {
  notesFolder: string | null;
  notesProblem: string | null;
  locale: string | null;
  localeProblem: string | null;
}

// Claude Code leaves "${user_config.x}" untouched when the option is not set.
function unsetValue(v: string | undefined): boolean {
  return v === undefined || v.trim() === "" || v.includes("${");
}

function expandHome(p: string): string {
  return p === "~" || p.startsWith("~/") ? join(homedir(), p.slice(1)) : p;
}

function real(p: string): string {
  try {
    return realpathSync(p);
  } catch {
    return resolve(p);
  }
}

export function isInside(child: string, parent: string): boolean {
  const rel = relative(real(parent), real(child));
  return rel === "" || (!rel.startsWith("..") && !isAbsolute(rel));
}

// BCP 47 shape check plus a round trip through Intl, which rejects unknown subtags.
export function validLocale(tag: string): boolean {
  if (!/^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$/.test(tag)) return false;
  try {
    return Intl.getCanonicalLocales(tag).length === 1;
  } catch {
    return false;
  }
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const cfg: Config = { notesFolder: null, notesProblem: null, locale: null, localeProblem: null };

  const rawLocale = env.EM_TOOLS_LOCALE;
  if (unsetValue(rawLocale)) cfg.localeProblem = "Locale is not set. Set it in the em-tools plugin settings, for example en-GB.";
  else if (!validLocale(rawLocale!.trim())) cfg.localeProblem = `Locale "${rawLocale}" is not a valid BCP 47 tag such as en-GB or en-US.`;
  else cfg.locale = Intl.getCanonicalLocales(rawLocale!.trim())[0];

  const rawFolder = env.EM_TOOLS_NOTES_FOLDER;
  if (unsetValue(rawFolder)) {
    cfg.notesProblem = "Notes folder is not set. Pick one in the em-tools plugin settings.";
    return cfg;
  }
  const folder = resolve(expandHome(rawFolder!.trim()));
  const forbidden = [
    env.EM_TOOLS_PLUGIN_DATA,
    env.EM_TOOLS_PLUGIN_ROOT,
    join(homedir(), ".claude", "plugins"),
  ].filter((p): p is string => !unsetValue(p));
  for (const f of forbidden) {
    if (isInside(folder, f) || isInside(f, folder)) {
      cfg.notesProblem = `Notes folder ${folder} overlaps the plugin's own folder ${f}, which can be wiped on uninstall or update. Pick a folder outside it.`;
      return cfg;
    }
  }
  if (!existsSync(folder)) {
    cfg.notesProblem = `Notes folder ${folder} does not exist. Create it, or pick another folder in the plugin settings.`;
    return cfg;
  }
  cfg.notesFolder = real(folder);
  return cfg;
}
