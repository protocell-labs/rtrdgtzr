/*

 ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
 ::::::::::::::'########::'########:'########:'########:::'#######:::::::::::::::
 :::::::::::::: ##.... ##: ##.....::... ##..:: ##.... ##:'##.... ##::::::::::::::
 :::::::::::::: ##:::: ##: ##:::::::::: ##:::: ##:::: ##: ##:::: ##::::::::::::::
 :::::::::::::: ########:: ######:::::: ##:::: ########:: ##:::: ##::::::::::::::
 :::::::::::::: ##.. ##::: ##...::::::: ##:::: ##.. ##::: ##:::: ##::::::::::::::
 :::::::::::::: ##::. ##:: ##:::::::::: ##:::: ##::. ##:: ##:::: ##::::::::::::::
 :::::::::::::: ##:::. ##: ########:::: ##:::: ##:::. ##:. #######:::::::::::::::
 ::::::::::::::..:::::..::........:::::..:::::..:::::..:::.......::::::::::::::::
'########::'####::'######:::'####:'########:'####:'########:'########:'########::
 ##.... ##:. ##::'##... ##::. ##::... ##..::. ##::..... ##:: ##.....:: ##.... ##:
 ##:::: ##:: ##:: ##:::..:::: ##::::: ##::::: ##:::::: ##::: ##::::::: ##:::: ##:
 ##:::: ##:: ##:: ##::'####:: ##::::: ##::::: ##::::: ##:::: ######::: ########::
 ##:::: ##:: ##:: ##::: ##::: ##::::: ##::::: ##:::: ##::::: ##...:::: ##.. ##:::
 ##:::: ##:: ##:: ##::: ##::: ##::::: ##::::: ##::: ##:::::: ##::::::: ##::. ##::
 ########::'####:. ######:::'####:::: ##::::'####: ########: ########: ##:::. ##:
........:::....:::......::::....:::::..:::::....::........::........::..:::::..::
:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  r e t r o  d i g i t i z e r  |  { p r o t o c e l l : l a b s }  |  2 0 2 3   

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
let effects_stack_names; // Type of effects workflow to be used as a string

let effects_stack_name = $fx.getParam("effect_name"); // type of effects workflow to be used as a string

let chosen_effect_function; // Function that applies the chosen effect stack
let image_border; // Width of the border in pixels, [76, 76]
let frame_duration; // In mms
let frame_rate; // Number of frames per second, calculated as 1000/frame_duration
let frame_counter; // Counts the frames for display in the browser
let nr_of_frames = 5; // number of frames in a gif animation

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
let tint_palette_key, tint_palette_key_1, tint_palette_key_2, tint_palette_key_3; // JSON key for tint palette colors
let tint_palette, tint_palette_1, tint_palette_2, tint_palette_3; // RGB array with values for tinting, example three_bit_palette['magenta']
let tinting_mode; // Type of tinting selected, 0 is always no tinting

let mask_contrast; // Contrast value for the image when taking brightnessMask
let light_treshold; // Brightness treshold for the image when taking brightnessMask
let dark_treshold; // Brightness treshold for the image when taking brightnessMask
let invert_mask; // Invert brightnessMask
let alpha_brightness; // brightness of the background under transparent squares - 0-100



////// IMPORTED FROM JPG-PARAMS //////

// Discrete Cosine Transform code based on Matthias Liszt's "Discrete Cosine Transform On Images" repo
// from: https://github.com/MatthiasLiszt/discreteCosineTransformOnImages/blob/master/dct2d.js

let thumbnail;
let thumbnail_scale = 5;
let thumbnail_square;

let format = $fx.getParam("format"); // get format string from params
let squares_nr; // number of image squares, each one is 8x8 pixels
if (format == "portrait") { squares_nr = [16, 25]; } // portrait proportion
else if (format == "landscape") { squares_nr = [25, 16]; } // landscape proportion
else { squares_nr = [20, 20]; } // square proportion

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





////// PRELOAD //////


function preload() {

  // load font used in Squaresoft's 'Secret of Mana' for Super Nintendo
  manaspace = loadFont('assets/manaspc.ttf');

}




////// SETUP //////


function setup() {

  pixelDensity(1.0); // need to fix this so the gif.js exports the correct size

  image_border = [0, 0]; // width of the border in pixels
  canvas = createCanvas(canvas_dim[0] + image_border[0], canvas_dim[1] + image_border[1]);

  // change id of the canvas
  select('canvas').id('retrodigitizer');
  // move canvas to the middle of the browser window
  select('canvas').position((windowWidth - width) / 2, (windowHeight - height) / 2);

  frame_duration = 100; // in mms
  frame_rate = 1000/frame_duration;
  frameRate(frame_rate); 

  frame_counter = 0; // this will increment inside draw()
  frame_counter_after_drop = 0; // this will increment inside draw()

  // DESERIALIZE AN INPUT IMAGE - if signal param is not empty, which means it was stored already before
  if ($fx.getParam("signal").length != 0) {

    // turn off showing the start and drop screens
    start_screen = false;
    drop_screen = false;

    // store the signal param data into a new variable - this way we avoid the maxLength limit
    signal = $fx.getParam("signal");

    // deserialize signal data into an input image - this is the starting point for all effect stacks
    input_img = deserializeSignalToImage(signal);

    // sets global data for the effect stack
    setEffectData(effects_stack_name);

    // create 5 frame animation using one of the effect stacks
    animateEffectStack(input_img, false);


    /*

    // print some info to the console

    print('Effect stack: ', effects_stack_name);

    print('Dither error distribution 1: ', rand_dither_key_1);
    print('Dither error distribution 2: ', rand_dither_key_2);
    print('Source image path: ', image_path);

    print('Sorting mode: ', sorting_mode);
    print('Sorting type: ', sorting_type);
    print('Sorting order: ', sorting_order);

    print('Tint palette: ', tint_palette_key);
    print('Color noise bias: ', rand_color_bias_key);

    */

  }

}




////// DRAW - MAIN ANIMATION LOOP //////


function draw() {

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

  // EDITING SIGNAL - if signal is not empty and thumbnail is loaded, draw the image on the screen
  if ((signal.length != 0) && (thumbnail)) {

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


  // EDITING SIGNAL (TEXT AFTER IMAGE DROP) - execute only if the dropped_image is loaded, will disappear after a short time
  if ((thumbnail) && (thumbnail_ready) && (frame_counter_after_drop < 50)) {

    // shows load info as text on the canvas
    showAfterImageLoad();

    // increment the frame counter - this will make the loading text disappear
    frame_counter_after_drop++
  }


  // EDITING EFFECTS (AFTER REFRESH) - execute if the signal is not empty but the thumbnail is not defined (we lost it after the refresh)
  if ((signal.length != 0) && (thumbnail == undefined)) {
    
    // decide which frame to draw - we will loop through all 5 frames repeatedly to imitate the gif animation
    frame_to_draw = buffer_frames[frame_counter % nr_of_frames];
  
    // draw appropriate frame
    copy(frame_to_draw, 0, 0, frame_to_draw.width, frame_to_draw.height, 0, 0, input_img.width + image_border[0], input_img.height + image_border[1])
    
    //background(0, 255, 0);
    //copy(input_img, 0, 0, input_img.width, input_img.height, 0, 0, input_img.width + image_border[0], input_img.height + image_border[1])
  }



  // increment the frame counter - this controls the animations
  frame_counter++
}