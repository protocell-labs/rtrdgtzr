////// FXHASH PARAMS //////
// we can use $fx.getParam("param_id") to get the selected param in the code

$fx.params([
  {
    id: "signal",
    name: "Signal",
    type: "string",
    default: "",
    update: "code-driven",
    options: {
      minLength: 0,
      maxLength: 1900, // 1900
    }
  },
  {
    id: "format",
    name: "Format",
    type: "select",
    default: "square",
    update: "code-driven",
    options: {
      options: ["square", "portrait", "landscape"],
    }
  },
  {
    id: "quality",
    name: "Quality",
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
    name: "Quantization",
    type: "number",
    default: 1,
    update: "code-driven",
    options: {
      min: 1,
      max: 10,
      step: 1,
    },
  },
  {
    id: "effect_main",
    name: "Effect main",
    type: "select",
    default: "hi-fi",
    update: "page-reload",
    options: {
      options: ["mono", "hi-fi", "noisy", "corrupted", "lo-fi"],
    }
  },
  {
    id: "effect_background",
    name: "Effect background",
    type: "select",
    default: "lo-fi",
    update: "page-reload",
    options: {
      options: ["mono", "hi-fi", "noisy", "corrupted", "lo-fi"],
    }
  },
  {
    id: "effect_era",
    name: "Era",
    type: "select",
    default: "80-ties",
    update: "code-driven",
    options: {
      options: ["'80s", "'90s"],
    }
  },
  {
    id: "border_type",
    name: "Border",
    type: "select",
    default: "none",
    update: "code-driven",
    options: {
      options: ["none", "thin", "thick"],
    }
  },
  {
    id: "invert_input",
    name: "Invert",
    type: "boolean",
    default: false,
    update: "page-reload",
  },
  {
    id: "brightness",
    name: "Brightness",
    type: "number",
    default: "1.0",
    update: "page-reload",
    options: {
      min: 0,
      max: 2,
      step: 0.05,
    },
  },
  {
    id: "contrast",
    name: "Contrast",
    type: "number",
    default: "0.50",
    update: "page-reload",
    options: {
      min: 0,
      max: 1,
      step: 0.05,
    },
  },
  {
    id: "light_treshold",
    name: "Light treshold",
    type: "number",
    default: "50",
    update: "page-reload",
    options: {
      min: 0,
      max: 100,
      step: 5,
    },
  },
  {
    id: "dark_treshold",
    name: "Dark treshold",
    type: "number",
    default: "30",
    update: "page-reload",
    options: {
      min: 0,
      max: 100,
      step: 5,
    },
  },
  {
    id: "alpha_brightness",
    name: "Alpha brightness",
    type: "number",
    default: "50",
    update: "page-reload",
    options: {
      min: 0,
      max: 100,
      step: 5,
    },
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