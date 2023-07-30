////// COLLECTION OF FUNCTIONS AND EFFECTS FOR IMAGE MANIPULATION AND GLITCHING //////
// by @LukaPiskorec, 2023




////// INFO //////


// print banner and other info to console at the beginning
function infoToConsole() {

  console.log(banner_txt);
}




////// CAPTURE //////


// uses gif.js library to export individual frames as gif animation
// from: https://github.com/jnordberg/gif.js
function setupGif() {
  gif = new GIF({
    workers: 2,
    quality: 10, // pixel sample interval, lower is better
    workerScript: 'libraries/gif.worker.js',
    width: input_img.width + output_border[0],
    height: input_img.height + output_border[1]
  });

  const uuid = parseInt(Math.random() * 10000000);

  gif.on('finished', function (blob) {
    print('Finished creating gif')
    rendering = false;
    window.open(URL.createObjectURL(blob));
    saveAs(blob, `retro_digitizer_${effects_main_name}_anim_${uuid}.gif`);
    setupGif();
  });
}




////// EFFECT STACKS //////


// sets global data for the effect stack
function setEffectData(effects_stack_name) {

  // initialize a data object which will store all the parameters
  let data = {};

  // settings taken from params are defined here
  data["new_brightness"] = $fx.getParam("brightness");
  data["contrast"] = $fx.getParam("contrast");
  data["mask_contrast"] = clamp(data["contrast"] * 1.2, 0, 1); // 20% larger than contrast, clamped between 0 and 1
  data["light_treshold"] = $fx.getParam("light_treshold");
  data["dark_treshold"] = $fx.getParam("dark_treshold");
  data["alpha_brightness"] = $fx.getParam("alpha_brightness");
  data["effect_era"] = $fx.getParam("effect_era");

  data["contrast_delta"] = animation_params["contrast t1"]; // values from this list will be added to the contrast for each frame
  data["brightness_delta"] = animation_params["brightness t1"]; // values from this list will be added to the brightness for each frame


  // settings defined under effect stacks are defined here
  switch(effects_stack_name) {

    case "mono":

      data["nr_of_levels"] = 1;

      if (gene() < 0.25) {
        data["rand_dither_key_1"] = gene_pick_key(extreme_dither_params_json);
        data["dither_params_1"] = extreme_dither_params_json[ data["rand_dither_key_1"] ];
      } else {
        data["rand_dither_key_1"] = gene_pick_key(dither_params_json);
        data["dither_params_1"] = dither_params_json[ data["rand_dither_key_1"] ];
      }

      if (gene() < 0.25) {
        data["rand_dither_key_2"] = gene_pick_key(extreme_dither_params_json);
        data["dither_params_2"] = extreme_dither_params_json[ data["rand_dither_key_2"] ];
      } else {
        data["rand_dither_key_2"] = gene_pick_key(dither_params_json);
        data["dither_params_2"] = dither_params_json[ data["rand_dither_key_2"] ];
      }

      if (gene() < 0.25) {
        data["rand_dither_key_3"] = gene_pick_key(extreme_dither_params_json);
        data["dither_params_3"] = extreme_dither_params_json[ data["rand_dither_key_3"] ];
      } else {
        data["rand_dither_key_3"] = gene_pick_key(dither_params_json);
        data["dither_params_3"] = dither_params_json[ data["rand_dither_key_3"] ];
      }

      data["pix_scaling"] = 2.0;
      data["pix_scaling_dark"] = 2.0;
      data["layer_shift"] = 4;
      data["dark_treshold"] = 20;
      data["invert_mask"] = false;

      if (gene() < 0.25) {
        data["tint_palette_key_1"] = "white";
        data["tint_palette_1"] = three_bit_palette[ data["tint_palette_key_1"] ];
      } else {
        data["tint_palette_key_1"] = gene_pick_key(three_bit_palette);
        data["tint_palette_1"] = three_bit_palette[ data["tint_palette_key_1"] ];
      }

      data["delta_factor"] = 0.5; // scaling animation effects
      data["chosen_effect_function"] = applyMonoEffect;

      break;

    case "hi-fi":

      data["nr_of_levels"] = 1;

      if (gene() < 0.25) {
        data["rand_dither_key_1"] = gene_pick_key(extreme_dither_params_json);
        data["dither_params_1"] = extreme_dither_params_json[ data["rand_dither_key_1"] ];
      } else {
        data["rand_dither_key_1"] = gene_pick_key(dither_params_json);
        data["dither_params_1"] = dither_params_json[ data["rand_dither_key_1"] ];
      }

      if (gene() < 0.25) {
        data["rand_dither_key_2"] = gene_pick_key(extreme_dither_params_json);
        data["dither_params_2"] = extreme_dither_params_json[ data["rand_dither_key_2"] ];
      } else {
        data["rand_dither_key_2"] = gene_pick_key(dither_params_json);
        data["dither_params_2"] = dither_params_json[ data["rand_dither_key_2"] ];
      }

      if (gene() < 0.25) {
        data["rand_dither_key_3"] = gene_pick_key(extreme_dither_params_json);
        data["dither_params_3"] = extreme_dither_params_json[ data["rand_dither_key_3"] ];
      } else {
        data["rand_dither_key_3"] = gene_pick_key(dither_params_json);
        data["dither_params_3"] = dither_params_json[ data["rand_dither_key_3"] ];
      }

      data["pix_scaling"] = 2.0;
      data["pix_scaling_dark"] = 2.0;
      data["layer_shift"] = 4;
      data["invert_mask"] = false;

      data["tint_palette_key_1"] = gene_pick_key(three_bit_palette);
      data["tint_palette_key_2"] = gene_pick_key(three_bit_palette);
      data["tint_palette_key_3"] = gene_pick_key(three_bit_palette);
      data["tint_palette_1"] = three_bit_palette[ data["tint_palette_key_1"] ];
      data["tint_palette_2"] = three_bit_palette[ data["tint_palette_key_2"] ];
      data["tint_palette_3"] = three_bit_palette[ data["tint_palette_key_3"] ];

      data["delta_factor"] = 0.5; // scaling animation effects
      data["chosen_effect_function"] = applyHiFiEffect;

      break;

    case "noisy":

      data["blackValue"] = 10;
      data["brigthnessValue"] = 50;
      data["whiteValue"] = 70;

      data["sorting_mode"] = gene_rand_int(0, 3); // 0, 1, 2
      data["sorting_type"] = gene_rand_int(0, 2); // 0, 1
      data["sorting_order"] = gene_rand_int(0, 4); // 0, 1, 2, 3
      data["color_noise_density"] = gene() < 0.35 ? 50 : 5;
      data["rand_color_bias_key"] = gene_pick_key(color_bias_palette);
      data["color_noise_bias"] = color_bias_palette[ data["rand_color_bias_key"] ];
      data["color_noise_variation"] = 10000;

      data["nr_of_levels"] = 1;

      if (gene() < 0.25) {
        data["rand_dither_key_1"] = gene_pick_key(extreme_dither_params_json);
        data["dither_params_1"] = extreme_dither_params_json[ data["rand_dither_key_1"] ];
      } else {
        data["rand_dither_key_1"] = gene_pick_key(dither_params_json);
        data["dither_params_1"] = dither_params_json[ data["rand_dither_key_1"] ];
      }

      if (gene() < 0.25) {
        data["rand_dither_key_2"] = gene_pick_key(extreme_dither_params_json);
        data["dither_params_2"] = extreme_dither_params_json[ data["rand_dither_key_2"] ];
      } else {
        data["rand_dither_key_2"] = gene_pick_key(dither_params_json);
        data["dither_params_2"] = dither_params_json[ data["rand_dither_key_2"] ];
      }

      data["pix_scaling"] = 2.0;
      data["layer_shift"] = 4;
      data["invert_mask"] = false;

      data["tint_palette_key_1"] = gene_pick_key(three_bit_palette);
      data["tint_palette_key_2"] = gene_pick_key(three_bit_palette);
      data["tint_palette_1"] = three_bit_palette[ data["tint_palette_key_1"] ];
      data["tint_palette_2"] = three_bit_palette[ data["tint_palette_key_2"] ];

      data["delta_factor"] = 0.5; // scaling animation effects
      data["chosen_effect_function"] = applyNoisyEffect;

      break;

    case "corrupted":

      data["blackValue"] = 10; // 10
      data["brigthnessValue"] = 50;
      data["whiteValue"] = 70; // 70

      data["sorting_mode_1"] = gene_rand_int(0, 3); // 0, 1, 2
      data["sorting_type_1"] = gene_rand_int(0, 2); // 0, 1
      data["sorting_order_1"] = gene_rand_int(0, 4); // 0, 1, 2, 3

      data["second_sorting"] = gene() < 0.35 ? true : false;
      data["sorting_mode_2"] = gene_rand_int(0, 3); // 0, 1, 2
      data["sorting_type_2"] = gene_rand_int(0, 2); // 0, 1
      data["sorting_order_2"] = gene_rand_int(0, 4); // 0, 1, 2, 3

      data["color_noise_density"] = gene() < 0.35 ? 50 : 5;
      data["rand_color_bias_key"] = gene_pick_key(color_bias_palette);
      data["color_noise_bias"] = color_bias_palette[ data["rand_color_bias_key"]];
      data["color_noise_variation"] = 10000; //10000

      data["nr_of_levels"] = 1;

      if (gene() < 0.25) {
        data["rand_dither_key_1"] = gene_pick_key(extreme_dither_params_json);
        data["dither_params_1"] = extreme_dither_params_json[ data["rand_dither_key_1"] ];
      } else {
        data["rand_dither_key_1"] = gene_pick_key(dither_params_json);
        data["dither_params_1"] = dither_params_json[ data["rand_dither_key_1"] ];
      }

      if (gene() < 0.25) {
        data["rand_dither_key_2"] = gene_pick_key(extreme_dither_params_json);
        data["dither_params_2"] = extreme_dither_params_json[ data["rand_dither_key_2"] ];
      } else {
        data["rand_dither_key_2"] = gene_pick_key(dither_params_json);
        data["dither_params_2"] = dither_params_json[ data["rand_dither_key_2"] ];
      }

      data["pix_scaling"] = 2.0;
      data["layer_shift"] = 4;
      data["invert_mask"] = false;

      data["tint_palette_key_1"] = gene_pick_key(three_bit_palette);
      data["tint_palette_key_2"] = gene_pick_key(three_bit_palette);
      data["tint_palette_1"] = three_bit_palette[ data["tint_palette_key_1"] ];
      data["tint_palette_2"] = three_bit_palette[ data["tint_palette_key_2"] ];

      data["delta_factor"] = 0.5; // scaling animation effects
      data["chosen_effect_function"] = applyCorruptedEffect;

      break;

    case "lo-fi": 

      data["blackValue"] = 10;
      data["brigthnessValue"] = 50;
      data["whiteValue"] = 70;

      data["sorting_mode"] = 2; // this mode works best for this workflow
      data["sorting_type"] = gene_rand_int(0, 2); // 0, 1
      data["sorting_order"] = gene_rand_int(0, 3); // 0, 1, 2
      data["color_noise_density"] = gene() < 0.35 ? 50 : 5;
      data["rand_color_bias_key"] = gene_pick_key(color_bias_palette);
      data["color_noise_bias"] = color_bias_palette[ data["rand_color_bias_key"] ];
      data["color_noise_variation"] = 10000;

      data["nr_of_levels"] = 1;

      data["dither_group_weights"] = [ [0, 65], [1, 35] ]; // these represent probabilities for choosing a dither group number [element, probability]
      data["dither_group"] = gene_weighted_choice( data["dither_group_weights"] ); // type of effects workflow to be used as a number, 0-4

      switch( data["dither_group"]) {
        case 0: // smaller pixels, less abstract, common
          data["rand_dither_key_1"] = gene_pick_key(dither_params_json);
          data["dither_params_1"] = dither_params_json[ data["rand_dither_key_1"] ];
          break;
        case 1: // larger pixels, more abstract, rare
          data["rand_dither_key_1"] = gene_pick_key(extreme_dither_params_json);
          data["dither_params_1"] = extreme_dither_params_json[ data["rand_dither_key_1"] ];
          break;
        default:
          break;
      }

      data["pix_scaling"] = data["dither_group"] == 0 ? 8.0 : 16.0; // larger dither pixels for extreme dither parameters
      data["layer_shift"] = 4;

      data["invert_mask"] = false;

      data["delta_factor"] = 0.05; // scaling animation effects
      data["chosen_effect_function"] = applyLoFiEffect;

      break;

    default:
      break;

  }

  // return data object containing all parameters
  return data;
}


