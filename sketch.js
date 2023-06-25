/*
    ____  ________________  ____                                
   / __ \/ ____/_  __/ __ \/ __ \                               
  / /_/ / __/   / / / /_/ / / / /                               
 / _, _/ /___  / / / _, _/ /_/ /                                
/_/ |_/_____/ /_/_/_/_|_|\____/___________________   __________ 
              / __ \/  _/ ____/  _/_  __/  _/__  /  / ____/ __ \
             / / / // // / __ / /  / /  / /   / /  / __/ / /_/ /
            / /_/ // // /_/ // /  / / _/ /   / /__/ /___/ _, _/ 
           /_____/___/\____/___/ /_/ /___/  /____/_____/_/ |_|  
                                                                                                                  
R E T R O  D I G I T I Z E R  |  { p r o t o c e l l : l a b s }  |  2 0 2 3

*/

// Defining parameters

let img, input_img, input_img_2, input_img_3;
let frame_1, frame_2, frame_3, frame_4, frame_5;
let sortLength, randomColor, d, mixPercentage, pixelColor, colorHex;
let unsorted, sorted;
let gif, canvas;
let row, column;
let image_path;

let effects_stack_type; // Type of effects workflow to be used as a number
let effects_stack_names, effects_stack_name; // Type of effects workflow to be used as a string
let image_border; // Width of the border in pixels, [76, 76]
let frame_duration; // In mms
let output_type; // Type of output, "png", "gif"

let blackValue; // Pixels darker than this will not be sorted, max is 100
let brigthnessValue; // Value for sorting pixels according to brightness
let whiteValue; // Pixels lighter than this will not be sorted, max is 100
let sorting_mode; // Pixel sorting color mode, 0 -> black, 1 -> bright, 2 -> white
let sorting_type; // Pixel sorting type, 0 -> chaotic, 1 -> proper
let sorting_order; // Determines order of sorting, 0 -> column, 1 -> row, 2 -> column-row, 3 -> row-column (there are exceptions to this notation, see Abstract workflow)
let color_noise_density; // Density of color noise (0-100)
let rand_color_bias_key; // JSON key for color noise bias parameters
let color_noise_bias; // Array which skews the rgb color values of the noise using this factor (0-1)
let color_noise_variation; // Variation of the color noise (10-10000)

let stripe_width; // Width of black stripes
let stripe_offset; // Offset of black stripes, note this cannot be bigger than stripe_width-1 !
let invert_stripes; // Inverts the striped pattern

let nr_of_levels; // Number of color levels for FS dithering, standard is 1
let contrast; // Set image contrast - 0.0 is no change
let new_brightness; // Set image brightness - 1.0 is no change
let contrast_delta, brightness_delta, delta_factor; // Ammount to change effect values between animation frames

let dither_group, dither_group_weights; // Number for the group of dither parameters to choose from
let rand_dither_key, rand_dither_key_2; // JSON key for dither error distribution parameters
let dither_params, dither_params_1, dither_params_2, dither_params_3; // Read error distribution parameters from a JSON file
let pix_scaling, pix_scaling_dark; // Scales the size of pixels when applying effects
let layer_shift; // Shift in x and y direction for every consecutive layer
let tint_palette_key; // JSON key for tint palette colors
let tint_palette; // RGB array with values for tinting, example three_bit_palette['magenta']
let tinting_mode; // Type of tinting selected, 0 is always no tinting

let mask_contrast; // Contrast value for the image when taking brightnessMask
let light_treshold; // Brightness treshold for the image when taking brightnessMask
let dark_treshold; // Brightness treshold for the image when taking brightnessMask
let invert_mask; // Invert brightnessMask




function preload() {

  image_border = [60, 60]; // width of the border in pixels
  frame_duration = 100; // in mms
  output_type = "png"; // "png", "gif"

  // SELECTION OF EFFECTS STACK
  // 0 -> mono - monochrome dither
  // 1 -> hi-fi - tinted dither
  // 2 -> noisy - color dither + pixel sorting
  // 3 -> corrupted - pixel sorting + color dither
  // 4 -> lo-fi - abstract dither

  effects_stack_names = ["mono", "hi-fi", "noisy", "corrupted", "lo-fi"]; // type of effects workflow to be used as a string
  effects_stack_weights = [ [0, 20], [1, 20], [2, 20], [3, 20], [4, 20] ]; // these represent probabilities for choosing an effects stack number [element, probability]
  effects_stack_type = gene_weighted_choice(effects_stack_weights); // type of effects workflow to be used as a number, 0-4
  effects_stack_type = 3; // override for the type of effects workflow to be used as a number, 0-4
  effects_stack_name = effects_stack_names[effects_stack_type]; // type of effects workflow to be used as a string

  // DEFINING THE PATH TO THE SOURCE IMAGE
  image_path = 'assets/jpg_thumbnail_test_nr03_10.png'
  input_img = loadImage(image_path);

}



