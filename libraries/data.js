////// COLLECTION OF JSON FILES FOR STORING PARAMETERS AND DATA //////
// by @LukaPiskorec, 2023


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

let effects_main_name = $fx.getParam("effect_main"); // type of effects workflow to be used on the main image
let effects_background_name = $fx.getParam("effect_background"); // type of effects workflow to be used on the background


let chosen_effect_function; // Function that applies the chosen effect stack
let image_border; // Width of the border in pixels, [76, 76]
let frame_duration; // In mms
let frame_rate; // Number of frames per second, calculated as 1000/frame_duration
let frame_counter; // Counts the frames for display in the browser
let nr_of_frames = 2; // number of frames in a gif animation

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

let stack_data_main, stack_data_background; // data object containing all parameters for effect stacks - each image element will have their own



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




// Floyd-Steinberg dithering parameters
const dither_params_json = {
  'standard' : [0.4375, 0.1875, 0.3125, 0.0625], // [7/16.0, 3/16.0, 5/16.0, 1/16.0]
  'right only' : [1.0, 0.0, 0.0, 0.0],
  'down only' : [0.0, 0.0, 1.0, 0.0],
  'down-right only' : [0.0, 0.0, 0.0, 1.0],
  'down-left only' : [0.0, 1.0, 0.0, 0.0],
  'right down only' : [0.5, 0.0, 0.5, 0.0],
  'down-left down-right only' : [0.0, 0.5, 0.0, 0.5],
  'right down-left only' : [0.5, 0.5, 0.0, 0.0],
  'down down-right only' : [0.0, 0.0, 0.5, 0.5],
  'right down-right only' : [0.5, 0.0, 0.0, 0.5],
};


// Floyd-Steinberg dithering parameters
const extreme_dither_params_json = {
  'straight horizontal' : [-0.5, 0.25, 0.5, 0.0],
  'diagonal grained' : [-0.5, 0.0, -1.0, 1.0],
  'broken horizontal' : [-0.5, 1.25, 1.25, 0.0],
  'solid drip' : [-0.5, 0.5, -0.75, -0.5],
  'wiggly diagonal' : [1.0, -0.75, 0.25, 0.5],
  'blocky' : [-0.75, 0.25, -0.75, -0.75],
  'solid parallelogram' : [-0.25, -0.25, 0.25, 0.0],
  'drippy solid parallelogram' : [-0.5, 0.5, 0.0, -0.5],
  'dashed horizontal' : [-0.75, 0.5, 0.5, 0.5],
  'dense diagonal' : [0.5, -0.5, 1.0, -0.5],
  'grained noise' : [-1.0, -1.0, -1.0, 1.0],
  'noisy solid' : [-0.5, 0.5, -0.75, -0.5],
  'noisy patterned' : [-1.0, 0.5, -0.5, 0.5],
  'drippy solid' : [0.25, -0.25, -0.75, 0.25],
  'blurred solid' : [-1.0, -0.25, -0.25, -0.25],
  'melting solid' : [0.25, 0.75, -0.5, -0.75],
  'hairy diagonal' : [-1.0, 1.0, 0.75, -0.75],
  'hairy patterned' : [0.5, -1.0, 0.0, 1.0],
  'rainy' : [-1.0, 0.5, -0.5, 0.25],
};


// three-bit color palettes used for tinting
const three_bit_palette = {
  'red' : [255, 0, 0],
  'green' : [0, 255, 0],
  'blue' : [0, 0, 255],
  'magenta' : [255, 0, 255],
  'cyan' : [0, 255, 255],
};


// three-bit color palettes used for tinting
const three_bit_palette_reduced = {
  'red' : [255, 0, 0],
  'green' : [0, 255, 0],
  'blue' : [0, 0, 255],
  'white' : [255, 255, 255],
};


// color palettes used for color noise bias during pixel sorting
const color_bias_palette = {
  'red' : [1, 0, 0],
  'blue' : [0, 0, 1],
  'magenta' : [1, 0, 1],
  'red skewed blue' : [0.5, 0, 1],
  'blue skewed red' : [1, 0, 0.5],
  'cyan' : [0, 1, 1],
  'green skewed blue' : [0, 0.5, 1],
  'blue skewed green' : [0, 1, 0.5],
};


// parameters for changing effect stack values between different animation frames (5 frames total)
const animation_params = {
  'contrast t0' : [0.01, 0.01, 0.01, 0.01],
  'brightness t0' : [0.005, 0.005, 0.005, 0.005],
  'contrast t1' : [0.02, 0.02, -0.03, 0.02],
  'brightness t1' : [0.01, 0.01, -0.015, 0.01],
};