// apply effect stack "mono"
function applyMonoEffect(img, stack_data) {

  setBrightness(img, stack_data["new_brightness"]);
  grayscale(img, stack_data["contrast"]);

  img_2 = img.get(); // copy image pixels
  img_3 = img.get(); // copy image pixels

  // 1. Full image
  blendMode(BLEND); // make sure to set blendMode back to default one just in case
  noTint();
  img.resize(img.width / stack_data["pix_scaling"], 0);
  if (stack_data["effect_era"] == "'80s") {makeDithered(img, stack_data["nr_of_levels"], stack_data["dither_params_1"]);}
  tint(stack_data["tint_palette_1"][0], stack_data["tint_palette_1"][1], stack_data["tint_palette_1"][2]);
  img.resizeNN(img.width * stack_data["pix_scaling"], 0);
  image(img, output_border[0]/2, output_border[1]/2);

  // 2. Bright part of the image
  blendMode(BLEND);
  brightnessMask(img_2, stack_data["mask_contrast"], stack_data["light_treshold"], stack_data["invert_mask"]);
  if (stack_data["effect_era"] == "'80s") {makeDithered(img_2, stack_data["nr_of_levels"], stack_data["dither_params_2"]);}
  tint(stack_data["tint_palette_1"][0], stack_data["tint_palette_1"][1], stack_data["tint_palette_1"][2]);
  image(img_2, output_border[0]/2 + stack_data["layer_shift"], output_border[1]/2 + stack_data["layer_shift"]);

  // 3. Dark part of the image
  blendMode(ADD);
  img_3.resize(img_3.width / stack_data["pix_scaling_dark"], 0);
  brightnessMask(img_3, stack_data["mask_contrast"], stack_data["dark_treshold"], !stack_data["invert_mask"]);
  if (stack_data["effect_era"] == "'80s") {makeDithered(img_3, stack_data["nr_of_levels"], stack_data["dither_params_3"]);}
  tint(stack_data["tint_palette_1"][0], stack_data["tint_palette_1"][1], stack_data["tint_palette_1"][2]);
  img_3.resizeNN(img_3.width * stack_data["pix_scaling_dark"], 0);
  image(img_3, output_border[0]/2 - stack_data["layer_shift"], output_border[1]/2 - stack_data["layer_shift"]);

  blendMode(BLEND);
  noTint();
}


// apply effect stack "hi-fi"
function applyHiFiEffect(img, stack_data) {

  setBrightness(img, stack_data["new_brightness"]);
  img_2 = img.get(); // copy image pixels
  img_3 = img.get(); // copy image pixels

  // 1. Full image
  blendMode(BLEND);
  setContrast(img, stack_data["contrast"]);
  img.resize(img.width / stack_data["pix_scaling"], 0);
  if (stack_data["effect_era"] == "'80s") {makeDithered(img, stack_data["nr_of_levels"], stack_data["dither_params_1"]);}
  tint(stack_data["tint_palette_1"][0], stack_data["tint_palette_1"][1], stack_data["tint_palette_1"][2]);
  img.resizeNN(img.width * stack_data["pix_scaling"], 0);
  image(img, output_border[0]/2, output_border[1]/2);

  // 2. Bright part of the image
  blendMode(ADD);
  noTint();
  grayscale(img_2, stack_data["contrast"]);
  img_2.resize(img_2.width / stack_data["pix_scaling"], 0);
  brightnessMask(img_2, stack_data["mask_contrast"], stack_data["light_treshold"], stack_data["invert_mask"]);
  if (stack_data["effect_era"] == "'80s") {makeDithered(img_2, stack_data["nr_of_levels"], stack_data["dither_params_2"]);}
  tint(stack_data["tint_palette_2"][0], stack_data["tint_palette_2"][1], stack_data["tint_palette_2"][2]);
  img_2.resizeNN(img_2.width * stack_data["pix_scaling"], 0);
  image(img_2, output_border[0]/2 + stack_data["layer_shift"], output_border[1]/2 + stack_data["layer_shift"]);

  // 3. Dark part of the image
  blendMode(DIFFERENCE);
  noTint();
  grayscale(img_3, stack_data["contrast"]);
  img_3.resize(img_3.width / stack_data["pix_scaling_dark"], 0);
  brightnessMask(img_3, stack_data["mask_contrast"], stack_data["dark_treshold"], !stack_data["invert_mask"]);
  if (stack_data["effect_era"] == "'80s") {makeDithered(img_3, stack_data["nr_of_levels"], stack_data["dither_params_3"]);}
  tint(stack_data["tint_palette_3"][0], stack_data["tint_palette_3"][1], stack_data["tint_palette_3"][2]);
  img_3.resizeNN(img_3.width * stack_data["pix_scaling_dark"], 0);
  image(img_3, output_border[0]/2 - stack_data["layer_shift"], output_border[1]/2 - stack_data["layer_shift"]);
  
  blendMode(BLEND);
  noTint();
}


// apply effect stack "noisy"
function applyNoisyEffect(img, stack_data) {

  setBrightness(img, stack_data["new_brightness"]);
  img_2 = img.get(); // copy image pixels

  // 1. Full image
  blendMode(BLEND);
  setContrast(img, stack_data["contrast"]);
  img.resize(img.width / stack_data["pix_scaling"], 0);
  if (stack_data["effect_era"] == "'80s") {makeDithered(img, stack_data["nr_of_levels"], stack_data["dither_params_1"]);}

  switch (stack_data["sorting_order"]) {
    case 0:
      pixelSortColumn(img, stack_data["sorting_mode"], stack_data["sorting_type"], stack_data["color_noise_density"], stack_data["color_noise_bias"], stack_data["color_noise_variation"], stack_data["blackValue"], stack_data["whiteValue"], stack_data["brigthnessValue"]);
      break;
    case 1:
      pixelSortRow(img, stack_data["sorting_mode"], stack_data["sorting_type"], stack_data["color_noise_density"], stack_data["color_noise_bias"], stack_data["color_noise_variation"], stack_data["blackValue"], stack_data["whiteValue"], stack_data["brigthnessValue"]);
      break;
    case 2:
      pixelSortColumn(img, stack_data["sorting_mode"], stack_data["sorting_type"], stack_data["color_noise_density"], stack_data["color_noise_bias"], stack_data["color_noise_variation"], stack_data["blackValue"], stack_data["whiteValue"], stack_data["brigthnessValue"]);
      pixelSortRow(img, stack_data["sorting_mode"], stack_data["sorting_type"], stack_data["color_noise_density"], stack_data["color_noise_bias"], stack_data["color_noise_variation"], stack_data["blackValue"], stack_data["whiteValue"], stack_data["brigthnessValue"]);
      break;
    case 3:
      pixelSortRow(img, stack_data["sorting_mode"], stack_data["sorting_type"], stack_data["color_noise_density"], stack_data["color_noise_bias"], stack_data["color_noise_variation"], stack_data["blackValue"], stack_data["whiteValue"], stack_data["brigthnessValue"]);
      pixelSortColumn(img, stack_data["sorting_mode"], stack_data["sorting_type"], stack_data["color_noise_density"], stack_data["color_noise_bias"], stack_data["color_noise_variation"], stack_data["blackValue"], stack_data["whiteValue"], stack_data["brigthnessValue"]);
      break;
    default:
      break;
  }

  if (stack_data["effect_era"] == "'80s") {makeDithered(img, stack_data["nr_of_levels"], stack_data["dither_params_1"]);}
  tint(stack_data["tint_palette_1"][0], stack_data["tint_palette_1"][1], stack_data["tint_palette_1"][2]);

  img.resizeNN(img.width * stack_data["pix_scaling"], 0);
  image(img, output_border[0]/2, output_border[1]/2);

  // 2. Bright part of the image
  blendMode(ADD);
  noTint();
  grayscale(img_2, stack_data["contrast"]);
  img_2.resize(img_2.width / stack_data["pix_scaling"], 0);
  brightnessMask(img_2, stack_data["mask_contrast"], stack_data["light_treshold"], stack_data["invert_mask"]);
  if (stack_data["effect_era"] == "'80s") {makeDithered(img_2, stack_data["nr_of_levels"], stack_data["dither_params_2"]);}
  tint(stack_data["tint_palette_2"][0], stack_data["tint_palette_2"][1], stack_data["tint_palette_2"][2]);
  img_2.resizeNN(img_2.width * stack_data["pix_scaling"], 0);
  image(img_2, output_border[0]/2 + stack_data["layer_shift"], output_border[1]/2 + stack_data["layer_shift"]);

  blendMode(BLEND);
  noTint();
}


// apply effect stack "corrupted"
function applyCorruptedEffect(img, stack_data) {

  setBrightness(img, stack_data["new_brightness"]);
  img_2 = img.get(); // copy image pixels

  // 1. Full image
  blendMode(BLEND);
  setContrast(img, stack_data["contrast"]);
  img.resize(img.width / stack_data["pix_scaling"], 0);

  switch (stack_data["sorting_order_1"]) {
    case 0:
      pixelSortColumn(img, stack_data["sorting_mode_1"], stack_data["sorting_type_1"], stack_data["color_noise_density"], stack_data["color_noise_bias"], stack_data["color_noise_variation"], stack_data["blackValue"], stack_data["whiteValue"], stack_data["brigthnessValue"]);
      break;
    case 1:
      pixelSortRow(img, stack_data["sorting_mode_1"], stack_data["sorting_type_1"], stack_data["color_noise_density"], stack_data["color_noise_bias"], stack_data["color_noise_variation"], stack_data["blackValue"], stack_data["whiteValue"], stack_data["brigthnessValue"]);
      break;
    case 2:
      pixelSortColumn(img, stack_data["sorting_mode_1"], stack_data["sorting_type_1"], stack_data["color_noise_density"], stack_data["color_noise_bias"], stack_data["color_noise_variation"], stack_data["blackValue"], stack_data["whiteValue"], stack_data["brigthnessValue"]);
      pixelSortRow(img, stack_data["sorting_mode_1"], stack_data["sorting_type_1"], stack_data["color_noise_density"], stack_data["color_noise_bias"], stack_data["color_noise_variation"], stack_data["blackValue"], stack_data["whiteValue"], stack_data["brigthnessValue"]);
      break;
    case 3:
      pixelSortRow(img, stack_data["sorting_mode_1"], stack_data["sorting_type_1"], stack_data["color_noise_density"], stack_data["color_noise_bias"], stack_data["color_noise_variation"], stack_data["blackValue"], stack_data["whiteValue"], stack_data["brigthnessValue"]);
      pixelSortColumn(img, stack_data["sorting_mode_1"], stack_data["sorting_type_1"], stack_data["color_noise_density"], stack_data["color_noise_bias"], stack_data["color_noise_variation"], stack_data["blackValue"], stack_data["whiteValue"], stack_data["brigthnessValue"]);
      break;
    default:
      break;
  }

  if (stack_data["effect_era"] == "'80s") {makeDithered(img, stack_data["nr_of_levels"], stack_data["dither_params_1"]);}
  tint(stack_data["tint_palette_1"][0], stack_data["tint_palette_1"][1], stack_data["tint_palette_1"][2]);
  img.resizeNN(img.width * stack_data["pix_scaling"], 0);
  image(img, output_border[0]/2, output_border[1]/2);

  // 2. Bright part of the image
  blendMode(ADD);
  noTint();
  grayscale(img_2, stack_data["contrast"]);
  img_2.resize(img_2.width / stack_data["pix_scaling"], 0);
  brightnessMask(img_2, stack_data["mask_contrast"], stack_data["light_treshold"], stack_data["invert_mask"]);
  
  if (stack_data["second_sorting"]) {
    switch (stack_data["sorting_order_2"]) {
      case 0:
        pixelSortColumn(img_2, stack_data["sorting_mode_2"], stack_data["sorting_type_2"], stack_data["color_noise_density"], stack_data["color_noise_bias"], stack_data["color_noise_variation"], stack_data["blackValue"], stack_data["whiteValue"], stack_data["brigthnessValue"]);
        break;
      case 1:
        pixelSortRow(img_2, stack_data["sorting_mode_2"], stack_data["sorting_type_2"], stack_data["color_noise_density"], stack_data["color_noise_bias"], stack_data["color_noise_variation"], stack_data["blackValue"], stack_data["whiteValue"], stack_data["brigthnessValue"]);
        break;
      case 2:
        pixelSortColumn(img_2, stack_data["sorting_mode_2"], stack_data["sorting_type_2"], stack_data["color_noise_density"], stack_data["color_noise_bias"], stack_data["color_noise_variation"], stack_data["blackValue"], stack_data["whiteValue"], stack_data["brigthnessValue"]);
        pixelSortRow(img_2, stack_data["sorting_mode_2"], stack_data["sorting_type_2"], stack_data["color_noise_density"], stack_data["color_noise_bias"], stack_data["color_noise_variation"], stack_data["blackValue"], stack_data["whiteValue"], stack_data["brigthnessValue"]);
        break;
      case 3:
        pixelSortRow(img_2, stack_data["sorting_mode_2"], stack_data["sorting_type_2"], stack_data["color_noise_density"], stack_data["color_noise_bias"], stack_data["color_noise_variation"], stack_data["blackValue"], stack_data["whiteValue"], stack_data["brigthnessValue"]);
        pixelSortColumn(img_2, stack_data["sorting_mode_2"], stack_data["sorting_type_2"], stack_data["color_noise_density"], stack_data["color_noise_bias"], stack_data["color_noise_variation"], stack_data["blackValue"], stack_data["whiteValue"], stack_data["brigthnessValue"]);
        break;
      default:
        break;
    }
  }
  
  if (stack_data["effect_era"] == "'80s") {makeDithered(img_2, stack_data["nr_of_levels"], stack_data["dither_params_2"]);}
  tint(stack_data["tint_palette_2"][0], stack_data["tint_palette_2"][1], stack_data["tint_palette_2"][2]);
  img_2.resizeNN(img_2.width * stack_data["pix_scaling"], 0);
  image(img_2, output_border[0]/2 + stack_data["layer_shift"], output_border[1]/2 + stack_data["layer_shift"]);

  blendMode(BLEND);
  noTint();
}