function setup() {

  // ARTWORK GENERATION

  pixelDensity(1.0); // Need to fix this so the gif.js exports the correct size
  canvas = createCanvas(input_img.width + image_border[0], input_img.height + image_border[1]);
  background(0); // set black background for all images


  // THE MAIN EFFECT STACK SWITCH

  switch(effects_stack_type) {

    case 0: // mono

      // Custom stack params
      nr_of_levels = 1;
      contrast = 0.15;

      rand_dither_key_1 = gene_pick_key(dither_params_json);
      rand_dither_key_2 = gene_pick_key(extreme_dither_params_json);
      rand_dither_key_3 = gene_pick_key(dither_params_json);

      dither_params_1 = dither_params_json[rand_dither_key_1];
      dither_params_2 = extreme_dither_params_json[rand_dither_key_2];
      dither_params_3 = dither_params_json[rand_dither_key_3];

      pix_scaling = 2.0;
      layer_shift = 4;
      mask_contrast = 0.0;
      dark_treshold = 20;
      light_treshold = 80;
      invert_mask = false;
      tint_palette_key = gene_pick_key(three_bit_palette_reduced);
      tint_palette = three_bit_palette_reduced[tint_palette_key];
      // if tint color is white or green (these are very bright) then the size of dither pixels in darkest regions is smallest possible
      pix_scaling_dark = (tint_palette_key == 'white') || (tint_palette_key == 'green') ? 1.0 : pix_scaling * 2;

      new_brightness = 1.0; // brightness needs to increase at 50% rate of the contrast
      delta_factor = 0.5; // scaling animation effects
      contrast_delta = animation_params['contrast t1']; // values from this list will be added to the contrast for each frame
      brightness_delta = animation_params['brightness t1']; // values from this list will be added to the brightness for each frame

      generateOutput(input_img, applyMonochromeDither);

      break;

    case 1: // hi-fi

      // Custom stack params
      nr_of_levels = 1;
      contrast = 0.25;
      rand_dither_key_1 = gene_pick_key(dither_params_json);
      rand_dither_key_2 = gene_pick_key(dither_params_json);
      dither_params_1 = dither_params_json[rand_dither_key_1];
      dither_params_2 = dither_params_json[rand_dither_key_2];
      pix_scaling = 2.0;
      layer_shift = 4;
      mask_contrast = 0.25;
      light_treshold = 50;
      invert_mask = false;
      tint_palette_key = gene_pick_key(three_bit_palette);
      tint_palette = three_bit_palette[tint_palette_key];

      new_brightness = 1.0; // brightness needs to increase at 50% rate of the contrast
      delta_factor = 0.5; // scaling animation effects
      contrast_delta = animation_params['contrast t1']; // values from this list will be added to the contrast for each frame
      brightness_delta = animation_params['brightness t1']; // values from this list will be added to the brightness for each frame

      generateOutput(input_img, applyTintedDither);
      
      break;


    case 2: // noisy

      // Custom stack params
      blackValue = 10;
      brigthnessValue = 50;
      whiteValue = 70;

      sorting_mode = gene_rand_int(0, 3); // 0, 1, 2
      sorting_type = gene_rand_int(0, 2); // 0, 1
      sorting_order = gene_rand_int(0, 4); // 0, 1, 2, 3
      color_noise_density = 5;
      rand_color_bias_key = gene_pick_key(color_bias_palette);
      color_noise_bias = color_bias_palette[rand_color_bias_key];
      color_noise_variation = 10000;

      nr_of_levels = 1;
      contrast = 0.15;
      rand_dither_key_1 = gene_pick_key(dither_params_json);
      rand_dither_key_2 = gene_pick_key(dither_params_json);
      dither_params_1 = dither_params_json[rand_dither_key_1];
      dither_params_2 = dither_params_json[rand_dither_key_2];
      pix_scaling = 2.0;
      layer_shift = 4;
      mask_contrast = 0.25;
      light_treshold = 50;
      invert_mask = false;
      tinting_mode = gene_rand_int(0, 3); // 0, 1, 2

      new_brightness = 1.0; // brightness needs to increase at 50% rate of the contrast
      delta_factor = 0.5; // scaling animation effects
      contrast_delta = animation_params['contrast t1']; // values from this list will be added to the contrast for each frame
      brightness_delta = animation_params['brightness t1']; // values from this list will be added to the brightness for each frame

      generateOutput(input_img, applyDitherSorting);

      break;

    case 3: // corrupted

      // Custom stack params
      blackValue = 10;
      brigthnessValue = 50;
      whiteValue = 70;

      sorting_mode = gene_rand_int(0, 3); // 0, 1, 2
      sorting_type = gene_rand_int(0, 2); // 0, 1
      sorting_order = gene_rand_int(0, 4); // 0, 1, 2, 3
      color_noise_density = 5;
      rand_color_bias_key = gene_pick_key(color_bias_palette);
      color_noise_bias = color_bias_palette[rand_color_bias_key];
      color_noise_variation = 10000; //10000

      nr_of_levels = 1;
      contrast = 0.15; // 15
      rand_dither_key_1 = gene_pick_key(dither_params_json);
      rand_dither_key_2 = gene_pick_key(dither_params_json);
      dither_params_1 = dither_params_json[rand_dither_key_1];
      dither_params_2 = dither_params_json[rand_dither_key_2];
      pix_scaling = 2.0;
      layer_shift = 4;
      mask_contrast = 0.25;
      light_treshold = 50;
      invert_mask = false;
      tinting_mode = gene_rand_int(0, 3); // 0, 1, 2

      new_brightness = 1.0; // brightness needs to increase at 50% rate of the contrast
      delta_factor = 0.5; // scaling animation effects
      contrast_delta = animation_params['contrast t1']; // values from this list will be added to the contrast for each frame
      brightness_delta = animation_params['brightness t1']; // values from this list will be added to the brightness for each frame

      generateOutput(input_img, applySortingDither);

      break;


    case 4: // lo-fi

      // Custom stack params
      blackValue = 10;
      brigthnessValue = 50;
      whiteValue = 70;

      sorting_mode = 2; // this mode works best for this workflow
      sorting_type = gene_rand_int(0, 2); // 0, 1
      sorting_order = gene_rand_int(0, 3); // 0, 1, 2
      color_noise_density = 5;
      rand_color_bias_key = gene_pick_key(color_bias_palette);
      color_noise_bias = color_bias_palette[rand_color_bias_key];
      color_noise_variation = 10000;

      nr_of_levels = 1;
      contrast = 0.25;

      dither_group_weights = [ [0, 75], [1, 25] ]; // these represent probabilities for choosing a dither group number [element, probability]
      dither_group = gene_weighted_choice(dither_group_weights); // type of effects workflow to be used as a number, 0-4

      switch(dither_group) {
        case 0: // smaller pixels, less abstract, common
          rand_dither_key_1 = gene_pick_key(dither_params_json);
          dither_params_1 = dither_params_json[rand_dither_key_1];
          break;
        case 1: // larger pixels, more abstract, rare
          rand_dither_key_1 = gene_pick_key(extreme_dither_params_json);
          dither_params_1 = extreme_dither_params_json[rand_dither_key_1];
          break;
        default:
          break;
      }

      pix_scaling = dither_group == 0 ? 8.0 : 16.0; // larger dither pixels for extreme dither parameters
      layer_shift = 4;
      mask_contrast = 0.25;
      light_treshold = 50;
      invert_mask = false;
      tinting_mode = gene_rand_int(0, 3); // 0, 1, 2

      new_brightness = 1.0; // brightness needs to increase at 50% rate of the contrast
      delta_factor = 0.05; // scaling animation effects
      contrast_delta = animation_params['contrast t1']; // values from this list will be added to the contrast for each frame
      brightness_delta = animation_params['brightness t1']; // values from this list will be added to the brightness for each frame

      generateOutput(input_img, applyAbstractDither);

      break;


    default:
      break;

  }

  


  // Print some info to the console

  print('Effect stack: ', effects_stack_name);

  print('Dither error distribution 1: ', rand_dither_key_1);
  print('Dither error distribution 2: ', rand_dither_key_2);
  print('Source image path: ', image_path);

  print('Sorting mode: ', sorting_mode);
  print('Sorting type: ', sorting_type);
  print('Sorting order: ', sorting_order);

  print('Tint palette: ', tint_palette_key);
  print('Color noise bias: ', rand_color_bias_key);

}


// This code does not use function draw() {}
