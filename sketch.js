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




////// PRELOAD //////


function preload() {

  // load font used in Squaresoft's 'Secret of Mana' for Super Nintendo
  manaspace = loadFont('assets/manaspc.ttf');

}




////// SETUP //////


function setup() {

  pixelDensity(1.0); // need to fix this so the gif.js exports the correct size
  frameRate(frame_rate); // frame rate for the main animation

  canvas = createCanvas(canvas_dim[0] + image_border[0], canvas_dim[1] + image_border[1]);
  select('canvas').id('retrodigitizer'); // change id of the canvas
  select('canvas').position((windowWidth - width) / 2, (windowHeight - height) / 2); // move canvas to the middle of the browser window

  
  // DESERIALIZE AN INPUT IMAGE - if signal param is not empty, which means it was stored already before
  if ($fx.getParam("signal").length != 0) {

    // turn off showing the start and drop screens
    start_screen = false;
    drop_screen = false;

    // store the signal param data into a new variable - this way we avoid the maxLength limit
    signal = $fx.getParam("signal");

    // deserialize signal data into an input image - this is the starting point for all effect stacks
    input_img = deserializeSignalToImage(signal);

    if (invert_input) {input_img.filter(INVERT);} // inverts the colors of the input image

    // sets global data for the effect stack
    stack_data_main = setEffectData(effects_main_name);
    stack_data_background = setEffectData(effects_background_name);

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
  }


  // increment the frame counter - this controls the animations
  frame_counter++
}