// apply effect stack "lo-fi"
function applyLoFiEffect(img, stack_data) {

  setBrightness(img, stack_data["new_brightness"]);

  // 1. Full image
  blendMode(BLEND);
  grayscale(img, stack_data["contrast"]);
  img.resize(img.width / stack_data["pix_scaling"], 0);
  if (stack_data["effect_era"] == "'80s") {makeDithered(img, stack_data["nr_of_levels"], stack_data["dither_params_1"]);}
  img.resizeNN(img.width * stack_data["pix_scaling"] / 2.0, 0); // we resize back only half way

  // here we had to take out pixelSortRow option as it didn't produce nice results
  switch (stack_data["sorting_order"]) {
    case 0:
      pixelSortColumn(img, stack_data["sorting_mode"], stack_data["sorting_type"], stack_data["color_noise_density"], stack_data["color_noise_bias"], stack_data["color_noise_variation"], stack_data["blackValue"], stack_data["whiteValue"], stack_data["brigthnessValue"]);
      break;
    case 1:
      pixelSortColumn(img, stack_data["sorting_mode"], stack_data["sorting_type"], stack_data["color_noise_density"], stack_data["color_noise_bias"], stack_data["color_noise_variation"], stack_data["blackValue"], stack_data["whiteValue"], stack_data["brigthnessValue"]);
      pixelSortRow(img, stack_data["sorting_mode"], stack_data["sorting_type"], stack_data["color_noise_density"], stack_data["color_noise_bias"], stack_data["color_noise_variation"], stack_data["blackValue"], stack_data["whiteValue"], stack_data["brigthnessValue"]);
      break;
    case 2:
      pixelSortRow(img, stack_data["sorting_mode"], stack_data["sorting_type"], stack_data["color_noise_density"], stack_data["color_noise_bias"], stack_data["color_noise_variation"], stack_data["blackValue"], stack_data["whiteValue"], stack_data["brigthnessValue"]);
      pixelSortColumn(img, stack_data["sorting_mode"], stack_data["sorting_type"], stack_data["color_noise_density"], stack_data["color_noise_bias"], stack_data["color_noise_variation"], stack_data["blackValue"], stack_data["whiteValue"], stack_data["brigthnessValue"]);
      break;
    default:
      break;
  }

  if (stack_data["effect_era"] == "'80s") {makeDithered(img, stack_data["nr_of_levels"], stack_data["dither_params_1"]);}
  img.resizeNN(img.width * 2.0, 0); // we resize back double to get to the size of the original input image
  image(img, output_border[0]/2, output_border[1]/2);

  blendMode(BLEND);
  noTint();
}


// create 5 frame animation using one of the effect stacks
// also triggers gif export when "g" is pressed by passing download = true
function animateEffectStack(img, stack_data_main, stack_data_background, download = false) {
  // setup gif
  if (download == true) { setupGif(); }

  // make source image copies
  let frames = [];
  for (let i = 0; i < nr_of_frames; i++) {
    let frame = img.get();
    frames.push(frame);
  }

  let buffer_width = img.width + output_border[0];
  let buffer_height = img.height + output_border[1];

  // make graphic buffers to store canvas copies for each frame
  buffer_frames = [];
  for (let i = 0; i < nr_of_frames; i++) {
    let buffer_frame = createGraphics(buffer_width, buffer_height);
    buffer_frames.push(buffer_frame);
  }

  // save original contrast and brightness so we can restore them later
  let original_contrast = stack_data_main["contrast"];
  let original_new_brightness = stack_data_main["new_brightness"];
  let original_alpha_brightness = stack_data_background["alpha_brightness"];

  // apply effects to individual frames and add them to the gif animation
  for (let i = 0; i < nr_of_frames; i++) {

    //black background for all frames
    background(0, 0, 0);

    // create an animated background which shows through the transparent squares
    let buffer_graphics = createGraphics(output_dim[0], output_dim[1]);
    buffer_graphics.background(stack_data_background["alpha_brightness"] * 2.55);
    let buffer_image = createImage(buffer_graphics.width, buffer_graphics.height);
    buffer_image.copy(buffer_graphics, 0, 0, buffer_graphics.width, buffer_graphics.height, 0, 0, buffer_graphics.width, buffer_graphics.height);
    let chosen_effect_function_background = stack_data_background["chosen_effect_function"];
    chosen_effect_function_background(buffer_image, stack_data_background)

    // apply effect stack to canvas
    let chosen_effect_function = stack_data_main["chosen_effect_function"];
    chosen_effect_function(frames[i], stack_data_main);

    // inverts the colors of the canvas
    if (invert_input) {filter(INVERT);}

    // add frame to gif with canvas.elt which calls underlying HTML element
    if (download == true) { gif.addFrame(canvas.elt, { delay: frame_duration, copy: true }); }
    // copy canvas to buffer object so it can be used later for display in draw()
    buffer_frames[i].copy(canvas, 0, 0, buffer_width, buffer_height, 0, 0, buffer_width, buffer_height);

    // change contrast and brightness slightly to get a shimmering effect during animation
    stack_data_main["contrast"] += stack_data_main["contrast_delta"][0] * stack_data_main["delta_factor"];
    stack_data_main["new_brightness"] += stack_data_main["brightness_delta"][0] * stack_data_main["delta_factor"];
    stack_data_background["alpha_brightness"] += stack_data_background["brightness_delta"][0] * stack_data_background["delta_factor"];

  }

  // restoring values for contrast and brightness so they don't accumulate every time we save the gif animation
  stack_data_main["contrast"] = original_contrast;
  stack_data_main["new_brightness"] = original_new_brightness;
  stack_data_background["alpha_brightness"] = original_alpha_brightness;

  // render gif when done
  if (download == true) { gif.render(); }
}




////// PIXEL SORTING //////


// ASDFPixelSort_Color - rewritten from Java to JavaScript by @lukapiskorec
// from: https://github.com/shmam/ASDFPixelSort_Color
function pixelSortColor(img, sorting_mode, sorting_type, color_noise_density = 5, color_noise_bias = [1, 1, 1], color_noise_variation = 1000, blackValue = 10, whiteValue = 70, brigthnessValue = 50) {
  // reset row and column for each image!
  let row = 0;
  let column = 0;

  img.loadPixels();

  while (column < img.width - 1) {
    sortColumn(img, column, sorting_mode, sorting_type, color_noise_density, color_noise_bias, color_noise_variation, blackValue, whiteValue, brigthnessValue);
    column++;
  }

  while (row < img.height - 1) {
    sortRow(img, row, sorting_mode, sorting_type, color_noise_density, color_noise_bias, color_noise_variation, blackValue, whiteValue, brigthnessValue);
    row++;
  }

  img.updatePixels();
}


// sort all columns in an image
function pixelSortColumn(img, sorting_mode, sorting_type, color_noise_density = 5, color_noise_bias = [1, 1, 1], color_noise_variation = 1000, blackValue = 10, whiteValue = 70, brigthnessValue = 50) {
  // reset column for each image!
  let column = 0;

  img.loadPixels();

  while (column < img.width - 1) {
    sortColumn(img, column, sorting_mode, sorting_type, color_noise_density, color_noise_bias, color_noise_variation, blackValue, whiteValue, brigthnessValue);
    column++;
  }

  img.updatePixels();
}


// sort all rows in an image
function pixelSortRow(img, sorting_mode, sorting_type, color_noise_density = 5, color_noise_bias = [1, 1, 1], color_noise_variation = 1000, blackValue = 10, whiteValue = 70, brigthnessValue = 50) {
  // reset row for each image!
  let row = 0;

  img.loadPixels();

  while (row < img.height - 1) {
    sortRow(img, row, sorting_mode, sorting_type, color_noise_density, color_noise_bias, color_noise_variation, blackValue, whiteValue, brigthnessValue);
    row++;
  }

  img.updatePixels();
}


// sort a row of pixels
function sortRow(img, row, sorting_mode, sorting_type, color_noise_density = 5, color_noise_bias = [1, 1, 1], color_noise_variation = 1000, blackValue = 10, whiteValue = 70, brigthnessValue = 50) {
  let x = 0;
  let y = row;
  let xend = 0;

  let mixPercentage, pixelColor, colorHex;

  while (xend < img.width - 1) {
    switch (sorting_mode) {
      case 0:
        x = getFirstNotBlackX(img, x, y, blackValue);
        xend = getNextBlackX(img, x, y, blackValue);
        break;
      case 1:
        x = getFirstBrightX(img, x, y, brigthnessValue);
        xend = getNextDarkX(img, x, y, brigthnessValue);
        break;
      case 2:
        x = getFirstNotWhiteX(img, x, y, whiteValue);
        xend = getNextWhiteX(img, x, y, whiteValue);
        break;
      default:
        break;
    }

    if (x < 0) {
      break;
    }

    let sortLength = xend - x;
    let unsorted = [];
    let sorted = [];

    let randomColor = color(gene_rand_int(0, 255) * color_noise_bias[0], gene_rand_int(0, 255) * color_noise_bias[1], gene_rand_int(0, 255) * color_noise_bias[2], 255);
    let d = 0;

    if (gene_rand_int(0, 100) < color_noise_density) {
      d = gene_rand_int(0, color_noise_variation);
    }

    for (let i = 0; i < sortLength; i = i + 1) {
      if (d > 0) {
        mixPercentage = 0.5 + gene_rand_int(0, 50) / 100;
        pixelColor = getColorAtIndex(img, x + i, y);
        setColorAtIndex(img, x + i, y, lerpColor(pixelColor, randomColor, mixPercentage));
        d--;
      }

      switch (sorting_type) {
        case 0: // chaotic sorting
          unsorted[i] = getColorAtIndex(img, x + i, y);
          break;
        case 1: // proper sorting
          colorHex = getColorAtIndex(img, x + i, y);
          unsorted[i] = rgbToHex(red(colorHex), green(colorHex), blue(colorHex));
          break;
        default:
          break;
      }
    }

    sorted = unsorted.sort();

    for (let i = 0; i < sortLength; i = i + 1) {
      switch (sorting_type) {
        case 0: // chaotic sorting
          setColorAtIndex(img, x + i, y, sorted[i]);
          break;
        case 1: // proper sorting
          pixelColor = hexToRgb(unsorted[i]);
          setColorAtIndex(img, x + i, y, pixelColor);
          break;
        default:
          break;
      }
    }

    x = xend + 1;
  }
}


// sort a column of pixels
function sortColumn(img, column, sorting_mode, sorting_type, color_noise_density = 5, color_noise_bias = [1, 1, 1], color_noise_variation = 1000, blackValue = 10, whiteValue = 70, brigthnessValue = 50) {
  let x = column;
  let y = 0;
  let yend = 0;

  let mixPercentage, pixelColor, colorHex;

  while (yend < img.height - 1) {
    switch (sorting_mode) {
      case 0:
        y = getFirstNotBlackY(img, x, y, blackValue);
        yend = getNextBlackY(img, x, y, blackValue);
        break;
      case 1:
        y = getFirstBrightY(img, x, y, brigthnessValue);
        yend = getNextDarkY(img, x, y, brigthnessValue);
        break;
      case 2:
        y = getFirstNotWhiteY(img, x, y, whiteValue);
        yend = getNextWhiteY(img, x, y, whiteValue);
        break;
      default:
        break;
    }

    if (y < 0) {
      break;
    }

    let sortLength = yend - y;
    let unsorted = [];
    let sorted = [];

    let randomColor = color(gene_rand_int(0, 255) * color_noise_bias[0], gene_rand_int(0, 255) * color_noise_bias[1], gene_rand_int(0, 255) * color_noise_bias[2], 255);
    let d = 0;

    if (gene_rand_int(0, 100) < color_noise_density) {
      d = gene_rand_int(0, color_noise_variation);
    }

    for (let i = 0; i < sortLength; i++) {
      if (d > 0) {
        mixPercentage = 0.5 + gene_rand_int(0, 50) / 100;
        pixelColor = getColorAtIndex(img, x + i, y);
        setColorAtIndex(img, x + i, y, lerpColor(pixelColor, randomColor, mixPercentage));
        d--;
      }

      switch (sorting_type) {
        case 0: // chaotic sorting
          unsorted[i] = getColorAtIndex(img, x + i, y);
          break;
        case 1: // proper sorting
          colorHex = getColorAtIndex(img, x + i, y);
          unsorted[i] = rgbToHex(red(colorHex), green(colorHex), blue(colorHex));
          break;
        default:
          break;
      }
    }

    sorted = unsorted.sort();

    for (let i = 0; i < sortLength; i++) {
      switch (sorting_type) {
        case 0: // chaotic sorting
          setColorAtIndex(img, x, y + i, sorted[i]);
          break;
        case 1: // proper sorting
          pixelColor = hexToRgb(unsorted[i]);
          setColorAtIndex(img, x, y + i, pixelColor);
          break;
        default:
          break;
      }
    }

    y = yend + 1;
  }
}


