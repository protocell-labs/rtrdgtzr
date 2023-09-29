<pre>
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
</pre>

Code for a GENTK generative token on [fxhash.xyz](https://www.fxhash.xyz/) Tezos NFT platform.

When run locally, this generator needs to be used in conjunction with [fxlens](https://github.com/fxhash/fxlens) for full functionality.

Collection overview on fxhash.xyz (original minting site):
- [rtrdgtzr (fxhash)](https://www.fxhash.xyz/generative/slug/rtrdgtzr)

Collection overview on fxfam.xyz (better layout and filtering):
- [rtrdgtzr (fxfam)](https://fxfam.xyz/28552)

You can find a detailed description of the project in this fx(text) article:
- [rtrdgtzr - Minter's Guide](https://www.fxhash.xyz/article/rtrdgtzr-minter's-guide)

# Token description

_“And in the bloodlit dark behind his eyes, silver phosphenes boiled in from the edge of space, hypnagogic images jerking past like a film compiled of random frames.”_

_William Gibson, “Neuromancer”, 1984_

_rtrdgtzr_ (_/ˈɹɛ.tɹoʊ ˈdɪdʒɪtaɪzə(ɹ)/_, pronounced same as _retro digitizer_) is a long-form collaborative collection celebrating pixel and glitch art, graphics from the _'80s_ and _'90s_, and techno-dystopian aesthetics of William Gibson's novels. What you see when you open the minting interface is an editor which takes an input image provided by the minter, applies generative post-processing to it, and finally outputs an animated composition. The input image itself is compressed and stored on-chain through params mechanic as a signal in string format, retrieved every time the artwork is regenerated. Minters are in fact authors of minted tokens, implicit collaborators, who are appropriately entitled to half the royalties. To facilitate co-creation, minting process provides an intuitive interface as well as WYSIWYG (_what you see is what you get_) for full control of the output. Effect stacks in _rtrdgtzr_ were originally developed for the ǥᵍłˡŧᵗȼᶜħʰvᵛɍʳsˢ collection released on _GlitchForge_ in 2023 and feature customized diffusion dithering and aberrated pixel sorting. In terms of narrative and aesthetics, these two collections form an _artistic continuum_.

Minting interface is designed to guide the minter through the whole process in a user-friendly way. Quick visual guide as well as technical aspects of the collection are described in detail in the accompanying _fx(text)_ article _“rtrdgtzr – Minter’s Guide”_. Please read it before proceeding with the mint. For more info on the curation process, please follow us on social media. If you want to contribute as an artist, reach out!

The collaborative minting process was greatly inspired by _“Universal Rayhatcher”_ from Piter Pasma and _“Pensado a mano”_ collections from Alejandro Campos, both innovative at the time in their use of params mechanics. As we see our support for open generative tools as a mission every generative artist should partake in, _rtrdgtzr_ is also an official entry to the _fxhackathon 2023: co-creation interfaces_. We hope its openness and experimental character will serve as inspiration to others. But primarily, we hope it will inspire artists who don’t work with code to contribute to it.

Key controls:
- **g**: export gif animation (current output scale)
- **s**: export png image (current output scale)
- **left + right arrow**: change output scale (1x-10x)
- **b**: toggle page background color
- **p**: pause / run animation

Created with _p5.js_ in 2023 by _{protocell:labs}_.