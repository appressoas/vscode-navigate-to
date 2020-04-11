import PythonParser from "./PythonParser";
import JavaScriptParser from "./JavaScriptParser";

export const PARSERS = new Map<string, any>();
PARSERS.set('.js', JavaScriptParser);
PARSERS.set('.jsx', JavaScriptParser);
PARSERS.set('.py', PythonParser);

export const DISTINCT_PARSER_EXTENSIONS = Array.from(new Set(Array.from(PARSERS.keys())));