// used for pixel sorting - black x
function getFirstNotBlackX(img, _x, _y, blackValue) {
  let x = _x;
  let y = _y;
  while (brightness(getColorAtIndex(img, x, y)) < blackValue) {
    x++;
    if (x >= img.width) return -1;
  }
  return x;
}


// used for pixel sorting - black x
function getNextBlackX(img, _x, _y, blackValue) {
  let x = _x + 1;
  let y = _y;
  while (brightness(getColorAtIndex(img, x, y)) > blackValue) {
    x++;
    if (x >= img.width) return img.width - 1;
  }
  return x - 1;
}


// used for pixel sorting - brightness x
function getFirstBrightX(img, _x, _y, brigthnessValue) {
  let x = _x;
  let y = _y;
  while (brightness(getColorAtIndex(img, x, y)) < brigthnessValue) {
    x++;
    if (x >= img.width) return -1;
  }
  return x;
}


// used for pixel sorting - brightness x
function getNextDarkX(img, _x, _y, brigthnessValue) {
  let x = _x + 1;
  let y = _y;
  while (brightness(getColorAtIndex(img, x, y)) > brigthnessValue) {
    x++;
    if (x >= img.width) return img.width - 1;
  }
  return x - 1;
}


// used for pixel sorting - white x
function getFirstNotWhiteX(img, _x, _y, whiteValue) {
  let x = _x;
  let y = _y;
  while (brightness(getColorAtIndex(img, x, y)) > whiteValue) {
    x++;
    if (x >= img.width) return -1;
  }
  return x;
}


// used for pixel sorting - white x
function getNextWhiteX(img, _x, _y, whiteValue) {
  let x = _x + 1;
  let y = _y;
  while (brightness(getColorAtIndex(img, x, y)) < whiteValue) {
    x++;
    if (x >= img.width) return img.width - 1;
  }
  return x - 1;
}


// used for pixel sorting - black y
function getFirstNotBlackY(img, _x, _y, blackValue) {
  let x = _x;
  let y = _y;
  if (y < img.height) {
    while (brightness(getColorAtIndex(img, x, y)) < blackValue) {
      y++;
      if (y >= img.height) return -1;
    }
  }
  return y;
}


// used for pixel sorting - black y
function getNextBlackY(img, _x, _y, blackValue) {
  let x = _x;
  let y = _y + 1;
  if (y < img.height) {
    while (brightness(getColorAtIndex(img, x, y)) > blackValue) {
      y++;
      if (y >= img.height) return img.height - 1;
    }
  }
  return y - 1;
}


// used for pixel sorting - brightness y
function getFirstBrightY(img, _x, _y, brigthnessValue) {
  let x = _x;
  let y = _y;
  if (y < img.height) {
    while (brightness(getColorAtIndex(img, x, y)) < brigthnessValue) {
      y++;
      if (y >= img.height) return -1;
    }
  }
  return y;
}


// used for pixel sorting - brightness y
function getNextDarkY(img, _x, _y, brigthnessValue) {
  let x = _x;
  let y = _y + 1;
  if (y < img.height) {
    while (brightness(getColorAtIndex(img, x, y)) > brigthnessValue) {
      y++;
      if (y >= img.height) return img.height - 1;
    }
  }
  return y - 1;
}


// used for pixel sorting - white y
function getFirstNotWhiteY(img, _x, _y, whiteValue) {
  let x = _x;
  let y = _y;
  if (y < img.height) {
    while (brightness(getColorAtIndex(img, x, y)) > whiteValue) {
      y++;
      if (y >= img.height) return -1;
    }
  }
  return y;
}


// used for pixel sorting - white y
function getNextWhiteY(img, _x, _y, whiteValue) {
  let x = _x;
  let y = _y + 1;
  if (y < img.height) {
    while (brightness(getColorAtIndex(img, x, y)) < whiteValue) {
      y++;
      if (y >= img.height) return img.height - 1;
    }
  }
  return y - 1;
}




////// DITHERING //////


// Coding Challenge #90: Floyd-Steinberg dithering
// from: https://www.youtube.com/watch?v=0L2n8Tg2FwI
// from: https://editor.p5js.org/codingtrain/sketches/-YkMaf9Ea

// applies Floyd-Steinberg dithering with steps+1 number of levels on an image
function makeDithered(img, steps, dither_params) {
  img.loadPixels();
  for (let y = 0; y < img.height; y += 1) {
    for (let x = 0; x < img.width; x += 1) {
      let clr = getColorAtIndex(img, x, y);
      let oldR = red(clr);
      let oldG = green(clr);
      let oldB = blue(clr);
      let oldA = alpha(clr);
      let newR = closestStep(255, steps, oldR);
      let newG = closestStep(255, steps, oldG);
      let newB = closestStep(255, steps, oldB);
      let newA = closestStep(255, steps, oldA);
      let newClr = color(newR, newG, newB, newA);
      setColorAtIndex(img, x, y, newClr);
      let errR = oldR - newR;
      let errG = oldG - newG;
      let errB = oldB - newB;
      let errA = oldA - newA;

      distributeError_params(img, x, y, errR, errG, errB, errA, dither_params);

    }
  }
  img.updatePixels();
}


// Floyd-Steinberg algorithm achieves dithering using error diffusion (formula from Wikipedia)
function distributeError(img, x, y, errR, errG, errB, errA) {
  addError(img, 7 / 16.0, x + 1, y, errR, errG, errB, errA);
  addError(img, 3 / 16.0, x - 1, y + 1, errR, errG, errB, errA);
  addError(img, 5 / 16.0, x, y + 1, errR, errG, errB, errA);
  addError(img, 1 / 16.0, x + 1, y + 1, errR, errG, errB, errA);
}


// Floyd-Steinberg dithering algorithm with varable parameters
function distributeError_params(img, x, y, errR, errG, errB, errA, params) {
  addError(img, params[0], x + 1, y, errR, errG, errB, errA);
  addError(img, params[1], x - 1, y + 1, errR, errG, errB, errA);
  addError(img, params[2], x, y + 1, errR, errG, errB, errA);
  addError(img, params[3], x + 1, y + 1, errR, errG, errB, errA);
}


// Floyd-Steinberg algorithm pushes (adds) the residual quantization error of a pixel onto its neighboring pixels
function addError(img, factor, x, y, errR, errG, errB, errA) {
  if (x < 0 || x >= img.width || y < 0 || y >= img.height) return;
  let clr = getColorAtIndex(img, x, y);
  let r = red(clr);
  let g = green(clr);
  let b = blue(clr);
  let a = alpha(clr);
  clr.setRed(r + errR * factor);
  clr.setGreen(g + errG * factor);
  clr.setBlue(b + errB * factor);
  clr.setAlpha(a + errA * factor);
  setColorAtIndex(img, x, y, clr);
}


// experiment with different Floyd-Steinberg dithering variations using this online tool:
// https://kgjenkins.github.io/dither-dream/
// repository link:
// https://github.com/kgjenkins/dither-dream




////// IMAGE FUNCTIONS //////


// convert RGB to HEX
// from: https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}


// convert RGB to HEX
// from https://editor.p5js.org/Kubi/sketches/IJp2TXHNJ
function hexToRgb(hex) {
  hex = hex.replace('#', '');
  let bigint = parseInt(hex, 16);
  let r = (bigint >> 16) & 255;
  let g = (bigint >> 8) & 255;
  let b = bigint & 255;
  return color(r, g, b);
}


// returns an index location (i) for pixel coordinates (x,y)
function imageIndex(img, x, y) {
  return 4 * (x + y * img.width);
}


// returns color of a pixel at coordinates (x,y)
function getColorAtIndex(img, x, y) {
  let idx = imageIndex(img, x, y);
  let pix = img.pixels;
  let red = pix[idx];
  let green = pix[idx + 1];
  let blue = pix[idx + 2];
  let alpha = pix[idx + 3];
  return color(red, green, blue, alpha);
}


// sets a color of a pixel at coordinates (x,y)
function setColorAtIndex(img, x, y, clr) {
  let idx = imageIndex(img, x, y);
  let pix = img.pixels;
  pix[idx] = red(clr);
  pix[idx + 1] = green(clr);
  pix[idx + 2] = blue(clr);
  pix[idx + 3] = alpha(clr);
}


// finds the closest step for a given value - the step 0 is always included, so the number of steps is actually steps + 1
function closestStep(max, steps, value) {
  return round(steps * value / max) * floor(max / steps);
}


// clamp input number to a certain range
function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}


// make image grayscale
// adapted from: https://github.com/kgjenkins/dither-dream
function grayscale(img, contrast) {
  img.loadPixels();
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      let clr = getColorAtIndex(img, x, y);
      let r = red(clr);
      let g = green(clr);
      let b = blue(clr);
      let a = alpha(clr);
      // calculate greyscale following Rec 601 luma
      let v = (0.3 * r + 0.58 * g + 0.11 * b) * a / 255;
      //stretch to increase contrast
      v = v + (v - 128) * contrast;
      let newClr = color(v, v, v, a);
      setColorAtIndex(img, x, y, newClr);
    }
  }
  img.updatePixels();
}


// change image contrast
function setContrast(img, contrast) {
  img.loadPixels();
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      let clr = getColorAtIndex(img, x, y);
      let r = red(clr);
      let g = green(clr);
      let b = blue(clr);
      let a = alpha(clr);
      //stretch to increase contrast
      r = r + (r - 128) * contrast;
      g = g + (g - 128) * contrast;
      b = b + (b - 128) * contrast;
      let newClr = color(r, g, b, a);
      setColorAtIndex(img, x, y, newClr);
    }
  }
  img.updatePixels();
}


// change image brightness
function setBrightness(img, brightness) {
  img.loadPixels();
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      let clr = getColorAtIndex(img, x, y);
      let r = red(clr);
      let g = green(clr);
      let b = blue(clr);
      let a = alpha(clr);
      //multiply by the constant to change the brightness
      r = r * brightness;
      g = g * brightness;
      b = b * brightness;
      //constrain RGB to make sure they are within 0-255 color range
      r = constrain(r, 0, 255);
      g = constrain(g, 0, 255);
      b = constrain(b, 0, 255);
      let newClr = color(r, g, b, a);
      setColorAtIndex(img, x, y, newClr);
    }
  }
  img.updatePixels();
}


// stripes the image with black bands
function makeStriped(img, stripe_width, stripe_offset = 0, invert = false) {
  img.loadPixels();
  for (let y = 0; y < img.height; y += 1) {
    for (let x = 0; x < img.width; x += 1) {
      let clr = getColorAtIndex(img, x, y);
      // here we use some smart boolean logic to quickly invert the black band pattern
      let r = y % stripe_width == stripe_offset ? red(clr) * !invert : red(clr) * invert;
      let g = y % stripe_width == stripe_offset ? green(clr) * !invert : green(clr) * invert;
      let b = y % stripe_width == stripe_offset ? blue(clr) * !invert : blue(clr) * invert;
      let newClr = color(r, g, b, alpha(clr));
      setColorAtIndex(img, x, y, newClr);
    }
  }
  img.updatePixels();
}


// make parts of the image transparent based on brightness
function brightnessMask(img, contrast, treshold, invert = false) {
  img.loadPixels();
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      let clr = getColorAtIndex(img, x, y);
      let r = red(clr);
      let g = green(clr);
      let b = blue(clr);
      let a = alpha(clr);
      // calculate greyscale following Rec 601 luma
      let v = (0.3 * r + 0.58 * g + 0.11 * b) * a / 255;
      // stretch to increase contrast
      v = v + (v - 128) * contrast;
      let newAlpha = brightness(clr) > treshold ? 255 * !invert : 255 * invert;
      let newClr = color(r, g, b, newAlpha);
      setColorAtIndex(img, x, y, newClr);
    }
  }
  img.updatePixels();
}


// flip image horizontally
function flipHorizontal(img) {
  let img_temp = createImage(img.width, img.height);
  img_temp.loadPixels();
  img.loadPixels();
  // create a temporary image with flipped pixels
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      let clr = getColorAtIndex(img, img.width - x, y);
      let r = red(clr);
      let g = green(clr);
      let b = blue(clr);
      let a = alpha(clr);
      let newClr = color(r, g, b, a);
      setColorAtIndex(img_temp, x, y, newClr);
    }
  }
  // replace all pixels from the original image with the pixels from the flipped one
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      let clr = getColorAtIndex(img_temp, x, y);
      let r = red(clr);
      let g = green(clr);
      let b = blue(clr);
      let a = alpha(clr);
      let newClr = color(r, g, b, a);
      setColorAtIndex(img, x, y, newClr);
    }
  }
  img.updatePixels();
  img_temp.updatePixels();
}


