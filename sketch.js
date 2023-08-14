/*

::::::::::::::::::::::::::::::::::::::::::
:::::::::::::::::::'##::::::::::::::::::::
::'## ##:::::::::'######::::::::'## ##::::
:: ###..::::::::::. ##..:::::::: ###..::::
:: ##.::::::::::::: ##:::::::::: ##.::::::
:: ##::::::::::::::. ##::::::::: ##:::::::
::...:::::::::::::::...:::::::::...:::::::
:::::::::::::::::::::'##::::::::::::::::::
::::::::::::::::::::: ##:::::::::'#####:::
::'######:::::::::'#####::::::::'##. ##:::
::.......::::::::'##. ##::::::::. #####:::
:::::::::::::::::. #####::::::::'#.. ##:::
::::::::::::::::::......::::::::. ####.:::
::::'##::::::::::::::::::::::::::.....::::
::'######::::::::'#####:::::::::'## ##::::
:::. ##..::::::::.. ##.::::::::: ###..::::
:::: ##::::::::::: ##.:::::::::: ##.::::::
::::. ##::::::::: ######:::::::: ##:::::::
:::::...:::::::::.......::::::::...:::::::
::::::::::::::::::::::::::::::::::::::::::

    r t r d g t z r  |  { p r o t o c e l l
: l a b s }  |  2 0 2 3

*/




////// PRELOAD //////


function preload() {

  // load font used in Squaresoft's 'Secret of Mana' for Super Nintendo
  manaspace = loadFont('assets/manaspc.ttf');

}




////// SETUP //////


function setup() {

  // write info to the console
  infoToConsole();

  pixelDensity(1.0); // need to fix this so the gif.js exports the correct size
  frameRate(frame_rate); // frame rate for the main animation

  // create canvas so it fits into the browser window
  if (windowWidth / windowHeight < w_h_ratio) {
    canvas = createCanvas(windowWidth, windowWidth / w_h_ratio);
  } else {
    canvas = createCanvas(windowHeight * w_h_ratio, windowHeight);
  }

  select('canvas').id('retrodigitizer'); // change id of the canvas
  select('canvas').position((windowWidth - width) / 2, (windowHeight - height) / 2); // move canvas to the middle of the browser window

  // DESERIALIZE AN INPUT IMAGE - if signal param is not empty, which means it was stored already before
  if ($fx.getParam("signal").length != 0) {

    // resize canvas
    resizeCanvas(output_dim[0] + output_border[0], output_dim[1] + output_border[1]);
    select('canvas').position((windowWidth - width) / 2, (windowHeight - height) / 2); // move canvas to the middle of the browser window

    // turn off showing the start and drop screens
    start_screen = false;
    drop_screen = false;

    // store the signal param data into a new variable - this way we avoid the maxLength limit
    signal = $fx.getParam("signal");

    // write more info to console
    console.log("\n", "format ->", format, 
                "\n", "input dimensions ->", target_dim[0], "x", target_dim[1], 
                "\n", "output dimensions ->", output_dim[0] + output_border[0], "x", output_dim[1] + output_border[1], 
                "\n", "output scale ->", output_scale, 
                "\n", "quality ->", quality, 
                "\n", "quantization ->", quant_f, 
                "\n", "decompressed characters ->", squares_nr[0] * squares_nr[1] * quality,
                "\n", "compressed characters ->", signal.length, 
                "\n", "image compression ->", Math.round(100 * signal.length / target_pixel_nr), "%", 
                "\n", "effect primary ->", effects_main_name, 
                "\n", "effect secondary ->", effects_background_name, 
                "\n", "invert ->", invert_input, 
                "\n", "era ->", effect_era, 
                "\n", "seed ->", effect_seed, 
                "\n", "author ->", $fx.minter, 
                "\n", "signal ->", "\n\n", signal);

    // deserialize signal data into an input image - this is the starting point for all effect stacks
    input_img = deserializeSignalToImage(signal);

    // inverts the colors of the input image
    if (invert_input) {input_img.filter(INVERT);}

    // sets global data for the effect stack
    stack_data_main = setEffectData(effects_main_name);
    stack_data_background = setEffectData(effects_background_name);
    stack_data_background["light_threshold"] = 50; // override for effects on background
    stack_data_background["layer_shift"] = 0; // override for effects on background

    // create 5 frame animation using one of the effect stacks
    animateEffectStack(input_img, stack_data_main, stack_data_background, false);

  }
}




////// DRAW - MAIN ANIMATION LOOP //////


function draw() {

  // START SCREEN - will disappear when any key is pressed
  if (start_screen) {

    showStartScreen();
  }


  // ERA SCREEN - will disappear when era is selected by clicking
  if (era_screen) {

    era_zone = getEra(); // get the currently selected era (mouse hover)
    showEraScreen();
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
      // magenta background so the border is easier to see during editing
      background(255, 0, 255);

      // blue shape under the loaded image to show transparent squares
      fill(0, 0, 255);
      rect((canvas_dim[0] * image_border[0])/2, (canvas_dim[1] * image_border[1])/2, canvas_dim[0], canvas_dim[1]);
      
      // deserialize signal and draw the image
      deserializeSignal(signal);
    }

    if (!display_signal && !hide_info) {
      // shows signal and control info as text on the canvas
      showSignalInfo();
      showControlInfo();
    } else if (display_signal) {
      // show signal characters as text on the canvas
      showSignalOnScreen();
    } else {
      // no info is shown on screen
    }
  }


  // EDITING SIGNAL (TEXT AFTER IMAGE DROP) - execute only if the dropped_image is loaded, will disappear after a short time
  if ((thumbnail) && (thumbnail_ready) && (drop_zone == 0) && (frame_counter_after_drop < 50)) {

    // shows load info as text on the canvas
    showAfterImageLoad();

    // increment the frame counter - this will make the loading text disappear
    frame_counter_after_drop++
  }


  // EDITING EFFECTS (AFTER REFRESH) - execute if the signal is not empty but the thumbnail is not defined (we lost it after the refresh)
  if ((signal.length != 0) && (thumbnail == undefined)) {
    
    // decide which frame to draw - we will loop through all 5 frames repeatedly to imitate the gif animation
    frame_to_draw = buffer_frames[frame_counter % nr_of_frames];
  
    // black background when showing the final image with effects
    background(0, 0, 0);

    // draw appropriate frame
    copy(frame_to_draw, 0, 0, frame_to_draw.width, frame_to_draw.height, 0, 0, frame_to_draw.width, frame_to_draw.height)
  }


  // increment the frame counter - this controls the animations
  frame_counter++
}