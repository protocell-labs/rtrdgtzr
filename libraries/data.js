////// COLLECTION OF JSON FILES FOR STORING PARAMETERS AND DATA //////
// by @LukaPiskorec, 2023


let banner_txt = "";
banner_txt += "\n::::::::::::::::::::::::::::::::::::::::::";
banner_txt += "\n:::::::::::::::::::'##::::::::::::::::::::";
banner_txt += "\n::'## ##:::::::::'######::::::::'## ##::::";
banner_txt += "\n:: ###..::::::::::. ##..:::::::: ###..::::";
banner_txt += "\n:: ##.::::::::::::: ##:::::::::: ##.::::::";
banner_txt += "\n:: ##::::::::::::::. ##::::::::: ##:::::::";
banner_txt += "\n::...:::::::::::::::...:::::::::...:::::::";
banner_txt += "\n:::::::::::::::::::::'##::::::::::::::::::";
banner_txt += "\n::::::::::::::::::::: ##:::::::::'#####:::";
banner_txt += "\n::'######:::::::::'#####::::::::'##. ##:::";
banner_txt += "\n::.......::::::::'##. ##::::::::. #####:::";
banner_txt += "\n:::::::::::::::::. #####::::::::'#.. ##:::";
banner_txt += "\n::::::::::::::::::......::::::::. ####.:::";
banner_txt += "\n::::'##::::::::::::::::::::::::::.....::::";
banner_txt += "\n::'######::::::::'#####:::::::::'## ##::::";
banner_txt += "\n:::. ##..::::::::.. ##.::::::::: ###..::::";
banner_txt += "\n:::: ##::::::::::: ##.:::::::::: ##.::::::";
banner_txt += "\n::::. ##::::::::: ######:::::::: ##:::::::";
banner_txt += "\n:::::...:::::::::.......::::::::...:::::::";
banner_txt += "\n::::::::::::::::::::::::::::::::::::::::::";
banner_txt += "\n";
banner_txt += "\n     r t r d g t z r  |  { p r o t o c e l l : l a b s }  |  2 0 2 3     \n\n";




let input_img, frame_to_draw, buffer_frames, squares_nr, gif, canvas, image_border, output_border;
let thumbnail, thumbnail_scale, output_scale, dropped_image, dropped_file, drop_zone_x, drop_zone_y, manaspace;
let stack_data_main, stack_data_background;
let compressed_signal_size, image_compression_ratio;

let frame_duration = 100; // in mms
let frame_rate = 1000/frame_duration; // animation frame rate
let frame_counter = 0; // this will increment inside draw()
let frame_counter_after_drop = 0; // this will increment inside draw()
let nr_of_frames = 5; // number of frames in a gif animation
let drop_zone = 0; // 0, 1, 2, 3 - none, square, portrait, landscape
let era_zone = 0; // 0, 1, 2 - none, '80s, '90s
let offset_rgb = [-25, -25, 25]; // rgb offset applied to the droped image - just for preview purposes during editing, the actual pixel values are not changes
let background_toggle = false; // will be used to toggle the color of the html body background
let signal = ""; // initialize the signal, this is where the image data will be stored
let max_chars = 2000; // maximum number of characters in the compressed signal - this is separately set inside fx_params.js for the signal param

let format = $fx.getParam("format"); // get format string from params
let border_type = $fx.getParam("border_type"); // type of border - "none", "thin", "thick"
let quality = $fx.getParam("quality"); // corresponds to the number of coefficients being selected, higher is better, 1-10
let quant_f = $fx.getParam("quant_f"); // additional factor which modifies quantization levels, higher means stronger compression, needs to be >= 1
let effect_era = $fx.getParam("effect_era"); // era of the effects

if (border_type == "none")                                    { image_border = [0, 0]; } // in precentage of the image dimensions
else if ((border_type == "thin") && (format == "portrait"))   { image_border = [0.075, 0.05]; } // in precentage of the image dimensions
else if ((border_type == "thin") && (format == "landscape"))  { image_border = [0.05, 0.075]; } // in precentage of the image dimensions
else if ((border_type == "thin") && (format == "square"))     { image_border = [0.05, 0.05]; } // in precentage of the image dimensions
else if ((border_type == "thick") && (format == "portrait"))  { image_border = [0.225, 0.15]; } // in precentage of the image dimensions
else if ((border_type == "thick") && (format == "landscape")) { image_border = [0.15, 0.225]; } // in precentage of the image dimensions
else if ((border_type == "thick") && (format == "square"))    { image_border = [0.15, 0.15]; } // in precentage of the image dimensions

if (format == "portrait") { squares_nr = [16, 25]; } // portrait proportion
else if (format == "landscape") { squares_nr = [25, 16]; } // landscape proportion
else { squares_nr = [20, 20]; } // square proportion