/**
 * Resize the image to a new width and height using nearest neighbor algorithm.
 * To make the image scale proportionally, use 0 as the value for the wide or high parameters.
 * Note: Disproportionate resizing squashes the "pixels" from squares to rectangles.
 * This works about 10 times slower than the regular resize.
 */

// https://GitHub.com/processing/p5.js/issues/1845
// https://gist.github.com/GoToLoop/2e12acf577506fd53267e1d186624d7c
// GitHub GoToLoop/resizeNN.js

p5.Image.prototype.resizeNN = function (w, h) {
  "use strict";
  const { width, height } = this.canvas; // Locally cache current image's canvas' dimension properties
  w = ~~Math.abs(w), h = ~~Math.abs(h); // Sanitize dimension parameters
  if (w === width && h === height || !(w | h)) return this; // Quit prematurely if both dimensions are equal or parameters are both 0
  // Scale dimension parameters:
  w || (w = h * width / height | 0); // when only parameter w is 0
  h || (h = w * height / width | 0); // when only parameter h is 0
  const img = new p5.Image(w, h), // creates temporary image
    sx = w / width, sy = h / height; // scaled coords. for current image
  this.loadPixels(), img.loadPixels(); // initializes both 8-bit RGBa pixels[]
  // Create 32-bit viewers for current & temporary 8-bit RGBa pixels[]:
  const pixInt = new Int32Array(this.pixels.buffer),
    imgInt = new Int32Array(img.pixels.buffer);
  // Transfer current to temporary pixels[] by 4 bytes (32-bit) at once
  for (let y = 0; y < h;) {
    const curRow = width * ~~(y / sy), tgtRow = w * y++;
    for (let x = 0; x < w;) {
      const curIdx = curRow + ~~(x / sx), tgtIdx = tgtRow + x++;
      imgInt[tgtIdx] = pixInt[curIdx];
    }
  }
  img.updatePixels(); // updates temporary 8-bit RGBa pixels[] w/ its current state
  // Resize current image to temporary image's dimensions
  this.canvas.width = this.width = w, this.canvas.height = this.height = h;
  this.drawingContext.drawImage(img.canvas, 0, 0, w, h, 0, 0, w, h);
  return this;
};




////// MENUS AND IMAGE DROP //////


// show start screen
function showStartScreen() {
  let txt_shift, offset_y, txt, txt_size;
  let color_a, color_b, color_c;

  let animation_state = frame_counter % 10 < 6;

  // switch pink and cyan depending on the frame
  if (animation_state) { color_a = color(255, 0, 255); color_b = color(0, 255, 255); }
  else { color_a = color(0, 255, 255); color_b = color(255, 0, 255); }
  color_c = color(255, 255, 255);

  background(0);

  textFont(manaspace);
  textAlign(CENTER, CENTER);
  noStroke();

  // adjust text based on the canvas format
  if (format == "portrait") { txt = "+         +\n\n\n\nR E T R O\ndigitizer\n\n\n\n+         +"; } // portrait proportion
  else if (format == "landscape") { txt = "+                +\n\nR E T R O\ndigitizer\n\n+                +"; } // landscape proportion
  else { txt = "+            +\n\n\nR E T R O\ndigitizer\n\n\n+            +"; } // square proportion

  txt_size = 16; // 5x - 80
  txt_shift = 1; // 5x - 5
  offset_y = 0;

  showText(txt, width / 2, height / 2, txt_size, txt_shift, offset_y, color_a, color_b, color_c);

  txt = "press any key\nto start";
  txt_size = 6; // 5x - 30
  txt_shift = 0.4; // 5x - 2
  offset_y = height / 4; // 220

  // make text blink
  if (frame_counter % 20 < 13) { showText(txt, width / 2, height / 2, txt_size, txt_shift, offset_y, color_a, color_b, color_c); }

  // make text switch
  if (frame_counter % 35 < 22) { txt = "{protocell:labs}"; }
  else { txt = "presents"; }

  offset_y = -height / 4; // -220

  showText(txt, width / 2, height / 2, txt_size, txt_shift, offset_y, color_a, color_b, color_c);
}


// show screen for choosing the era
function showEraScreen() {
  let txt_shift, offset_y, txt, txt_size;
  let color_a, color_b, color_c;

  let animation_state = frame_counter % 10 < 6;

  // switch pink and cyan depending on the frame
  if (animation_state) { color_a = color(255, 0, 255); color_b = color(0, 255, 255); }
  else { color_a = color(0, 255, 255); color_b = color(255, 0, 255); }
  color_c = color(255, 255, 255);

  background(0);

  textFont(manaspace);
  textAlign(CENTER, CENTER);
  noStroke();

  txt_size = 16;
  txt_shift = 1;
  offset_y = 0;
  txt = "+            +\n\n\n\n\n\n\n+            +";

  showText(txt, width / 2, height / 2, txt_size, txt_shift, offset_y, color_a, color_b, color_c);

  txt_size = 8;
  txt_shift = 0.4;
  offset_y = -height / 5;
  txt = "take me back\nto the ...";

  showText(txt, width / 2, height / 2, txt_size, txt_shift, offset_y, color_a, color_b, color_c);


  // '80s selected
  if (era_zone == 1) {

    txt = frame_counter % 20 < 17 ? "`\n'80s" : "\n'80s";
    showText(txt, width / 3, height / 2, 16, 1, height / 12, color_a, color_b, color_c);
    showText("'90s", 2 * width / 3, height / 2, 8, 0.4, height / 12, color_a, color_b, color_c);
    
    // '90s selected
  } else if (era_zone == 2) {

    txt = frame_counter % 20 < 17 ? "`\n'90s" : "\n'90s";
    showText("'80s", width / 3, height / 2, 8, 0.4, height / 12, color_a, color_b, color_c);
    showText(txt, 2 * width / 3, height / 2, 16, 1, height / 12, color_a, color_b, color_c);
    
    // nothing selected
  } else {

    showText("'80s", width / 3, height / 2, 8, 0.4, height / 12, color_a, color_b, color_c);
    showText("'90s", 2 * width / 3, height / 2, 8, 0.4, height / 12, color_a, color_b, color_c);
    
  }

}


// return the indicator for the era
function getEra() {
  if ((mouseX > width) || (mouseY > height) || (mouseX < 0) || (mouseY < 0)) { return 0; } // early termination - return 0 is outside the canvas
  else if (mouseX < width / 2) { return 1; } // '80s selected
  else if (mouseX > width / 2) { return 2; } // '90s selected
}


// show screen for dropping the image
function showDropScreen() {
  let txt_shift, offset_y, txt, txt_size, dash_pattern;
  let color_a, color_b, color_c;
  let side_a, side_b, side_c;

  let animation_state = frame_counter % 10 < 6;

  // switch pink and cyan depending on the frame
  if (animation_state) { color_a = color(255, 0, 255); color_b = color(0, 255, 255); }
  else { color_a = color(0, 255, 255); color_b = color(255, 0, 255); }
  color_c = color(255, 255, 255);

  background(0);

  textFont(manaspace);
  textAlign(CENTER, CENTER);
  rectMode(CENTER);
  strokeWeight(Math.floor(thumbnail_scale));
  noFill();
  side_a = 40 * Math.floor(thumbnail_scale); // 200
  side_b = 32 * Math.floor(thumbnail_scale); // 160
  side_c = 50 * Math.floor(thumbnail_scale); // 250
  txt_shift = 0.4 * Math.floor(thumbnail_scale); // 2
  dash_pattern = [Math.floor(thumbnail_scale) - 1, 2 * Math.floor(thumbnail_scale)]; // [4, 10]

  // square selected
  if (drop_zone == 1) {
    drawingContext.setLineDash(dash_pattern);
    stroke(color_a);
    rect(width / 2 + txt_shift * 2, height / 2 + txt_shift * 2, side_a, side_a);
    stroke(color_b);
    rect(width / 2 + txt_shift, height / 2 + txt_shift, side_a, side_a);
    drawingContext.setLineDash([]);
    stroke(color_c);
    rect(width / 2, height / 2, side_a, side_a);

    // portrait selected
  } else if (drop_zone == 2) {
    drawingContext.setLineDash(dash_pattern);
    stroke(color_a);
    rect(width / 2 + txt_shift * 2, height / 2 + txt_shift * 2, side_b, side_c);
    stroke(color_b);
    rect(width / 2 + txt_shift, height / 2 + txt_shift, side_b, side_c);
    drawingContext.setLineDash([]);
    stroke(color_c);
    rect(width / 2, height / 2, side_b, side_c);

    // landscape selected
  } else if (drop_zone == 3) {
    drawingContext.setLineDash(dash_pattern);
    stroke(color_a);
    rect(width / 2 + txt_shift * 2, height / 2 + txt_shift * 2, side_c, side_b);
    stroke(color_b);
    rect(width / 2 + txt_shift, height / 2 + txt_shift, side_c, side_b);
    drawingContext.setLineDash([]);
    stroke(color_c);
    rect(width / 2, height / 2, side_c, side_b);

  }

  // reset dash values
  drawingContext.setLineDash([]);

  textFont(manaspace);
  textAlign(CENTER, CENTER);
  noStroke();

  txt_size = 16;
  txt_shift = 1;
  offset_y = 0;
  
  // text proportion for square format
  if (drop_zone == 0) { txt = frame_counter % 20 < 17 ? "+            +\n\n`\ndrop\nimg\n^\n\n+            +" : "+            +\n\n\ndrop\nimg\n\n\n+            +"; }
  else { txt = "+            +\n\n\n\n\n\n\n+            +"; }

  showText(txt, width / 2, height / 2, txt_size, txt_shift, offset_y, color_a, color_b, color_c);

  txt_size = 4;
  txt_shift = 0.2;
  offset_y = height / 3;
  textAlign(LEFT, CENTER);

  // text proportion for square format
  txt = "DISCLAIMER: ensure you own the rights to the image, or that it is in the public domain";
  
  showTextBox(txt, width / 1.85, height / 2, txt_size, txt_shift, offset_y, width / 1.8, height / 8, color_a, color_b, color_c);

  txt_size = 6;
  txt_shift = 0.4;
  offset_y = -height / 4;
  textAlign(CENTER, CENTER);

  // square selected
  if (drop_zone == 1) {
    txt = "SQUARE   <  portrait > landscape";
    showText(txt, width / 2, height / 2, txt_size, txt_shift, offset_y, color_a, color_b, color_c);

    // portrait selected
  } else if (drop_zone == 2) {
    txt = "square   <  PORTRAIT > landscape";
    showText(txt, width / 2, height / 2, txt_size, txt_shift, offset_y, color_a, color_b, color_c);

    // landscape selected
  } else if (drop_zone == 3) {
    txt = "square   <  portrait > LANDSCAPE";
    showText(txt, width / 2, height / 2, txt_size, txt_shift, offset_y, color_a, color_b, color_c);
  }

  noStroke();
}


// shows signal info as text on the canvas
function showSignalInfo() {
  let txt_shift, txt_size, signal_info_txt;
  let signal_info_txt_1, signal_info_txt_2, signal_info_txt_3, signal_info_txt_4, signal_info_txt_5, signal_info_txt_6;
  let color_a, color_b, color_c;

  let animation_state = frame_counter % 10 < 6;

  // switch pink and cyan depending on the frame
  if (animation_state) { color_a = color(255, 0, 255); color_b = color(0, 255, 255); }
  else { color_a = color(0, 255, 255); color_b = color(255, 0, 255); }
  color_c = color(255, 255, 255);

  decompressed_signal_size = squares_nr[0] * squares_nr[1] * quality;
  signal_info_txt_1 = "decompressed chars > " + decompressed_signal_size.toString() + "\n";

  compressed_signal_size = signal.length;
  compression_ratio = compressed_signal_size / decompressed_signal_size;
  signal_info_txt_2 = "compressed chars > " + compressed_signal_size + "\n";

  signal_info_txt_3 = "";
  if (compressed_signal_size > 1900) { signal_info_txt_3 = "chars over limit > " + (compressed_signal_size - 1900).toString() + "\n"; }
  else { signal_info_txt_3 = "chars fit into params\n"; }

  signal_info_txt_4 = "compression ratio > " + Math.round(compression_ratio * 100).toString() + "%\n";

  signal_info_txt_5 = "quality > " + quality.toString() + "\n";
  signal_info_txt_6 = "quantization > " + quant_f.toString();

  textFont(manaspace);
  textAlign(RIGHT, BOTTOM);
  noStroke();

  txt_size = 4;
  txt_shift = 0.2;
  signal_info_txt = signal_info_txt_1 + signal_info_txt_2 + signal_info_txt_3 + signal_info_txt_4 + signal_info_txt_5 + signal_info_txt_6;

  showText(signal_info_txt, width - width / 30, height - width / 30, txt_size, txt_shift, 0, color_a, color_b, color_c)


  // in case the image is re-dropped
  textFont(manaspace);
  textAlign(CENTER, CENTER);
  noStroke();

  txt_size = 6;
  txt_shift = 0.4;
  offset_y = 0;

  // square selected
  if (drop_zone == 1) {
    txt = "   `                         \nsquare < portrait > landscape\n   ^                         ";
    showText(txt, width / 2, height / 2, txt_size, txt_shift, offset_y, color_a, color_b, color_c);

    // portrait selected
  } else if (drop_zone == 2) {
    txt = "             `                \nsquare < portrait > landscape\n             ^                ";
    showText(txt, width / 2, height / 2, txt_size, txt_shift, offset_y, color_a, color_b, color_c);

    // landscape selected
  } else if (drop_zone == 3) {
    txt = "                        `    \nsquare < portrait > landscape\n                        ^    ";
    showText(txt, width / 2, height / 2, txt_size, txt_shift, offset_y, color_a, color_b, color_c);
  }

  // any of the formats selected
  if (drop_zone > 0) {
    txt_size = 12;
    txt_shift = 0.6;
    offset_y = -height / 5;
    txt = "redrop img";
    showText(txt, width / 2, height / 2, txt_size, txt_shift, offset_y, color_a, color_b, color_c);
  }
  
}


