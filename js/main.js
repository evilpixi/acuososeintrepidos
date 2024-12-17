var gWIDTH = 873;
var gHEIGHT = 1624;
var globalDebugVariable
var debugMode = false

dbg = {
    showCollisions: true,
    collisionColor: 0xff0000,
    showSensors: true,
    sensorFillColor: 0x0d177b,
    sensorLineColor: 0x1327e4,
    showVelocity: true,
    velocityColor: 0x00aeef
}
if (APP.debugMode) debugMode = dbg
window.onload = function () {
    try {
        //CNData.test = true;
        //CNData.test = false
        // CNTrack.setup("promo:aei_2020")
    } catch (err) {
        console.log(err);
    }
    validatePortrait();
}
window.onresize = function () {
    validatePortrait();
}
function validatePortrait () {
    /*console.log("=============== VER AQUI ================")
    console.log(navigator.userAgent)
    console.log("=============== VER AQUI ================")*/
    if (window.innerWidth > window.innerHeight && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent))  // if landscape
    {
        divgirar.style.display = 'inline-block';
        if (document.getElementsByTagName("canvas")[0] && document.getElementsByTagName("canvas")[0].classList) {
            document.getElementsByTagName("canvas")[0].classList.add('canvashide'); // hide canvas
        }
    }
    else // if portrait
    {
        divgirar.style.display = 'none';
        if (document.getElementsByTagName("canvas")[0] && document.getElementsByTagName("canvas")[0].classList) {
            document.getElementsByTagName("canvas")[0].classList.remove('canvashide'); // show canvas
        }
    }
}
console.log("pixi :3")

var config = { // config...
    type: Phaser.CANVAS,
    //type: /Android 8|Android 9/i.test(navigator.userAgent)? Phaser.AUTO : Phaser.CANVAS,
    /*width: gWIDTH,
    height: gHEIGHT,*/
    scale: {
        mode: Phaser.Scale.FIT,
        width: gWIDTH,
        height: gHEIGHT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: "gamecanvas"
    },
    autoStart: false,
    physics: {
        default: 'matter',//*/'arcade',
        matter: {
            gravity: { y: 1.2 },
            debug: debugMode
        }
    },
    render: {
        antialias: true
    }
}

var game = new Phaser.Game(config)
//game.scene.add('PreloadScene', PreloadScene)

/*var scenes = {
    //preloader: new PreloaderScene(),
    splash: new SplashScene(),
    game: new GameScene(),
    option: new OptionsScene(),
    characterSelection: new CharacterSelectionScene()
}*/
game.scene.add('PreloadScene', PreloadScene)
game.scene.add('SplashScene', SplashScene)
game.scene.add('LevelSelectionScene', LevelSelectionScene)
game.scene.add('TrackPreviewScene', TrackPreviewScene)
game.scene.add('CharacterSelectionScene', CharacterSelectionScene)
//game.scene.add('GameScene', GameScene)
game.scene.add('LevelEndScene', LevelEndScene)
game.scene.add('OptionsScene', OptionsScene)
game.scene.add('HelpScene', HelpScene)
game.scene.add('GotItScene', GotItScene)
game.scene.add('InflateMinigameScene', InflateMinigameScene)
game.scene.add('ArchievementsScene', ArchievementsScene)
game.input.addPointer();
game.scene.start("PreloadScene")
// game.scene.start("SplashScene")
/*if (debugMode) {
    game.scene.start("GameScene")
}
else {
    game.scene.start("SplashScene")
}*/

/*function showScene(topScene) {
    game.scene.start(topScene)
    game.scene.bringToTop(topScene)
}*/


function trackEvent (type, parameter = '') {
    if (!APP.enable_tracking) return;

    console.log("tracking: " + type + " + " + parameter)
    try {
        parameter ? CNTrack.milestone(type, parameter) : CNTrack.milestone(type)
        /*switch(type) {
            case 'view-help': CNTrack.milestone("view.help", "page"+n); break
            case 'close-help': CNTrack.milestone("view.help", "close"); break
            case 'splash': CNTrack.milestone("pageview"); break
            case 'splash': CNTrack.milestone("pageview"); break
            case 'splash': CNTrack.milestone("pageview"); break
            case 'splash': CNTrack.milestone("pageview"); break
            case 'splash': CNTrack.milestone("pageview"); break
            case 'splash': CNTrack.milestone("pageview"); break
            case 'splash': CNTrack.milestone("pageview"); break
            case 'splash': CNTrack.milestone("pageview"); break
            case 'splash': CNTrack.milestone("pageview"); break

            case 'splash': CNTrack.milestone("pageview"); break
        }*/
    }
    catch (err) {
        console.log(err, type);
    }
}