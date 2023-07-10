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
let frame_to_draw, frames;
let buffer_width, buffer_height, buffer_frames;

let sortLength, randomColor, d, mixPercentage, pixelColor, colorHex;
let unsorted, sorted;
let gif, canvas;
let row, column;
let image_path;

let effects_stack_type; // Type of effects workflow to be used as a number
let effects_stack_names, effects_stack_name; // Type of effects workflow to be used as a string
let chosen_effect_function; // Function that applies the chosen effect stack
let image_border; // Width of the border in pixels, [76, 76]
let frame_duration; // In mms
let frame_rate; // Number of frames per second, calculated as 1000/frame_duration
let frame_counter; // Counts the frames for display in the browser

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



//////IMPORTED FROM JPG-PARAMS//////

// Discrete Cosine Transform code based on Matthias Liszt's "Discrete Cosine Transform On Images" repo
// from: https://github.com/MatthiasLiszt/discreteCosineTransformOnImages/blob/master/dct2d.js

let thumbnail;
let thumbnail_scale = 5;
let thumbnail_square;

let format = $fx.getParam("format"); // get format string from params
let squares_nr; // number of image squares, each one is 8x8 pixels
if (format == "portrait") {squares_nr = [16, 25];} // portrait proportion
else if (format == "landscape") {squares_nr = [25, 16];} // landscape proportion
else {squares_nr = [20, 20];} // square proportion

let w_h_ratio = squares_nr[0] / squares_nr[1];
let target_dim = [squares_nr[0] * 8, squares_nr[1] * 8]; // target dimensions for the source image in pixels
let canvas_dim = [target_dim[0] * thumbnail_scale, target_dim[1] * thumbnail_scale]; // canvas dimensions are enlarged to show the input image scaled up

let quality = $fx.getParam("quality"); // corresponds to the number of coefficients being selected, higher is better, 1-10
let quant_f = $fx.getParam("quant_f"); // additional factor which modifies quantization levels, higher means stronger compression, needs to be >= 1

let signal = ""; // initialize the signal, this is where the image data will be stored

let coefficients, selected_coefficients, pixelvalues, alpha_on;
let decompressed_signal_size = squares_nr[0] * squares_nr[1] * quality;
let compressed_signal_size;
let compression_ratio;

let dropped_image;
let dropped_file;
let drop_zone = 0; // 0, 1, 2, 3 - none, square, portrait, landscape
let drop_zone_x, drop_zone_y;
let manaspace;
let offset_rgb = [-25, -25, 25]; // rgb offset applied to the droped image - just for preview purposes during editing, the actual pixel values are not changes

let start_screen = true; // this will show the start screen at the beginning and be switched off after any key is pressed
let drop_screen = false; // drop screen will come after start screen and be switched off after the image is dropped
let file_over_canvas = false; // trigger to check if the file is dragged over the canvas or not
let thumbnail_ready = false; // additional flag for when thumbnail is ready for use
let display_signal = false; // display signal characters at key press

// 8x8 luminance quantization table provided by the JPEG standard
// source: https://www.sciencedirect.com/topics/engineering/quantization-table
const jpeg_lum_quant_table = [[16, 11, 10, 16, 24,  40,  51,  61],
                              [12, 12, 14, 19, 26,  58,  60,  55],
                              [14, 13, 16, 24, 40,  57,  69,  56],
                              [14, 17, 22, 29, 51,  87,  80,  62],
                              [18, 22, 37, 56, 68,  109, 103, 77],
                              [24, 35, 55, 64, 81,  104, 113, 92],
                              [49, 64, 78, 87, 103, 121, 120, 101],
                              [72, 92, 95, 98, 112, 100, 103, 99]];
      

// calculate the table for quantization levels
const quant_levels_table = calculateQuantizationLevels(jpeg_lum_quant_table, 2040, 2); // quant_table, coefficients_delta, buffer

// Chinese Han, CJK Unified Ideographs, 20992 elements, 0x4E00 - 0x9FFF
// Chinese Han, CJK Unified Ideographs Extension A, 6592 elements, 0x3400 - 0x4DBF
// Korean Hangul, Hangul Syllables, 11184 elements, 0xAC00 - 0xD7AF
// Chinese Yi, Yi Syllables, 1168 elements, 0xA000 - 0xA48F
// Japanese Katakana, Katakana, 96 elements, 0x30A0 - 0x30FF
const code_point_ranges = [[0x4E00, 0x9FFF], [0x3400, 0x4DBF], [0xAC00, 0xD7AF], [0xA000, 0xA48F], [0x30A0, 0x30FF]];

// assigning unicode characters to quantization levels
const charBlock = getCharBlockFromRanges(code_point_ranges);

// charToCoeffMap: unicode character -> quantized coefficient
// coeffToCharMap: quantized coefficient -> unicode character
const [charToCoeffMap, coeffToCharMap] = calculateCoefficientMaps(quant_levels_table, charBlock);

// "黑" stands for "black" and is within the last 304 characters in CJK Unified Ideographs block
// used for each zero coefficient in uncompressed signal
const bufferChar = "黑";
// compressed signal uses one of these characters to indicate how many coefficents are zero
const repeatingBufferChars = ["黛", "黚", "黙", "默", "黗", "黖", "黕", "黔", "黓", "黒"];

// "门" stands for "gate" or "door", in the last 1/4 of CJK Unified Ideographs block
// used for "transparent square" in uncompressed signal
const alphaChar = "门"; // 0x95E9
// compressed signal uses one of these characters to indicate how many squares in a row are transparent
const repeatingAlphaChars = getCharacterArray(0x95E9, 2200); // from "闩" (one after alphaChar "门") until "麀", which is still before bufferChar "黑"
// here we will store which squares were clicked on and turned transparent so that we can bring them back
let alphaSquaresToSignalMap = {};