// show signal characters as text on the canvas
function showSignalOnScreen() {
  let txt_shift, offset_y, txt_size, txt_box_width, txt_box_height;
  let color_a, color_b, color_c;

  let animation_state = frame_counter % 10 < 6;

  // switch pink and cyan depending on the frame
  if (animation_state) { color_a = color(255, 0, 255); color_b = color(0, 255, 255); }
  else { color_a = color(0, 255, 255); color_b = color(255, 0, 255); }
  color_c = color(255, 255, 255);

  textFont("Arial");
  textAlign(CENTER, CENTER);
  textWrap(CHAR);
  rectMode(CENTER);
  noStroke();

  txt_size = 3;
  txt_shift = 0.2;
  offset_y = 0;
  txt_box_width = width - width / 15;
  txt_box_height = height - width / 15;

  showTextBox(signal, width / 2, height / 2, txt_size, txt_shift, offset_y, txt_box_width, txt_box_height, color_a, color_b, color_c);

  // reset rectMode
  rectMode(CORNER);
}


// shows controls info as text on the canvas
function showControlInfo() {
  let txt_size, txt_shift, controls_info_txt;
  let color_a, color_b, color_c;

  let animation_state = frame_counter % 10 < 6;

  // switch pink and cyan depending on the frame
  if (animation_state) { color_a = color(255, 0, 255); color_b = color(0, 255, 255); }
  else { color_a = color(0, 255, 255); color_b = color(255, 0, 255); }
  color_c = color(255, 255, 255);

  textFont(manaspace);
  textAlign(LEFT, BOTTOM);
  noStroke();

  txt_size = 4;
  txt_shift = 0.2;

  if (frame_counter % 20 < 13) {controls_info_txt = "CONTROLS\n<> : -+ quality\n`^ : -+ quantization\nclick : -+ square\nb : cycle border\nc : show/hide signal\nredrop : new image\nrefresh : fix image";}
  else {controls_info_txt = "CONTROLS\n<> : -+ quality\n`^ : -+ quantization\nclick : -+ square\nb : cycle border\nc : show/hide signal\nredrop : new image\n";}
  
  showText(controls_info_txt, width / 30, height - width / 30, txt_size, txt_shift, 0, color_a, color_b, color_c)
}


// shows load info as text on the canvas
function showAfterImageLoad() {
  let txt_size, txt_shift, loading_txt;
  let color_a, color_b, color_c;

  let animation_state = frame_counter % 10 < 6;

  // switch pink and cyan depending on the frame
  if (animation_state) { color_a = color(255, 0, 255); color_b = color(0, 255, 255); }
  else { color_a = color(0, 255, 255); color_b = color(255, 0, 255); }
  color_c = color(255, 255, 255);

  textFont(manaspace);
  textAlign(CENTER, CENTER);
  noStroke();

  txt_size = 6;
  txt_shift = 0.4;
  loading_txt = "image loaded!\n\ncropped + resized + centered\n\n" + target_dim[0].toString() + " x " + target_dim[1].toString() + " pix";

  showText(loading_txt, width / 2, height / 2, txt_size, txt_shift, 0, color_a, color_b, color_c)
}


// show stylized text on the canvas
function showText(txt, x, y, txt_size, txt_shift, offset_y, color_a, color_b, color_c) {
  let text_size_adjusted = txt_size * Math.floor(thumbnail_scale);
  let txt_shift_adjusted = txt_shift * Math.floor(thumbnail_scale);

  textSize(text_size_adjusted);
  fill(color_a);
  text(txt, x + txt_shift_adjusted * 2, y + txt_shift_adjusted * 2 + offset_y);
  fill(color_b);
  text(txt, x + txt_shift_adjusted, y + txt_shift_adjusted + offset_y);
  fill(color_c);
  text(txt, x, y + offset_y);
}


// show stylized text on the canvas with a bounding box
function showTextBox(txt, x, y, txt_size, txt_shift, offset_y, txt_box_width, txt_box_height, color_a, color_b, color_c) {
  let text_size_adjusted = txt_size * Math.floor(thumbnail_scale);
  let txt_shift_adjusted = txt_shift * Math.floor(thumbnail_scale);

  textSize(text_size_adjusted);
  fill(color_a);
  text(txt, x + txt_shift_adjusted * 2, y + txt_shift_adjusted * 2 + offset_y, txt_box_width, txt_box_height);
  fill(color_b);
  text(txt, x + txt_shift_adjusted, y + txt_shift_adjusted + offset_y, txt_box_width, txt_box_height);
  fill(color_c);
  text(txt, x, y + offset_y, txt_box_width, txt_box_height);
}


// callback to receive the loaded file
function gotFile(file) {
  // save file reference to a global variable so it can be accessed elsewhere
  dropped_file = file;

  // need to use a callback here to wait until the image is properly loaded before we use it
  // from: https://github.com/processing/p5.js/issues/3117
  thumbnail = loadImage(dropped_file.data, resizeThumbnailAndSerialize);
  // more data to display: dropped_file.name, dropped_file.size

  // reset the frame counter for every image drop
  frame_counter_after_drop = 0;
}


// triggered when we drag a file over the canvas to drop it
function highlightDrop() {
  drop_zone_x = Math.floor(mouseX / (width / 3)) + 1;
  drop_zone_y = Math.floor(mouseY / (height / 4));
  // drop_zone equals drop_zone_x if drop_zone_y is "middle" of the screen, otherwise it's zero
  drop_zone = ((drop_zone_y == 1) || (drop_zone_y == 2)) ? drop_zone_x : 0;

  // if the mouse is close to the edge of the canvas, drop_zone is 0
  if ((mouseX > width - 50) || (mouseX < 50)) { drop_zone = 0; }
}


// triggered when we finish dragging the file over the canvas to drop it
function unhighlightDrop() {
}


// callback triggered when files are dropped onto the canvas (acts like a loading screen)
function dropped() {
  let color_a, color_b, color_c;

  // turn off showing the drop screen
  drop_screen = false;

  let animation_state = frame_counter % 10 < 6;

  // switch pink and cyan depending on the frame
  if (animation_state) { color_a = color(255, 0, 255); color_b = color(0, 255, 255); }
  else { color_a = color(0, 255, 255); color_b = color(255, 0, 255); }
  color_c = color(255, 255, 255);

  background(0);

  textFont(manaspace);
  textAlign(CENTER, CENTER);
  noStroke();

  let txt_size = 6;
  let txt_shift = 0.4;
  let loading_txt = "compressing image ...";

  showText(loading_txt, width / 2, height / 2, txt_size, txt_shift, 0, color_a, color_b, color_c)
}




////// SIGNAL AND JPG COMPRESSION //////


// draws pixels from 8x8 square using scaled rectangles
function draw_data(pixelvalues, pixel_dim, offset_x, offset_y, offset_rgb) {
  noStroke();
  rectMode(CORNER);

  for (let i = 0; i < pixelvalues.length; i++) {
    for (let j = 0; j < pixelvalues[0].length; j++) {
      fill(pixelvalues[i][j] + offset_rgb[0], pixelvalues[i][j] + offset_rgb[1], pixelvalues[i][j] + offset_rgb[2]);
      rect(i * pixel_dim + offset_x, j * pixel_dim + offset_y, pixel_dim, pixel_dim);
    }
  }
}


// draws pixels from an image using scaled rectangles
function draw_image(img, scale) {
  noStroke();
  rectMode(CORNER);
  img.loadPixels();

  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      let clr = getColorAtIndex(img, x, y);
      fill(clr);
      rect(x * scale, y * scale, scale, scale);
    }
  }
}


// shows the contents of the 2D tables (data) in the console
function plot_data(data) {
  for (let i = 0; i < data.length; i++) {
    let data_row = "";
    for (let j = 0; j < data[0].length; j++) {
      data_row += data[i][j].toFixed(2) + "\t";
    }
    console.log(data_row);
  }
}


// discrete cosine transform
// from: https://github.com/MatthiasLiszt/discreteCosineTransformOnImages/blob/master/dct2d.js
function dcTransform(img) {
  img.loadPixels();
  let index = 0;
  const pi = Math.PI;
  const cos45 = 1 / (2 ** 0.5);
  const localSquare = [];

  for (let u = 0; u < 8; ++u) {
    const localSquare_row = [];

    for (let v = 0; v < 8; ++v) {
      let summe = 0;
      for (let x = 0; x < 8; ++x) {
        for (let y = 0; y < 8; ++y) {
          const pixelcolor = red(getColorAtIndex(img, x, y)) - 128;
          const part1 = Math.cos((2 * x + 1) * u * pi / 16);
          const part2 = Math.cos((2 * y + 1) * v * pi / 16);
          summe += pixelcolor * part1 * part2;
        }
      }
      const cu = u == 0 ? cos45 : 1;
      const cv = v == 0 ? cos45 : 1;
      let value = Math.floor(summe * cu * cv * 0.25 * 100) / 100;

      localSquare_row.push(value);
    }
    localSquare.push(localSquare_row);
  }
  ++index;

  return localSquare;
}


// discrete cosine transform inverse
// from: https://github.com/MatthiasLiszt/discreteCosineTransformOnImages/blob/master/dct2d.js
function dcTransformInverse(data) {
  const undone = [];
  let index = 0;
  const pi = Math.PI;
  const cos45 = 1 / (2 ** 0.5);
  const localSquare = [];

  for (let x = 0; x < 8; ++x) {
    const localSquare_row = [];

    for (let y = 0; y < 8; ++y) {
      let summe = 0;
      for (let u = 0; u < 8; ++u) {
        for (let v = 0; v < 8; ++v) {
          const pixelcolor = data[u][v];
          const part1a = (2 * x + 1) * u * pi / 16;
          const part2a = (2 * y + 1) * v * pi / 16;
          const cu = u == 0 ? cos45 : 1;
          const cv = v == 0 ? cos45 : 1;
          const part = Math.cos(part1a) * Math.cos(part2a) * pixelcolor * cu * cv;
          summe += part;
        }
      }
      let value = Math.floor(0.25 * summe + 128);

      localSquare_row.push(value);
    }
    localSquare.push(localSquare_row);
  }
  ++index;

  return localSquare;
}


// selects a number of (aboslute) largest coefficients and sets the rest to zero
function select_coefficients(coefficients, top_nr) {
  let list_of_coefficients = [];
  let selected_coefficients = [];

  for (let x = 0; x < coefficients.length; x++) {
    let selected_coefficients_row = []
    for (let y = 0; y < coefficients[0].length; y++) {
      // create a flat list of tuples with absolute coefficients, original coefficients, and their position in the gird
      // we will use this list later for sorting coefficients according to their absolute value
      list_of_coefficients.push([Math.abs(coefficients[x][y]), coefficients[x][y], x, y]);

      // at the same time, create selected_coefficients table and fill it with zeros
      selected_coefficients_row.push(0);
    }
    selected_coefficients.push(selected_coefficients_row);
  }

  // sort according to the first element in the sublist - performs standard number sorting, not lexicographical sorting which is default in JavaScript
  list_of_coefficients.sort(function (a, b) { return a[0] - b[0] });
  list_of_coefficients.reverse();

  // assign one of the top (absolute largest) coefficients to the selected_coefficients table, do this for top_nr of them, and leave all the rest at zero
  for (let i = 0; i < top_nr; i++) {
    let top_coefficient = list_of_coefficients[i][1];
    let grid_x = list_of_coefficients[i][2];
    let grid_y = list_of_coefficients[i][3];

    // assign the coefficent to its appropriate place in the grid
    selected_coefficients[grid_x][grid_y] = top_coefficient;
  }

  return selected_coefficients;
}


// get a long string with all characters that can be used to map the signal later
// this function was suggested by ChatGPT
function getCharBlockFromRanges(code_point_ranges) {
  var charBlock = "";

  for (range of code_point_ranges) {
    for (let i = range[0]; i <= range[1]; i++) {
      const character = String.fromCodePoint(i);
      charBlock += character;
    }
  }

  return charBlock;
}


