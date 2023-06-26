//////FXHASH PARAMS//////
// we can use $fx.getParam("param_id") to get the selected param in the code

$fx.params([
    {
      id: "effect_name",
      name: "Effect stack",
      type: "select",
      default: "corrupted",
      options: {
        options: ["mono", "hi-fi", "noisy", "corrupted", "lo-fi"],
      }
    },
  ]);