let target_dim = [squares_nr[0] * 8, squares_nr[1] * 8]; // target dimensions for the source image in pixels
let w_h_ratio = (target_dim[0] + target_dim[0] * image_border[0]) / (target_dim[1] + target_dim[1] * image_border[1]); // image width to height ratio
let target_pixel_nr = target_dim[0] * target_dim[1]; // number of pixels in the image - used to calculate image compression ratio

if (window.innerWidth / window.innerHeight < w_h_ratio) {
  thumbnail_scale = window.innerWidth / (target_dim[0] + target_dim[0] * image_border[0]); // scaling factor for the input image
} else {
  thumbnail_scale = window.innerHeight / (target_dim[1] + target_dim[1] * image_border[1]); // scaling factor for the input image
}

let canvas_dim = [target_dim[0] * thumbnail_scale, target_dim[1] * thumbnail_scale]; // canvas dimensions are enlarged to show the input image scaled up
let decompressed_signal_size = squares_nr[0] * squares_nr[1] * quality;

if (window.innerWidth / window.innerHeight < w_h_ratio) {
  output_scale = Math.floor(window.innerWidth / target_dim[0]); // scaling factor for the output image
} else {
  output_scale = Math.floor(window.innerHeight / target_dim[1]); // scaling factor for the output image
}

let output_dim = [target_dim[0] * output_scale, target_dim[1] * output_scale];

if (border_type == "none") { output_border = [0, 0]; }  // no border
else if (border_type == "thin") { output_border = [10 * output_scale, 10 * output_scale]; } // thin border
else { output_border = [20 * output_scale, 20 * output_scale]; } // thick border

// primary effect stacks - [value, probability]
const allel_effect_stacks_main = [
  ["mono", 2],
  ["hi-fi", 2],
  ["noisy", 2],
  ["corrupted", 2],
  ["abstract", 1], // half the probability as the rest
  ["lo-fi", 1] // half the probability as the rest
];

// secondary effect stacks - [value, probability]
const allel_effect_stacks_background = [
  ["mono", 1],
  ["hi-fi", 1],
  ["noisy", 1],
  ["corrupted", 1],
  ["abstract", 1], // same probability as the rest
  ["lo-fi", 1] // same probability as the rest
];

// used only with broken tokens (when the signal is undefined) - [value, probability]
const allel_random_alpha_prob = [[0.0, 1], [0.01, 1], [0.1, 1], [0.25, 1]];

let effects_main_name = gene_weighted_choice(allel_effect_stacks_main); // type of effects workflow to be used on the main image
let effects_background_name = gene_weighted_choice(allel_effect_stacks_background); // type of effects workflow to be used on the background
let invert_input = gene() < 0.25 ? true : false; // inverts both the input image and the effects applied to it after
let random_alpha_prob = gene_weighted_choice(allel_random_alpha_prob); // approx. chance that the square of pixels will be transparent (used only with broken tokens)

let start_screen = true; // this will show the start screen at the beginning and be switched off after any key is pressed
let era_screen = false; // era screen will come after start screen and be switched off when era is selected by clicking
let drop_screen = false; // drop screen will come after era screen and be switched off after the image is dropped
let thumbnail_ready = false; // additional flag for when thumbnail is ready for use
let display_signal = false; // display signal characters at key press
let hide_info = false; // hide info text during image editing at key press


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


// returns signal type - "signal" for valid, "noise" for invalid signals or "empty" for no signal
let signal_type = getSignalType($fx.getParam("signal"));


// defining fxhash token features
$fx.features({
  "title" : $fx.getParam("title"),
  "author" : $fx.minter,
  "seed" : $fx.getParam("effect_seed"),
  "format" : $fx.getParam("format"),
  "era" : $fx.getParam("effect_era"),
  "type" : signal_type
})


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


// three-bit color palettes used for tinting (black is missing)
const three_bit_palette = {
  'red' : [255, 0, 0],
  'green' : [0, 255, 0],
  'blue' : [0, 0, 255],
  'magenta' : [255, 0, 255],
  'cyan' : [0, 255, 255],
  'yellow' : [255, 255, 0],
  'white' : [255, 255, 255],
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
// only first 4 are applied, the last one is a placeholder (applied after the last frame is already rendered)
const animation_params = {
  'contrast t0' : [0.01, 0.01, 0.01, 0.01, 0],
  'brightness t0' : [0.005, 0.005, 0.005, 0.005, 0],
  'contrast t1' : [0.02, 0.02, -0.03, 0.02, 0],
  'brightness t1' : [0.01, 0.01, -0.015, 0.01, 0],
};