// get an array of unicode characters
function getCharacterArray(first_char, number) {
  let charArray = [];

  for (let i = first_char; i < first_char + number; i++) {
    const character = String.fromCodePoint(i);
    charArray.push(character);
  }

  return charArray;
}


// calculates how many quantization levels are there for every pixel in 8x8 square
function calculateQuantizationLevels(quant_table, coefficients_delta, buffer) {
  let quant_levels_table = [];
  for (let x = 0; x < quant_table[0].length; x++) {
    let quant_levels_row = [];
    for (let y = 0; y < quant_table.length; y++) {
      quant_levels = Math.round(coefficients_delta / quant_table[x][y]) + buffer;
      quant_levels_row.push(quant_levels);
    }
    quant_levels_table.push(quant_levels_row);
  }
  return quant_levels_table;
}


// applies quantization to coefficients - they are stored like this in the signal
function quantizeCoefficients(coefficients, quant_table, quant_f) {
  for (let x = 0; x < coefficients[0].length; x++) {
    for (let y = 0; y < coefficients.length; y++) {
      let quantized_coefficient = Math.round(coefficients[x][y] / (quant_table[x][y] * quant_f));
      coefficients[x][y] = quantized_coefficient;
    }
  }
  return coefficients;
}


// returns original coefficients (lossy) so they can be used to calculate pixel values
function dequantizeCoefficients(coefficients, quant_table, quant_f) {
  for (let x = 0; x < coefficients[0].length; x++) {
    for (let y = 0; y < coefficients.length; y++) {
      let quantized_coefficient = coefficients[x][y] * quant_table[x][y] * quant_f;
      coefficients[x][y] = quantized_coefficient;
    }
  }
  return coefficients;
}


// returns character to coefficient maps used for storing coefficient values into string params
function calculateCoefficientMaps(quant_levels_table, charBlock) {
  let charToCoeffMap = {}; // unicode character -> quantized coefficient
  let coeffToCharMap = {}; // quantized coefficient -> unicode character

  let char_counter = 0;
  for (let x = 0; x < quant_levels_table[0].length; x++) {
    for (let y = 0; y < quant_levels_table.length; y++) {
      let level_half = Math.round(quant_levels_table[x][y] / 2);
      for (let level = 0; level < quant_levels_table[x][y]; level++) {

        let coeff = level - level_half; // shift to make quantized levels go negative as well

        // turn JSON into a string with JSON.stringify(object), turn string back into JSON with JSON.parse(string)
        let coeffJSON = { "x": x, "y": y, "coeff": coeff };

        charToCoeffMap[charBlock.charAt(char_counter)] = coeffJSON;
        coeffToCharMap[JSON.stringify(coeffJSON)] = charBlock.charAt(char_counter);

        char_counter++
      }
    }
  }
  //console.log("total characters in map ->", char_counter);
  return [charToCoeffMap, coeffToCharMap];
}


// input coefficients, get string param (signal part)
function serializeCoefficients(coefficients, coeffToCharMap, string_size, repeatingBufferChars) {
  let string_params = "";

  for (let x = 0; x < coefficients[0].length; x++) {
    for (let y = 0; y < coefficients.length; y++) {
      if (coefficients[x][y] == 0) { continue; } // early termination, we skip zero coefficients
      let coeffJSON = { "x": x, "y": y, "coeff": coefficients[x][y] };
      let character = coeffToCharMap[JSON.stringify(coeffJSON)];
      string_params += character;
    }
  }

  // insert a special character indicating the number of missing coefficients at the end
  if (string_params.length < string_size) {
    string_params += repeatingBufferChars[string_size - string_params.length - 1];
  }

  return string_params;
}


// input string param (signal part), get coefficients and wheather the square is transparent or not
function deserializeCoefficients(coeff_string, charToCoeffMap, bufferChar, alphaChar) {
  let coefficients = [];
  let alpha_on = false; // by default, the square is opaque

  // initialize all coefficients at zero
  for (let x = 0; x < 8; x++) {
    let coefficients_row = []
    for (let y = 0; y < 8; y++) {
      coefficients_row.push(0);
    }
    coefficients.push(coefficients_row);
  }

  // iterate through all characters in the string (max 10), extract coefficient json data and assign it to the coefficients table
  for (let i = 0; i < coeff_string.length; i++) {
    if (coeff_string.charAt(i) == bufferChar) { continue; } // early termination, we skip buffer characters and leave them at zero
    if (coeff_string.charAt(i) == alphaChar) { alpha_on = true; continue; } // early termination, if we encounter alphaChar we set a flag to indicate the square will not be drawn
    let coeffJSON = charToCoeffMap[coeff_string.charAt(i)];
    coefficients[coeffJSON["x"]][coeffJSON["y"]] = coeffJSON["coeff"];
  }

  return [alpha_on, coefficients];
}


// decompress signal so it can be used to draw the image
function decompressSignal(signal, repeatingBufferChars, repeatingAlphaChars) {
  let decompressed_signal = "";
  let char_idx;

  for (let i = 0; i < signal.length; i++) {

    // test if the character is one of the buffer characters
    if (repeatingBufferChars.includes(signal.charAt(i))) {
      char_idx = repeatingBufferChars.indexOf(signal.charAt(i));
      // index of the buffer character in the repeatingBufferChars tells us now many times bufferChar needs to be repeated
      for (let n = 0; n < char_idx + 1; n++) {
        decompressed_signal += bufferChar;
      }

      // test if the character is one of the alpha characters
    } else if (repeatingAlphaChars.includes(signal.charAt(i))) {
      char_idx = repeatingAlphaChars.indexOf(signal.charAt(i));
      // index of the alpha character in the repeatingAlphaChars tells us now many times alphaChar needs to be repeated
      for (let n = 0; n < char_idx + 1; n++) {
        decompressed_signal += alphaChar;
      }

      // character is not one of the buffer characters, add it to the signal normally
    } else {
      decompressed_signal += signal.charAt(i);
    }
  }

  return decompressed_signal;
}


// compress signal so it can be stored as a string param
function compressSignal(signal, repeatingBufferChars, repeatingAlphaChars) {
  let compressed_signal = signal;
  let filter;

  // for every number of repeating buffer characters, create a regex to replace them with a single character from repeatingBufferChars list
  // we iterate from the larger number of repetitions to the smaller number, because... well, think about it
  for (let num = 9; num > 1; num--) {
    // constructing regex of the form /黑{num}/g - global replacement (every occurance)
    filter = new RegExp(bufferChar + '{' + num + '}', 'g');
    // replace the repeating buffer characters with a single character from repeatingBufferChars list 
    compressed_signal = compressed_signal.replace(filter, repeatingBufferChars[num - 1]);
  }

  // find number of occurances of alphaChar in the signal
  // this will be the maximum number of alpha characters that can be compressed
  filter = new RegExp(alphaChar, 'g');
  let alpha_occurances = (compressed_signal.match(filter) || []).length;

  // for every number of repeating alpha characters, create a regex to replace them with a single character from repeatingAlphaChars list
  // we iterate from the larger number of repetitions to the smaller number, same as above
  for (let num = alpha_occurances; num > 1; num--) {
    // constructing regex of the form /门{num}/g - global replacement (every occurance)
    filter = new RegExp(alphaChar + '{' + num + '}', 'g');
    // replace the repeating alpha characters with a single character from repeatingAlphaChars list 
    compressed_signal = compressed_signal.replace(filter, repeatingAlphaChars[num - 1]);
  }

  return compressed_signal;
}


// deserializes and draws the image from the signal string param
function deserializeSignal(signal) {
  let coefficients, pixelvalues, alpha_on;

  // serialized signal will be compressed and needs to be decompressed before deserialization
  signal = decompressSignal(signal, repeatingBufferChars, repeatingAlphaChars);

  let square_counter = 0;
  for (let i = 0; i < squares_nr[0]; i++) {
    for (let j = 0; j < squares_nr[1]; j++) {

      let start_idx = square_counter * quality;
      let end_idx = start_idx + quality;
      let coeff_string = signal.substring(start_idx, end_idx);

      [alpha_on, coefficients] = deserializeCoefficients(coeff_string, charToCoeffMap, bufferChar, alphaChar);

      // if alpha_on == false, draw the square on canvas, otherwise it will be skipped
      if (!alpha_on) {
        coefficients = dequantizeCoefficients(coefficients, jpeg_lum_quant_table, quant_f);
        pixelvalues = dcTransformInverse(coefficients);
        draw_data(pixelvalues, thumbnail_scale, i * 8 * thumbnail_scale + (canvas_dim[0] * image_border[0])/2, j * 8 * thumbnail_scale + (canvas_dim[1] * image_border[1])/2, offset_rgb); // pixels, pixel dim, offset x, offset y, offset_rgb
      }

      square_counter++
    }
  }
}


// deserializes and outputs the image from the signal string param
function deserializeSignalToImage(signal) {
  let coefficients, pixelvalues, alpha_on;

  let buffer_frame = createGraphics(output_dim[0], output_dim[1]);

  // serialized signal will be compressed and needs to be decompressed before deserialization
  signal = decompressSignal(signal, repeatingBufferChars, repeatingAlphaChars);

  let square_counter = 0;
  for (let i = 0; i < squares_nr[0]; i++) {
    for (let j = 0; j < squares_nr[1]; j++) {

      let start_idx = square_counter * quality;
      let end_idx = start_idx + quality;
      let coeff_string = signal.substring(start_idx, end_idx);

      [alpha_on, coefficients] = deserializeCoefficients(coeff_string, charToCoeffMap, bufferChar, alphaChar);

      // if alpha_on == false, draw the square on canvas, otherwise it will be skipped
      if (!alpha_on) {
        coefficients = dequantizeCoefficients(coefficients, jpeg_lum_quant_table, quant_f);
        pixelvalues = dcTransformInverse(coefficients);

        buffer_frame.noStroke();
        buffer_frame.rectMode(CORNER);
      
        let pixel_dim = output_scale;
        let offset_x = i * 8 * output_scale;
        let offset_y = j * 8 * output_scale;

        for (let n = 0; n < pixelvalues.length; n++) {
          for (let m = 0; m < pixelvalues[0].length; m++) {
            buffer_frame.fill(pixelvalues[n][m], pixelvalues[n][m], pixelvalues[n][m]);
            buffer_frame.rect(n * pixel_dim + offset_x, m * pixel_dim + offset_y, pixel_dim, pixel_dim);
          }
        }

        // for reference, function that draws the square of pixels
        //draw_data(pixelvalues, thumbnail_scale, i * 8 * thumbnail_scale, j * 8 * thumbnail_scale, offset_rgb); // pixels, pixel dim, offset x, offset y, offset_rgb
      }

      square_counter++
    }
  }

  return buffer_frame;
}


// serializes the image and returns the signal string param, updates all params
function serializeSignal(thumbnail) {
  let coefficients, pixelvalues;

  // magenta background here to avoid the canvas glitching while we change compression parameters with keys during editing phase
  background(255, 0, 255);

  // characters for the image coefficients will be stored here
  signal = "";

  for (let i = 0; i < squares_nr[0]; i++) {
    for (let j = 0; j < squares_nr[1]; j++) {

      let thumbnail_square = createImage(8, 8);
      thumbnail_square.copy(thumbnail, i * 8, j * 8, thumbnail.width, thumbnail.height, 0, 0, thumbnail.width, thumbnail.height);

      coefficients = dcTransform(thumbnail_square);
      coefficients = select_coefficients(coefficients, quality); // quality corresponds to the number of coefficients chosen, the higher the better
      coefficients = quantizeCoefficients(coefficients, jpeg_lum_quant_table, quant_f);

      // serialized coefficients will be compressed and need to be decompressed after before deserialization
      signal += serializeCoefficients(coefficients, coeffToCharMap, quality, repeatingBufferChars);

      coefficients = dequantizeCoefficients(coefficients, jpeg_lum_quant_table, quant_f);
      pixelvalues = dcTransformInverse(coefficients);

      // we only draw the image here to avoid the canvas going black / glitching while we change compression parameters with keys during editing phase
      draw_data(pixelvalues, thumbnail_scale, i * 8 * thumbnail_scale + (canvas_dim[0] * image_border[0])/2, j * 8 * thumbnail_scale + (canvas_dim[1] * image_border[1])/2, offset_rgb); // pixels, pixel dim, offset x, offset y, offset_rgb
    }
  }

  console.log("image characters total ->", signal.length);
  console.log(signal);

  // update the parameter values
  $fx.emit("params:update", {
    signal: signal,
    quality: quality,
    quant_f: quant_f,
    format: format,
  });
}


