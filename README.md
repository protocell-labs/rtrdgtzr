<pre>
    ____  ________________  ____                                
   / __ \/ ____/_  __/ __ \/ __ \                               
  / /_/ / __/   / / / /_/ / / / /                               
 / _, _/ /___  / / / _, _/ /_/ /                                
/_/ |_/_____/ /_/_/_/_|_|\____/___________________   __________ 
              / __ \/  _/ ____/  _/_  __/  _/__  /  / ____/ __ \
             / / / // // / __ / /  / /  / /   / /  / __/ / /_/ /
            / /_/ // // /_/ // /  / / _/ /   / /__/ /___/ _, _/ 
           /_____/___/\____/___/ /_/ /___/  /____/_____/_/ |_|   
</pre>

R E T R O  D I G I T I Z E R  |  { p r o t o c e l l : l a b s }  |  2 0 2 3

p5.js code for applying a retro-digitezer effects on an input image. These can be exported as png image or an animated gif (5 frames).



### Effect stacks

- **mono** - monochrome dither
- **hi-fi** - tinted dither
- **noisy** - color dither + pixel sorting
- **corrupted** - pixel sorting + color dither
- **lo-fi** - abstract dither


### Effect parameters

```javascript
let effects_stack_type = 1; // Type of effects workflow to be used
let effects_stack_name = "mono"; // Type of effects workflow to be used as a string
let image_border = [100, 100]; // Width of the border in pixels, [76, 76]
let frame_duration = 200; // In mms

let blackValue = 15; // Pixels darker than this will not be sorted, max is 100
let brigthnessValue = 50; // Value for sorting pixels according to brightness
let whiteValue = 70; // Pixels lighter than this will not be sorted, max is 100
let sorting_mode = 2; // Pixel sorting color mode, 0 -> black, 1 -> bright, 2 -> white
let sorting_type = 1; // Pixel sorting type, 0 -> chaotic, 1 -> proper
let sorting_order = 0; // Determines order of sorting, 0 -> column, 1 -> row, 2 -> column-row, 3 -> row-column (there are exceptions to this notation, see Abstract workflow)
let color_noise_density = 5; // Density of color noise (0-100)
let rand_color_bias_key = gene_pick_key(color_bias_palette); // JSON key for color noise bias parameters
let color_noise_bias = [1, 0, 1]; // Array which skews the rgb color values of the noise using this factor (0-1)
let color_noise_variation = 10000; // Variation of the color noise (10-10000)

let stripe_width = 5; // Width of black stripes
let stripe_offset = 1; // Offset of black stripes, note this cannot be bigger than stripe_width-1 !
let invert_stripes = false; // Inverts the striped pattern

let nr_of_levels = 1; // Number of color levels for FS dithering
let contrast = 0.25; // Set image contrast - 0.0 is no change
let new_brightness = 1.0; // Set image brightness - 1.0 is no change
let dither_group = 0; // Number for the group of dither parameters to choose from
let rand_dither_key = gene_pick_key(dither_params_json); // Get random key for dither error distribution parameters
let dither_params = dither_params_json[rand_dither_key]; // Read error distribution parameters from a JSON fil
let pix_scaling = 2.0; // Scales the size of pixels when applying effects
let pix_scaling_dark = pix_scaling * 2;
let layer_shift = 4; // Shift in x and y direction for every consecutive layer
let tint_palette_key = 'blue'; // JSON key for tint palette colors
let tint_palette = three_bit_palette['magenta']; // RGB array with values for tinting
let tinting_mode = 0; // Type of tinting selected, 0 is always no tinting

let mask_contrast = 0.0; // Contrast value for the image when taking brightnessMask
let light_treshold = 80; // Brightness treshold for the image when taking brightnessMask
let dark_treshold = 20; // Brightness treshold for the image when taking brightnessMask
let invert_mask = true; // Invert brightnessMask
```


### Effect functions

```javascript
input_img.resize(input_img.width / pix_scaling, 0); // Resize the image using smooth interpolation - 0 means image is scaled proportionally to the other parameter
input_img.resizeNN(input_img.width * pix_scaling, 0); // Resize the image using nearest-neighbour interpolation - 0 means image is scaled proportionally to the other parameter
grayscale(input_img, contrast); // Make image grayscale
makeStriped(input_img, stripe_step, invert_stripes); // Stripes the image with black bands
makeDithered(input_img, nr_of_levels, dither_params); // Apply Floyd-Steinberg dithering with custom error diffusion parameters
pixelSortColor(input_img, sorting_type, color_noise_density, color_noise_bias, color_noise_variation); // Apply color pixel sorting with color abberation
pixelSortRow(input_img, sorting_type, color_noise_density, color_noise_bias, color_noise_variation); // Apply color pixel sorting with color abberation
pixelSortColumn(input_img, sorting_type, color_noise_density, color_noise_bias, color_noise_variation); // Apply color pixel sorting with color abberation
brightnessMask(input_img, contrast, treshold, invert); // Make parts of the image transparent based on brightness (0-100)
tint(r, g, b); // Colorize the image using RGB values
flipHorizontal(input_img); // Flip image horizontally
applyMonochromeDither(input_img); // apply and draw monochrome dither effect stack
applyTintedDither(img); // apply and draw tinted dither effect stack
applyDitherSorting(input_img); // apply and draw color dither + pixel sorting effect stack
applySortingDither(input_img); // apply and draw pixel sorting + color dither effect stack
applyAbstractDither(input_img); // apply and draw abstract dither effect stack
```


