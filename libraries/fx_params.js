////// FXHASH PARAMS //////
// we can use $fx.getParam("param_id") to get the selected param in the code

$fx.params([
  {
    id: "effect_seed",
    name: "seed",
    type: "number",
    default: 0,
    update: "page-reload",
    options: {
      min: 0,
      max: 1000,
      step: 1,
    },
  },
  {
    id: "signal",
    name: "signal",
    type: "string",
    default: "",
    update: "code-driven",
    options: {
      minLength: 0,
      maxLength: 2000, // initially we had it at 1900
    }
  },
  {
    id: "format",
    name: "format",
    type: "select",
    default: "square",
    update: "code-driven",
    options: {
      options: ["square", "portrait", "landscape"],
    }
  },
  {
    id: "effect_era",
    name: "era",
    type: "select",
    default: "'80s",
    update: "code-driven",
    options: {
      options: ["'80s", "'90s"],
    }
  },
  {
    id: "border_type",
    name: "border",
    type: "select",
    default: "none",
    update: "code-driven",
    options: {
      options: ["none", "thin", "thick"],
    }
  },
  {
    id: "quality",
    name: "quality",
    type: "number",
    default: 10,
    update: "code-driven",
    options: {
      min: 1,
      max: 10,
      step: 1,
    },
  },
  {
    id: "quant_f",
    name: "quantization",
    type: "number",
    default: 1,
    update: "code-driven",
    options: {
      min: 1,
      max: 10,
      step: 1,
    },
  },
  /*{
    id: "effect_primary",
    name: "effect primary",
    type: "select",
    default: "lo-fi",
    update: "page-reload",
    options: {
      options: ["mono", "hi-fi", "noisy", "corrupted", "abstract", "lo-fi"],
    }
  },
  {
    id: "effect_secondary",
    name: "effect secondary",
    type: "select",
    default: "mono",
    update: "page-reload",
    options: {
      options: ["mono", "hi-fi", "noisy", "corrupted", "abstract", "lo-fi"],
    }
  },
  {
    id: "invert_input",
    name: "invert",
    type: "boolean",
    default: false,
    update: "page-reload",
  },*/
  {
    id: "brightness",
    name: "brightness",
    type: "number",
    default: 1.0,
    update: "page-reload",
    options: {
      min: 0,
      max: 2,
      step: 0.05,
    },
  },
  {
    id: "contrast",
    name: "contrast",
    type: "number",
    default: 0.50,
    update: "page-reload",
    options: {
      min: 0,
      max: 1,
      step: 0.05,
    },
  },
  {
    id: "light_treshold",
    name: "light treshold",
    type: "number",
    default: 50,
    update: "page-reload",
    options: {
      min: 0,
      max: 100,
      step: 5,
    },
  },
  {
    id: "dark_treshold",
    name: "dark treshold",
    type: "number",
    default: 30,
    update: "page-reload",
    options: {
      min: 0,
      max: 100,
      step: 5,
    },
  },
  /*{
    id: "alpha_brightness",
    name: "alpha brightness",
    type: "number",
    default: 50,
    update: "page-reload",
    options: {
      min: 0,
      max: 100,
      step: 5,
    },
  },*/
  {
    id: "title",
    name: "title",
    type: "string",
    default: "untitled",
    update: "page-reload",
    options: {
      minLength: 0,
      maxLength: 100,
    }
  },

]);


// maximum length for a string param on fxhash (July 2023)

// 1. maxLength: 3900 in fxlens (Chrome)

// 2. maxLength: 1900 while minting the token on fxhash
//    413 ERROR - The request could not be satisfied.

// 3. maxLength: 900 is the max in fxhash sandbox
//    Uncaught (in promise) TypeError: Failed to construct 'URL': Invalid URL at worker.js:14:15

// who? - 8k character limit on urls served via cloudfront - that's consistent with point 2. for you, each string param character gets encoded as 4 hex url param characters
// ciphrd - cloudfront has a 20480 bytes request limit (each string character is 2 bytes - 4 hex values, 16 bits)