// crop, resize and serialize the droped image to the right proportion, then serialize signal
function resizeThumbnailAndSerialize(thumbnail) {
  // based on the image drop zone, choose the canvas format

  // square format
  if (drop_zone == 1) {
    format = "square";
    squares_nr = [20, 20];

    // portrait format
  } else if (drop_zone == 2) {
    format = "portrait";
    squares_nr = [16, 25];

    // landscape format
  } else if (drop_zone == 3) {
    format = "landscape";
    squares_nr = [25, 16];
  }

  // reset drop_zone so we can re-drop an image later
  drop_zone = 0;

  // recalculate dimensions
  w_h_ratio = squares_nr[0] / squares_nr[1];
  target_dim = [squares_nr[0] * 8, squares_nr[1] * 8];

  if (windowWidth / windowHeight < w_h_ratio) {
    thumbnail_scale = windowWidth / (target_dim[0] + target_dim[0] * image_border[0]);
  } else {
    thumbnail_scale = windowHeight / (target_dim[1] + target_dim[1] * image_border[1]);
  }

  canvas_dim = [target_dim[0] * thumbnail_scale, target_dim[1] * thumbnail_scale];

  // resize canvas so it fits into the browser window
  if (windowWidth / windowHeight < w_h_ratio) {
    resizeCanvas(windowWidth, windowWidth / w_h_ratio);
  } else {
    resizeCanvas(windowHeight * w_h_ratio, windowHeight);
  }

  // move canvas to the middle of the browser window
  select('canvas').position((windowWidth - width) / 2, (windowHeight - height) / 2);

  // cropping portrait, square and landscape formats into the right proportion
  if (thumbnail.width / thumbnail.height < w_h_ratio) {
    thumbnail = thumbnail.get(0, (thumbnail.height - thumbnail.width / w_h_ratio) / 2, thumbnail.width, thumbnail.width / w_h_ratio);
  } else {
    thumbnail = thumbnail.get((thumbnail.width - thumbnail.height * w_h_ratio) / 2, 0, thumbnail.height * w_h_ratio, thumbnail.height);
  }

  // resizing uniformly to a target dimension
  thumbnail.resize(target_dim[0], 0);

  // additional flag for when thumbnail is ready for use
  thumbnail_ready = true;

  // serializes and draws the image
  serializeSignal(thumbnail);

}




////// INPUT EVENTS //////


// called once every time a mouse button is clicked
function mouseClicked() {

  // early termination - exit function if the click is outside the canvas
  if ((mouseX > width) || (mouseY > height) || (mouseX < 0) || (mouseY < 0)) { return false; }

  // early termination - exit function if the click is inside the image border
  if ((mouseX > width - (canvas_dim[0] * image_border[0])/2) || (mouseY > height - (canvas_dim[1] * image_border[1])/2) || (mouseX < (canvas_dim[0] * image_border[0])/2) || (mouseY < (canvas_dim[1] * image_border[1])/2)) { return false; }

  // clicking on the era screen
  if (era_screen) {
    era_screen = false; // turning off era screen
    drop_screen = true; // turning on drop screen

    era_zone = getEra(); // get the currently selected era (mouse hover)
    effect_era = era_zone == 1 ? "'80s" : "'90s";

    $fx.emit("params:update", {
      effect_era: effect_era,
    });
  }

  // selecting transparent squares on the image
  // works only if the thumbnail was already loaded (during editing phase)
  if (thumbnail != undefined) {
    // serialized signal will be compressed and needs to be decompressed before deserialization
    signal = decompressSignal(signal, repeatingBufferChars, repeatingAlphaChars);

    // detect which square was clicked on
    let square_x_nr = Math.floor((mouseX - (canvas_dim[0] * image_border[0])/2) / (8 * thumbnail_scale));
    let square_y_nr = Math.floor((mouseY - (canvas_dim[1] * image_border[1])/2) / (8 * thumbnail_scale));

    // flash an X on the location of the square
    let txt_shift = 0.4 * Math.floor(thumbnail_scale);
    let txt_size = 10 * Math.floor(thumbnail_scale)
    textFont(manaspace);
    textAlign(CENTER, CENTER);
    noStroke();
    textSize(txt_size);
    
    fill(255, 0, 255);
    text("x", (canvas_dim[0] * image_border[0])/2 + square_x_nr * 8 * thumbnail_scale + 4 * thumbnail_scale + txt_shift * 2, (canvas_dim[1] * image_border[1])/2 + square_y_nr * 8 * thumbnail_scale + 3 * thumbnail_scale + txt_shift * 2);
    fill(0, 255, 255);
    text("x", (canvas_dim[0] * image_border[0])/2 + square_x_nr * 8 * thumbnail_scale + 4 * thumbnail_scale + txt_shift, (canvas_dim[1] * image_border[1])/2 + square_y_nr * 8 * thumbnail_scale + 3 * thumbnail_scale + txt_shift);
    fill(255, 255, 255);
    text("x", (canvas_dim[0] * image_border[0])/2 + square_x_nr * 8 * thumbnail_scale + 4 * thumbnail_scale, (canvas_dim[1] * image_border[1])/2 + square_y_nr * 8 * thumbnail_scale + 3 * thumbnail_scale);

    // find the place in the signal where the coefficients for this square are
    let start_idx = square_x_nr * quality * squares_nr[1] + square_y_nr * quality;
    let end_idx = start_idx + quality;
    let square_coords = { start: start_idx, end: end_idx };

    // insert repeating alpha characters into the signal
    let signal_before = signal.slice(0, start_idx);
    let signal_after = signal.slice(end_idx);
    let signal_clicked = signal.slice(start_idx, end_idx);

    // clicked on the already transparent square
    if (signal_clicked == alphaChar.repeat(quality)) {
      // retrieve previous part of the signal stored after the first click
      let previous_signal_clicked = alphaSquaresToSignalMap[JSON.stringify(square_coords)];
      // insert original signal part back
      signal = signal_before + previous_signal_clicked + signal_after;

      // clicked on the square with an image on it
    } else {
      // create a new entry in the map to save the part of the signal which will be overwritten into repeating alpha characters
      alphaSquaresToSignalMap[JSON.stringify(square_coords)] = signal_clicked;
      // insert repeating alpha characters
      signal = signal_before + alphaChar.repeat(quality) + signal_after;
    }

    // show some data in the console
    decompressed_signal_size = signal.length;

    // compress signal again before storing in the param
    signal = compressSignal(signal, repeatingBufferChars, repeatingAlphaChars);

    // show some data in the console
    compressed_signal_size = signal.length;
    compression_ratio = compressed_signal_size / decompressed_signal_size;
    console.log(signal);

    // update the signal parameter value
    // NOTE: this will trim the signal to maxLength if it's too long
    $fx.emit("params:update", {
      signal: signal,
    });
  }

  // prevent any default behavior from the browser
  return false;
}


// called once every time a key is pressed
function keyPressed() {

  // press any key to switch from start to era screen
  if (start_screen) {
    era_screen = true;
    start_screen = false; // this will never become true again
  }


  if (keyCode === LEFT_ARROW) {

    // if the thumbnail was already loaded (during editing phase)
    if (thumbnail != undefined) {
      quality--
      quality = clamp(quality, 1, 10);

      // serializes and draws the image
      resizeThumbnailAndSerialize(thumbnail);
    }

    // works only if effects are applied, not during image editing
    if ((signal.length != 0) && (thumbnail == undefined)) {
      output_scale--
      output_scale = clamp(output_scale, 1, 10);
      output_dim = [target_dim[0] * output_scale, target_dim[1] * output_scale];

      console.log("output scale -> " + output_scale.toString());

      if (border_type == "none") { output_border = [0, 0]; }  // no border
      else if (border_type == "thin") { output_border = [10 * output_scale, 10 * output_scale]; } // thin border
      else { output_border = [20 * output_scale, 20 * output_scale]; } // thick border

      resizeCanvas(output_dim[0] + output_border[0], output_dim[1] + output_border[1]);
      select('canvas').position((windowWidth - width) / 2, (windowHeight - height) / 2); // move canvas to the middle of the browser window
  
      // deserialize signal data into an input image - this is the starting point for all effect stacks
      input_img = deserializeSignalToImage(signal);

      // inverts the colors of the input image
      if (invert_input) {input_img.filter(INVERT);}

      // create 5 frame animation using one of the effect stacks
      animateEffectStack(input_img, stack_data_main, stack_data_background, false);
    }

  } else if (keyCode === RIGHT_ARROW) {

    // if the thumbnail was already loaded (during editing phase)
    if (thumbnail != undefined) {
      quality++
      quality = clamp(quality, 1, 10);

      // serializes and draws the image
      resizeThumbnailAndSerialize(thumbnail);
    }

    // works only if effects are applied, not during image editing
    if ((signal.length != 0) && (thumbnail == undefined)) {
      output_scale++
      output_scale = clamp(output_scale, 1, 10);
      output_dim = [target_dim[0] * output_scale, target_dim[1] * output_scale];

      console.log("output scale -> " + output_scale.toString());

      if (border_type == "none") { output_border = [0, 0]; }  // no border
      else if (border_type == "thin") { output_border = [10 * output_scale, 10 * output_scale]; } // thin border
      else { output_border = [20 * output_scale, 20 * output_scale]; } // thick border

      resizeCanvas(output_dim[0] + output_border[0], output_dim[1] + output_border[1]);
      select('canvas').position((windowWidth - width) / 2, (windowHeight - height) / 2); // move canvas to the middle of the browser window
  
      // deserialize signal data into an input image - this is the starting point for all effect stacks
      input_img = deserializeSignalToImage(signal);

      // inverts the colors of the input image
      if (invert_input) {input_img.filter(INVERT);}

      // create 5 frame animation using one of the effect stacks
      animateEffectStack(input_img, stack_data_main, stack_data_background, false);
    }

  } else if (keyCode === UP_ARROW) {

    // if the thumbnail was already loaded (during editing phase)
    if (thumbnail != undefined) {
      quant_f++
      quant_f = clamp(quant_f, 1, 10);

      // serializes and draws the image
      resizeThumbnailAndSerialize(thumbnail);
    }

  } else if (keyCode === DOWN_ARROW) {

    // if the thumbnail was already loaded (during editing phase)
    if (thumbnail != undefined) {
      quant_f--
      quant_f = clamp(quant_f, 1, 10);

      // serializes and draws the image
      resizeThumbnailAndSerialize(thumbnail);
    }

  } else if (keyCode === 66) { // "b" - cycle image border type

    // if the thumbnail was already loaded (during editing phase)
    if (thumbnail != undefined) {
      
      // cycle border type
      if (border_type == "none") {
        border_type = "thin"
        image_border = image_border_thin;

      } else if (border_type == "thin") {
        border_type = "thick"
        image_border = image_border_thick;

      } else {
        border_type = "none"
        image_border = image_border_none;
      }
      
      if (windowWidth / windowHeight < w_h_ratio) {
        thumbnail_scale = windowWidth / (target_dim[0] + target_dim[0] * image_border[0]);
      } else {
        thumbnail_scale = windowHeight / (target_dim[1] + target_dim[1] * image_border[1]);
      }

      canvas_dim = [target_dim[0] * thumbnail_scale, target_dim[1] * thumbnail_scale];

      // update the parameter values
      $fx.emit("params:update", {
        border_type: border_type
      });

      // resize canvas so it fits into the browser window
      if (windowWidth / windowHeight < w_h_ratio) {
        resizeCanvas(windowWidth, windowWidth / w_h_ratio);
      } else {
        resizeCanvas(windowHeight * w_h_ratio, windowHeight);
      }

      // move canvas to the middle of the browser window
      select('canvas').position((windowWidth - width) / 2, (windowHeight - height) / 2);
    }

  } else if (keyCode === 67) { // "c" - toggle signal characters as text on the canvas

    // if the thumbnail was already loaded (during editing phase)
    if (thumbnail != undefined) {
      display_signal = !display_signal;
    }

  } else if (keyCode === 71) { // "g" - save gif

    // works only if effects are applied, not during image editing
    if ((signal.length != 0) && (thumbnail == undefined)) {
      animateEffectStack(input_img, stack_data_main, stack_data_background, true);
    }

  } else if (keyCode === 83) { // "s" - save png

    // works only if effects are applied, not during image editing
    if ((signal.length != 0) && (thumbnail == undefined)) {
      const saveid = parseInt(Math.random() * 10000000);
      saveCanvas(canvas, `retro_digitizer_${effects_main_name}_still_${saveid}`, "png");
    }
  }

}


// called once every time the browser window is resized
function windowResized() {

  // canvas resize in case we are in the selection screens or image editing
  if (start_screen || era_screen || drop_screen || (thumbnail != undefined)) {

    if (windowWidth / windowHeight < w_h_ratio) {
      thumbnail_scale = windowWidth / (target_dim[0] + target_dim[0] * image_border[0]);
    } else {
      thumbnail_scale = windowHeight / (target_dim[1] + target_dim[1] * image_border[1]);
    }

    canvas_dim = [target_dim[0] * thumbnail_scale, target_dim[1] * thumbnail_scale];

    // resize canvas so it fits into the browser window
    if (windowWidth / windowHeight < w_h_ratio) {
      resizeCanvas(windowWidth, windowWidth / w_h_ratio);
    } else {
      resizeCanvas(windowHeight * w_h_ratio, windowHeight);
    }
  }

  // canvas resize in case effects are displayed
  if ((signal.length != 0) && (thumbnail == undefined)) {
    
  }

  // move canvas to the middle of the browser window
  select('canvas').position((windowWidth - width) / 2, (windowHeight - height) / 2);

}