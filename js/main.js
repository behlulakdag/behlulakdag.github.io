// Entry point: each feature lives in its own module and is started here.
import { initTheme } from "./theme.js";
import { initTerminal } from "./terminal.js";
import { initReveal } from "./reveal.js";

initTheme();
initTerminal();
initReveal();
