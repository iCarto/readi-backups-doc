/**
 * @see https://prettier.io/docs/configuration
 * @see https://prettier.io/docs/options
 * @type {import("prettier").Config}
 */
const config = {
    // Tengo dudas con si poner todas las opciones, esto hace claro  que las hemos revisado y decidido, o  dejar  las reglas más limpias. O incluso quitar todo lo que ya  está registrado en .editorconfig

    experimentalTernaries: false,

    // start | end
    experimentalOperatorPosition: "start",

    printWidth: 88,
    tabWidth: 4,
    useTabs: false,
    semi: true,
    singleQuote: false,

    // "as-needed" - Only add quotes around object properties where required.
    // "consistent" - If at least one property in an object requires quotes, quote all properties.
    // "preserve" - Respect the input use of quotes in object properties.
    // Tengo dudas con esta
    quoteProps: "as-needed",

    jsxSingleQuote: false,

    // "all" - Trailing commas wherever possible (including function parameters and calls). To run, JavaScript code formatted this way needs an engine that supports ES2017 (Node.js 8+ or a modern browser) or downlevel compilation. This also enables trailing commas in type parameters in TypeScript (supported since TypeScript 2.7 released in January 2018).
    // "es5" - Trailing commas where valid in ES5 (objects, arrays, etc.). Trailing commas in type parameters in TypeScript and Flow.
    // "none" - No trailing commas.
    // Tengo dudas con esta
    trailingComma: "es5",

    // Tengo dudas con esta
    bracketSpacing: false,

    // "preserve" - Keep as multi-line, if there is a newline between the opening brace and first property.
    // "collapse" - Fit to a single line when possible.
    // Tengo dudas con esta
    objectWrap: "preserve",

    bracketSameLine: false,

    // "always" - Always include parens. Example: (x) => x
    // "avoid" - Omit parens when possible. Example: x => x
    // Tengo dudas con esta
    arrowParens: "avoid",

    // rangeStart
    // rangeEnd
    // parser

    requirePragma: false,
    insertPragma: false,
    checkIgnorePragma: false,

    // "always" - Wrap prose if it exceeds the print width.
    // "never" - Un-wrap each block of prose into one line.
    // "preserve" - Do nothing, leave prose as-is. First available in v1.9.0
    // Tengo dudas con esta
    proseWrap: "preserve",

    // "css" - Respect the default value of CSS display property. For Handlebars treated same as strict.
    // "strict" - Whitespace (or the lack of it) around all tags is considered significant.
    // "ignore" - Whitespace (or the lack of it) around all tags is considered insignificant.
    // Tengo dudas con esta
    htmlWhitespaceSensitivity: "ignore",

    // vueIndentScriptAndStyle

    endOfLine: "lf",

    embeddedLanguageFormatting: "auto",

    singleAttributePerLine: false,

    overrides: [
        {
            files: "*.html",
            options: {
                printWidth: 100,
                tabWidth: 2,
            },
        },
        {
            files: "*.md",
            options: {
                tabWidth: 2,
            },
        },
    ],
};

export default config;