//////PRELOAD//////

function preload() {

  // GLTCHVRS PART WITH EFFECTS
  /*
  image_border = [60, 60]; // width of the border in pixels
  frame_duration = 100; // in mms
  frame_rate = 1000/frame_duration;
  frameRate(frame_rate); 

  //effects_stack_names = ["mono", "hi-fi", "noisy", "corrupted", "lo-fi"]; // type of effects workflow to be used as a string
  //effects_stack_weights = [ [0, 20], [1, 20], [2, 20], [3, 20], [4, 20] ]; // these represent probabilities for choosing an effects stack number [element, probability]
  //effects_stack_type = gene_weighted_choice(effects_stack_weights); // type of effects workflow to be used as a number, 0-4
  //effects_stack_type = 3; // override for the type of effects workflow to be used as a number, 0-4
  //effects_stack_name = effects_stack_names[effects_stack_type]; // type of effects workflow to be used as a string

  effects_stack_name = $fx.getParam("effect_name");

  // DEFINING THE PATH TO THE SOURCE IMAGE

  image_path = 'assets/jpg_thumbnail_test_nr03_10.png'
  input_img = loadImage(image_path);
  */
  // END OF GLTCHVRS PART WITH EFFECTS



  manaspace = loadFont('assets/manaspc.ttf');

}


//////SETUP//////

function setup() {

  // GLTCHVRS PART WITH EFFECTS
  /*
  // ARTWORK GENERATION

  pixelDensity(1.0); // Need to fix this so the gif.js exports the correct size
  canvas = createCanvas(input_img.width + image_border[0], input_img.height + image_border[1]);
  background(0); // set black background for all images

  frame_counter = 0; // This will increment inside draw()

  // THE MAIN EFFECT STACK SWITCH

  switch(effects_stack_name) {

    case "mono":

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

      chosen_effect_function = applyMonochromeDither;
      animateEffectStack(input_img, chosen_effect_function, false);

      break;

    case "hi-fi":

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

      chosen_effect_function = applyTintedDither;
      animateEffectStack(input_img, chosen_effect_function, false);

      break;

    case "noisy":

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

      chosen_effect_function = applyDitherSorting;
      animateEffectStack(input_img, chosen_effect_function, false);

      break;

    case "corrupted":

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

      chosen_effect_function = applySortingDither;
      animateEffectStack(input_img, chosen_effect_function, false);

      break;

    case "lo-fi": 

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

      chosen_effect_function = applyAbstractDither;
      animateEffectStack(input_img, chosen_effect_function, false);

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

  //copy(buffer_1, 0, 0, buffer_1.width, buffer_1.height, 0, 0, input_img.width + image_border[0], input_img.height + image_border[1])
  */
  // END OF GLTCHVRS PART WITH EFFECTS




  canvas = createCanvas(canvas_dim[0], canvas_dim[1]);
      
  // change id of the canvas
  select('canvas').id('retrodigitizer');
  // move canvas to the middle of the browser window
  select('canvas').position((windowWidth - width)/2, (windowHeight - height)/2);


  frameRate(10);
  frame_counter = 0; // this will increment inside draw()
  frame_counter_after_drop = 0; // this will increment inside draw()

  // DESERIALIZE AN INPUT IMAGE - if signal param is not empty, which means it was stored already before
  if ($fx.getParam("signal").length != 0) {

      // turn off showing the start and drop screens
      start_screen = false;
      drop_screen = false;

      // store the signal param data into a new variable - this way we avoid the maxLength limit
      signal = $fx.getParam("signal");

  }

}



//////DRAW - MAIN ANIMATION LOOP//////

function draw() {

  // GLTCHVRS PART WITH EFFECTS
  /*
  background(0);

  // decide which frame to draw - we will loop through all 5 frames repeatedly to imitate the gif animation
  frame_to_draw = buffer_frames[frame_counter % 5];

  // draw appropriate frame
  copy(frame_to_draw, 0, 0, frame_to_draw.width, frame_to_draw.height, 0, 0, input_img.width + image_border[0], input_img.height + image_border[1])
  */
  // END OF GLTCHVRS PART WITH EFFECTS




  // START SCREEN - will disappear when any key is pressed
  if (start_screen) {

      showStartScreen();
  }


  // DROP SCREEN - will disappear when the image is dropped onto the canvas
  if (drop_screen) {

      showDropScreen();

      // DRAG AND DROP IMAGE
      canvas.drop(gotFile, dropped); // callback to recieve the loaded file, callback triggered when files are dropped
      canvas.dragOver(highlightDrop); // triggered when we drag a file over the canvas to drop it
      canvas.dragLeave(unhighlightDrop); // triggered when we finish dragging the file over the canvas to drop it
  }

  // SHOW DROPED IMAGE - if signal is not empty, draw the image on the screen
  if (signal.length != 0) {
      
      // deserializes the signal and draws the image every 5th frame
      if (frame_counter % 5 == 0) {
          // standard background so we see transparent squares
          background(0, 0, 255); 
          deserializeSignal(signal);
      }

      if (!display_signal) {
          // shows signal and control info as text on the canvas
          showSignalInfo();
          showControlInfo();
      } else {
          // show signal characters as text on the canvas
          showSignalOnScreen();
      }
  }


  // AFTER IMAGE DROP TEXT - execute only if the dropped_image is loaded, will disappear after a short time
  if ((thumbnail) && (thumbnail_ready) && (frame_counter_after_drop < 50)) {

      // shows load info as text on the canvas
      showAfterImageLoad();

      // increment the frame counter - this will make the loading text disappear
      frame_counter_after_drop++
  }



  // increment the frame counter - this controls the animations
  frame_counter++ 
}

