class APP {}

// config here

APP.debugMode = false
APP.debug_level = 2
APP.enable_tracking = true;

APP.accesories_names = ["accesory-1", "accesory-2", "accesory-3"]
APP.stickers_names = ["sticker-1", "sticker-2"]
APP.filters_names = ["filter-1", "filter-2"]
APP.accesories_amount = APP.accesories_names.length
APP.stickers_amount = APP.stickers_names.length
APP.filters_amount = APP.filters_names.length

APP.filter_unlock_amount = [
    10
]
APP.filter_codes = [ // code sent to site
    "unlockfilter1" // filter-1
]

APP.fruit_names = [ 'orange', 'mango', 'guava', 'grape', 'cherry-banana', 'green-apple', 'red-apple']

APP.tilesets_amount = 20

// true: no envia premios
// false: modo normal
APP.standAloneMode = false