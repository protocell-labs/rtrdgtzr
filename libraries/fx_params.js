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
      max: 999,
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
      maxLength: 2000,
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
    id: "light_threshold",
    name: "light threshold",
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
    id: "dark_threshold",
    name: "dark threshold",
    type: "number",
    default: 30,
    update: "page-reload",
    options: {
      min: 0,
      max: 100,
      step: 5,
    },
  },
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