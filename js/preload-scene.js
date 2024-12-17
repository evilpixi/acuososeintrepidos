class PreloadScene extends Phaser.Scene {
    constructor ()
    {
        super({
            key: 'PreloadScene',
            pack: {
                files: [
                    { type: 'image', key: 'preloadLoadBar', url: 'assets/images/screens/preload/load-bar.png'},
                    { type: 'image', key: 'preloadLoadAmount', url: 'assets/images/screens/preload/load-amount.png'},
                    { type: 'image', key: 'preloadLogo', url: 'assets/images/screens/preload/logo.png'},
                    { type: 'image', key: 'preloadText', url: 'assets/images/screens/preload/text.png'}
                ]
            }
        });

        this.nombresOsos = []
        this.grizzPreload
        game.scene.add('PreloaderBackgroundAnimation', PreloaderBackgroundAnimation)
        game.scene.start('PreloaderBackgroundAnimation')
    }
    preload() {
        this.load.json("level-data", "js/level-data.json")
        this.load.json("balance-data", "js/balance-data.json")

        var thisScene = this
        this.load.script('webfont', 'lib/webfont.js')
        var element = document.createElement('style')
        document.head.appendChild(element)
        var sheet = element.sheet

        var styles = '@font-face { font-family: "trash-hand"; src: url("assets/fonts/trash-hand.ttf") format("opentype"); }\n'
        sheet.insertRule(styles, 0)

        var styles = '@font-face { font-family: "a-hint-of-sass"; src: url("assets/fonts/a-hint-of-sass.ttf") format("opentype"); }\n'
        sheet.insertRule(styles, 0)

        styles = '@font-face { font-family: "sunn"; src: url("assets/fonts/sunn.otf") format("opentype"); }\n';
        sheet.insertRule(styles, 0)

        var progressBarBackground = this.add.image(gWIDTH/2, gHEIGHT*0.79, 'preloadLoadBar')
        var progressBarProgress = this.add.image(gWIDTH/2, gHEIGHT*0.79-2, 'preloadLoadAmount')
        progressBarProgress.x = progressBarProgress.x-226
        progressBarProgress.setOrigin(0, 0.5)
        var preloadText = this.add.image(gWIDTH/2, gHEIGHT*0.91, 'preloadText')
        var preloadLogo = this.add.image(gWIDTH/2, gHEIGHT*0.23, 'preloadLogo')

        
        //this.add.image(gWIDTH/2, 700, 'grizzPreloadImg')

        // control the load
        //var progressBar = this.add.graphics();

        /*var preloadStuff = [
            preloadBackground,
            progressBar
        ]*/
        
        this.load.on('progress', function (value) {
            progressBarProgress.setScale(value, 0.8)
        });
                    
        this.load.on('fileprogress', function (file) {
            //console.log(file.src);
        })
        
        this.load.on('complete', function () {

            
        })

        console.log("loading game")
        var fruitNames = APP.fruit_names
        // ----------------------------- OPTIONS ----------------------------- 
        this.load.image('panelOpciones', 'assets/images/screens/options/options-popup.png')
        this.load.image('botonHome', 'assets/images/screens/options/home-button.png')
        this.load.image('botonMusica', 'assets/images/screens/options/music-button.png')
        this.load.image('botonMusicaOff', 'assets/images/screens/options/music-button-off.png')
        this.load.image('botonSonido', 'assets/images/screens/options/sound-button.png')
        this.load.image('botonSonidoOff', 'assets/images/screens/options/sound-button-off.png')
        this.load.image('botonHelp', 'assets/images/screens/options/help-button.png')
        this.load.image('botonLogros', 'assets/images/screens/options/archievements-button.png')
        this.load.image('botonRestart', 'assets/images/screens/options/restart-button.png')
        this.load.image('botonPlay', 'assets/images/screens/options/play-button.png')

        // ----------------------------- AUDIO ----------------------------- 
        this.load.audio('mainMusic', ['assets/audio/melody.mp3'])
        this.load.audio('gameMusic', ['assets/audio/melody_popup_gamification.mp3'])
        this.load.audio('youWon', ['assets/audio/popup_winner_final_point.mp3'])
        this.load.audio('youLost', ['assets/audio/popup_you-lost.mp3'])
        this.load.audio('points', ['assets/audio/popup_you-earned_points.mp3'])
        
        // ----------------------------- SPLASH --------------------------------------
        this.load.image('logo', 'assets/images/screens/splash/logo.png')
        this.load.image('botonJugar', 'assets/images/screens/splash/play-button.png')
        this.load.image('botonAyuda', 'assets/images/screens/splash/how2play-button.png')
        this.load.image('botonAudio', 'assets/images/screens/audio-button.png')

        this.load.image('splash-bg', 'assets/images/screens/splash/bg.png')
        this.load.image('splash-water', 'assets/images/screens/splash/water.png')
        this.load.spritesheet('pardo-splash', 'assets/images/screens/splash/grizz-sheet.png', { frameWidth: 500, frameHeight: 450})
        this.load.spritesheet('panda-splash', 'assets/images/screens/splash/panda-sheet.png', { frameWidth: 510, frameHeight: 680})
        this.load.spritesheet('polar-splash', 'assets/images/screens/splash/polar-sheet.png', { frameWidth: 500, frameHeight: 390})

        // ----------------------------- HELP --------------------------------------
        this.load.image('helpGrizz', 'assets/images/screens/help/grizz-help.png')
        for (var i=1; i<=6; i++) {
            this.load.image('helpBack'+i, 'assets/images/screens/help/help-back-'+i+'.png')
            this.load.image('helpImg'+i, 'assets/images/screens/help/help-img-'+i+'.png')
        }
        this.load.image('btnAyudaAnterior', 'assets/images/screens/help/help-button-prev.png')
        this.load.image('btnAyudaSiguiente', 'assets/images/screens/help/help-button-next.png')
        this.load.image('btnAyudaCerrar', 'assets/images/screens/help/help-button-close.png')

        // ----------------------------- LEVEL SELECTOR --------------------------------------
        this.load.image('lockedLevelButton', 'assets/images/screens/level-selection/locked-level-button.png')
        this.load.image('unlockedLevelButton', 'assets/images/screens/level-selection/unlocked-level-button.png')
        for (var i=0; i<=3; i++) {
            this.load.image('levelStar'+i, 'assets/images/screens/level-selection/level-stars-'+i+'.png')
        }
        this.load.image('levelSelectionBg', 'assets/images/screens/level-selection/level-selection-bg.png')
        this.load.image('levelSelectionPopup', 'assets/images/screens/level-selection/level-selection-popup.png')
        this.load.image('levelSelectionLock', 'assets/images/screens/level-selection/level-selection-lock.png')

        // ----------------------------- LEVEL PREVIEW --------------------------------------
        this.load.image('pandaLevelPreview', 'assets/images/screens/track-preview/panda.png')
        this.load.image('trackPreviewPlayButton', 'assets/images/screens/track-preview/track-preview-play-button.png')
        this.load.image('trackPreviewCellphone', 'assets/images/screens/track-preview/cellphone.png')
        for (var i=1; i<=20; i++) {
            this.load.image('trackPreview'+i, 'assets/images/tracks/track-previews/level'+i+'.png')
        }

        // ----------------------------- CHARACTER SELECTOR --------------------------------------
        this.load.image('pandaCharacter', 'assets/images/screens/character-selection/panda.png')
        this.load.image('pardoCharacter', 'assets/images/screens/character-selection/grizz.png')
        this.load.image('polarCharacter', 'assets/images/screens/character-selection/polar.png')
        this.load.image('botonAnterior', 'assets/images/screens/character-selection/selection-previous-button.png')
        this.load.image('botonSiguiente', 'assets/images/screens/character-selection/selection-next-button.png')
        this.load.image('botonJugar', 'assets/images/screens/character-selection/selection-play-button.png')

        // ----------------------------- GAME --------------------------------------
        for (var i=1; i<=APP.tilesets_amount; i++) {
            this.load.spritesheet('track-tile-'+i, 'assets/images/tracks/track-tiles/track-tile-'+ i +'.png', {
                frameWidth: DATA.widthElementoPista,
                frameHeight: DATA.heightElementoPista
            })
            this.load.image('largada-'+i, 'assets/images/tracks/track-tiles/start'+i+'.png')
            this.load.image('llegada-'+i, 'assets/images/tracks/track-tiles/finish-water'+i+'.png')
            
            this.load.image('bg'+i, 'assets/images/tracks/track-tiles/bg'+i+'.png')
        }

        thisScene.nombresOsosIngles = ['panda', 'grizz', 'polar']
        thisScene.nombresOsos = ['panda', 'pardo', 'polar']
        for(var i=0; i<3; i++) {
            this.load.spritesheet(thisScene.nombresOsos[i], 
                'assets/images/game/bears-play/' + thisScene.nombresOsosIngles[i]+'Sheet.png', { frameWidth: 181, frameHeight: 211});
        }

        this.load.image('osoCollider', 'assets/images/game/bears-play/bear-collider.png')
        this.load.image('bgCielo', 'assets/images/tracks/track-tiles/bg-sky1.png')
        
        this.load.image('llegadaCartel', 'assets/images/tracks/track-tiles/finish-sign.png')        
        this.load.image('nubesLlegada', 'assets/images/tracks/track-tiles/clouds.png')

        this.load.image('botonPausa', 'assets/images/screens/pause-button.png')
        this.load.image('botonAudio', 'assets/images/screens/audio-button.png')
        this.load.image('botonAudioOff', 'assets/images/screens/audio-button-off.png')
        this.load.image('iconoTiempo', 'assets/images/screens/ingame/timeIcon.png')

        this.load.image('ingameLife', 'assets/images/screens/ingame/life.png')
        this.load.image('ingameTrack', 'assets/images/screens/ingame/track.png')
        this.load.image('ingameTrackPanda', 'assets/images/screens/ingame/panda.png')
        this.load.image('ingameTrackPardo', 'assets/images/screens/ingame/grizz.png')
        this.load.image('ingameTrackPolar', 'assets/images/screens/ingame/polar.png')

        this.load.spritesheet('obs-spikes', 'assets/images/game/obstacles/spikes-sheet.png', {frameWidth: 260, frameHeight: 160})
        this.load.spritesheet('obs-piranha', 'assets/images/game/obstacles/piranha-sheet.png', {frameWidth: 310, frameHeight: 132})
        this.load.spritesheet('obs-swirl', 'assets/images/game/obstacles/swirl-sheet.png', {frameWidth: 350, frameHeight: 120})
        this.load.spritesheet('obs-shark', 'assets/images/game/obstacles/shark-sheet.png', {frameWidth: 320, frameHeight: 340})

        this.load.spritesheet('obs-big-fish', 'assets/images/game/obstacles/big-fish-sheet.png', {frameWidth: 400, frameHeight: 250})
        this.load.spritesheet('obs-squid', 'assets/images/game/obstacles/squid-sheet.png', {frameWidth: 105, frameHeight: 87})
        this.load.spritesheet('obs-frog', 'assets/images/game/obstacles/frog-sheet.png', {frameWidth: 150, frameHeight: 112})
        this.load.spritesheet('obs-log', 'assets/images/game/obstacles/log-sheet.png', {frameWidth: 102, frameHeight: 180/2})
        this.load.spritesheet('obs-ice', 'assets/images/game/obstacles/ice-sheet.png', {frameWidth: 272/2, frameHeight: 134})
        this.load.spritesheet('obs-wheel', 'assets/images/game/obstacles/wheel-sheet.png', {frameWidth: 280, frameHeight: 200})
        this.load.spritesheet('obs-seal', 'assets/images/game/obstacles/seal-sheet.png', {frameWidth: 410, frameHeight: 180})

        this.load.spritesheet('obsPlataforma', 'assets/images/game/obstacles/platform-sheet.png', {frameWidth: 300, frameHeight: 180})
        // MAKE SHARK
        //this.load.spritesheet('obs-shark', 'assets/images/game/obstacles/shark-sheet.png', {frameWidth: 644/4, frameHeight: 148})
        
        
        this.load.image('obsRampa', 'assets/images/game/obstacles/ramp.png')
        /*this.load.spritesheet('f uit-apple', 'assets/images/game/power-ups/fruit-apple.png')
        this.load.spritesheet('f uit-orange', 'assets/images/game/power-ups/fruit-orange.png')
        this.load.spritesheet('f uit-pineapple', 'assets/images/game/power-ups/fruit-pineapple.png')*/
        for (var i = 0; i<fruitNames.length; i++) {
            this.load.spritesheet('fruit-'+fruitNames[i], 'assets/images/game/power-ups/fruit/'+fruitNames[i]+'-sheet.png', {frameWidth: 200, frameHeight: 200})
        }

        // ----------------------------- INFLATE MINIGAME --------------------------------------
        this.load.image('InflateMinigameLostPopup', 'assets/images/game/inflate/lost-popup.png')
        this.load.image('InflateMinigameNormalPopup', 'assets/images/game/inflate/normal-popup.png')
        this.load.image('InflateMinigameWonPopup', 'assets/images/game/inflate/won-popup.png')

        this.load.image('InflateMinigamePlay', 'assets/images/game/inflate/play.png')
        this.load.image('InflateMinigameRestart', 'assets/images/game/inflate/restart.png')

        this.load.image('InflateMinigamePointer', 'assets/images/game/inflate/pointer.png')

        for (var i=0; i<=2; i++) {
            this.load.spritesheet(this.nombresOsos[i]+'-inflando', 'assets/images/game/inflate/'+this.nombresOsosIngles[i]+'-sheet.png', {frameWidth: 480, frameHeight: 400})
            this.load.spritesheet(this.nombresOsos[i]+'-inflador', 'assets/images/game/inflate/'+this.nombresOsosIngles[i]+'-inflate-sheet.png', {frameWidth: 480, frameHeight: 400})
        }

        // ----------------------------- SPECIAL OBJECTS --------------------------------------
        for (var i=1; i<=APP.stickers_amount; i++) {
            this.load.image('sticker-'+i, 'assets/images/game/power-ups/sticker-'+i+'.png')
            this.load.image('sticker-ui-unlocked-'+i, 'assets/images/screens/archievements/objects/sticker-ui-unlocked-'+i+'.png')
            this.load.image('sticker-ui-locked-'+i, 'assets/images/screens/archievements/objects/sticker-ui-locked-'+i+'.png')
        }
        for (var i=1; i<=APP.accesories_amount; i++) {
            this.load.image('accesory-'+i, 'assets/images/game/power-ups/acces-'+i+'.png')
            this.load.image('accesory-ui-unlocked-'+i, 'assets/images/screens/archievements/objects/acces-ui-unlocked-'+i+'.png')
            this.load.image('accesory-ui-locked-'+i, 'assets/images/screens/archievements/objects/acces-ui-locked-'+i+'.png')
        }
        for (var i=1; i<=APP.filters_amount; i++) {
            this.load.image('filter-'+i, 'assets/images/game/power-ups/filter-'+i+'.png')
            this.load.image('filter-ui-unlocked-'+i, 'assets/images/screens/archievements/objects/filter-ui-unlocked-'+i+'.png')
            this.load.image('filter-ui-locked-'+i, 'assets/images/screens/archievements/objects/filter-ui-locked-'+i+'.png')
        }

        //this.load.atlas('game-bonus', 'assets/images/game/power-ups/game-bonus.png', 'assets/images/game/power-ups/game-bonus.json')

        // ----------------------------- LEVEL END --------------------------------------
        this.load.image('levelEndPopupWin', 'assets/images/screens/level-end/you-won.png')
        this.load.image('levelEndPopupLost', 'assets/images/screens/level-end/you-lost.png')

        this.load.image('levelEndStarLeftOn', 'assets/images/screens/level-end/star-left-on.png')
        this.load.image('levelEndStarLeftOff', 'assets/images/screens/level-end/star-left-off.png')
        this.load.image('levelEndStarMidOn', 'assets/images/screens/level-end/star-mid-on.png')
        this.load.image('levelEndStarMidOff', 'assets/images/screens/level-end/star-mid-off.png')
        this.load.image('levelEndStarRightOn', 'assets/images/screens/level-end/star-right-on.png')
        this.load.image('levelEndStarRightOff', 'assets/images/screens/level-end/star-right-off.png')

        this.load.image('levelEndGrizz', 'assets/images/screens/level-end/grizz.png')
        this.load.image('levelEndPanda', 'assets/images/screens/level-end/panda.png')

        this.load.image('levelEndPlayButton', 'assets/images/screens/level-end/level-end-play-button.png')
        this.load.image('levelEndHomeButton', 'assets/images/screens/level-end/level-end-home-button.png')

        for (var i = 0; i<fruitNames.length; i++) {
            this.load.image('level-end-'+fruitNames[i], 'assets/images/screens/level-end/fruit-'+fruitNames[i]+'.png')
        }


        // ----------------------------- ARCHIEVEMENTS --------------------------------------
        this.load.image('ArchievementsPopup', 'assets/images/screens/archievements/arch-popup.png')
        this.load.image('ArchievementsClose', 'assets/images/screens/archievements/close.png')
        this.load.image('ArchievementsPrev', 'assets/images/screens/archievements/arch-prev.png')
        this.load.image('ArchievementsNext', 'assets/images/screens/archievements/arch-next.png')
        this.load.image('ArchievementsHere', 'assets/images/screens/archievements/here.png')        
        this.load.image('ArchievementProfileText', 'assets/images/screens/archievements/profile-text.png')
        this.load.image('ArchievementAlbumText', 'assets/images/screens/archievements/album-text.png')


        // ----------------------------- GAME END --------------------------------------
        /*this.load.image('GameEndBears', 'assets/images/screens/game-end/end-game-bears.png')
        this.load.image('GameEndBg', 'assets/images/screens/game-end/end-game-popup.png')
        this.load.image('GameEndApple', 'assets/images/screens/game-end/apple.png')
        this.load.image('GameEndStar', 'assets/images/screens/game-end/stars.png')
        this.load.image('GameEndContinue', 'assets/images/screens/game-end/continue-playing.png')
        this.load.image('GameEndNewGame', 'assets/images/screens/game-end/new-game.png')*/
        this.load.image('end-splash', 'assets/images/screens/game-end/end-splash.png')
        this.load.image('splash-bears', 'assets/images/screens/game-end/splash-bears.png')
        this.load.image('end-popup', 'assets/images/screens/game-end/end-popup.png')
        this.load.image('popup-bears', 'assets/images/screens/game-end/popup-bears.png')
        this.load.image('new-game-button', 'assets/images/screens/game-end/new-game-button.png')
        this.load.image('continue-playing-button', 'assets/images/screens/game-end/continue-playing-button.png')
        this.load.image('complete-archievements-button', 'assets/images/screens/game-end/complete-button.png')
        this.load.image('uncomplete-archievements-button', 'assets/images/screens/game-end/uncomplete-button.png')
        this.load.image('yes-button', 'assets/images/screens/game-end/yes-button.png')
        this.load.image('no-button', 'assets/images/screens/game-end/no-button.png')
        this.load.image('new-game-popup', 'assets/images/screens/game-end/new-game-popup.png')

        // ----------------------------- GOT IT --------------------------------------
        this.load.image('modalPreJuego', 'assets/images/screens/splash/remember-popup.png')
        this.load.image('botonEntendido', 'assets/images/screens/splash/understand-button.png')

        
        
        
    }
    create() {
        DATA.categoriaParedYOsos = this.matter.world.nextCategory();
        DATA.categoriaObstaculosSolidos = this.matter.world.nextCategory();
        DATA.categoriaPowerUps = this.matter.world.nextCategory();
        DATA.categoriaObstaculosDesinflantes = this.matter.world.nextCategory();
        DATA.categoriaReboteTiburon = this.matter.world.nextCategory();
        DATA.categoriaIA = this.matter.world.nextCategory();

        DATA.levelData = this.cache.json.get('level-data')
        DATA.balance = this.cache.json.get('balance-data')
        DATA.configureLevel()
        // sound
        DATA.sounds.youWon = this.sound.add('youWon')
        DATA.sounds.youLost = this.sound.add('youLost')
        DATA.sounds.points = this.sound.add('points')
        DATA.switchSound(DATA.soundActive)

        // music
        DATA.musics["mainMusic"] = this.sound.add('mainMusic')
        DATA.musics["gameMusic"] = this.sound.add("gameMusic")
        DATA.switchMusic(DATA.musicActive)
        
            
        if (APP.debugMode) {
            game.scene.add("GameScene", GameScene)
            game.scene.start("GameScene", {level: APP.debug_level})
            console.log("completada por game")
            game.scene.bringToTop("GameScene")
        }
        else {
            game.scene.stop("PreloaderBackgroundAnimation")
            game.scene.remove("PreloaderBackgroundAnimation")
            game.scene.start("SplashScene")
            trackEvent("game", "pageview")
        }
        //console.clear()
        game.scene.sendToBack('PreloadScene')
        var thisScene = this
        
        // anims
        var playerFrameRate = 10
        for (var i=0; i<3; i++) {
            this.anims.create({
                key: thisScene.nombresOsos[i] + 'Normal',
                frames: this.anims.generateFrameNumbers(thisScene.nombresOsos[i], { start: 0, end: 4 }),
                frameRate: playerFrameRate,
                repeat: -1
            });
            this.anims.create({
                key: thisScene.nombresOsos[i] + 'Izquierda',
                frames: this.anims.generateFrameNumbers(thisScene.nombresOsos[i], { start: 5, end: 7 }),
                frameRate: playerFrameRate,
                repeat: -1
            });
            this.anims.create({
                key: thisScene.nombresOsos[i] + 'Derecha',
                frames: this.anims.generateFrameNumbers(thisScene.nombresOsos[i], { start: 8, end: 10 }),
                frameRate: playerFrameRate,
                repeat: -1
            });
            this.anims.create({
                key: thisScene.nombresOsos[i] + 'Rapido',
                frames: this.anims.generateFrameNumbers(thisScene.nombresOsos[i], { start: 11, end: 13 }),
                frameRate: playerFrameRate,
                repeat: -1
            });
        }

        this.anims.create({
            key: 'pezGiganteAnim',
            frames: this.anims.generateFrameNumbers('obs-big-fish', { start: 0, end: 3 }),
            frameRate: 2,
            repeat: -1
        })
        this.anims.create({
            key: 'calamarAnim',
            frames: this.anims.generateFrameNumbers('obs-squid', { start: 0, end: 1 }),
            frameRate: 3,
            repeat: -1
        })
        this.anims.create({
            key: 'ranaAnim',
            frames: this.anims.generateFrameNumbers('obs-frog', { start: 0, end: 1 }),
            frameRate: 3,
            repeat: -1
        })
        this.anims.create({
            key: 'hieloAnim',
            frames: this.anims.generateFrameNumbers('obs-ice', { start: 0, end: 1 }),
            frameRate: 3,
            repeat: -1
        })
        this.anims.create({
            key: 'troncoAnim',
            frames: this.anims.generateFrameNumbers('obs-log', { start: 0, end: 1 }),
            frameRate: 3,
            repeat: -1
        })
        this.anims.create({
            key: 'anim-obs-piranha',
            frames: this.anims.generateFrameNumbers('obs-piranha', { start: 0, end: 11 }),
            frameRate: 10,
            repeat: -1
        })
        this.anims.create({
            key: 'anim-obs-spikes',
            frames: this.anims.generateFrameNumbers('obs-spikes', { start: 0, end: 3 }),
            frameRate: 6,
            repeat: -1
        })
        this.anims.create({
            key: 'anim-obs-wheel',
            frames: this.anims.generateFrameNumbers('obs-wheel', { start: 0, end: 3 }),
            frameRate: 6,
            repeat: -1
        })
        this.anims.create({
            key: 'anim-obs-seal',
            frames: this.anims.generateFrameNumbers('obs-seal', { start: 0, end: 3 }),
            frameRate: 6,
            repeat: -1
        })

        // shark giro 
        this.anims.create({
            key: 'anim-obs-shark-giro-izquierda',
            frames: this.anims.generateFrameNumbers('obs-shark', { start: 21, end: 23 }),
            frameRate: 8,
            repeat: 0
        })
        this.anims.create({
            key: 'anim-obs-shark-giro-derecha',
            frames: this.anims.generateFrameNumbers('obs-shark', { start: 9, end: 11 }),
            frameRate: 8,
            repeat: 0
        })
        // shark abajo
        this.anims.create({
            key: 'anim-obs-shark-abajo-izquierda',
            frames: this.anims.generateFrameNumbers('obs-shark', { start: 19, end: 20 }),
            frameRate: 5,
            repeat: -1
        })
        this.anims.create({
            key: 'anim-obs-shark-abajo-derecha',
            frames: this.anims.generateFrameNumbers('obs-shark', { start: 7, end: 8 }),
            frameRate: 5,
            repeat: -1
        })
        // shark salir
        this.anims.create({
            key: 'anim-obs-shark-salir-izquierda',
            frames: this.anims.generateFrameNumbers('obs-shark', { start: 0, end: 6 }),
            frameRate: 4,
            repeat: 0
        })
        this.anims.create({
            key: 'anim-obs-shark-salir-derecha',
            frames: this.anims.generateFrameNumbers('obs-shark', { start: 12, end: 18 }),
            frameRate: 4,
            repeat: 0
        })

        // plataforma
        this.anims.create({
            key: 'obs-plataforma-abajo',
            frames: this.anims.generateFrameNumbers('obsPlataforma', { start: 0, end: 1 }),
            frameRate: 8,
            repeat: -1
        })
        this.anims.create({
            key: 'obs-plataforma-subir',
            frames: this.anims.generateFrameNumbers('obsPlataforma', { start: 2, end: 4 }),
            frameRate: 6,
            repeat: 0
        })
        this.anims.create({
            key: 'obs-plataforma-bajar',
            frames: this.anims.generateFrameNumbers('obsPlataforma', { start: 7, end: 9 }),
            frameRate: 6,
            repeat: 0
        })
        this.anims.create({
            key: 'obs-plataforma-arriba',
            frames: this.anims.generateFrameNumbers('obsPlataforma', { start: 5, end: 6 }),
            frameRate: 8,
            repeat: -1
        })

        // frutas
        var frutas = [ 'orange', 'cherry-banana', 'mango', 'guava', 'grape', 'red-apple', 'green-apple']
        frutas.forEach(f => {
            this.anims.create({
                key: f+'-stand',
                frames: this.anims.generateFrameNumbers('fruit-'+f, { start: 0, end: 1 }),
                frameRate: 5,
                repeat: -1
            })
            this.anims.create({
                key: f+'-collect',
                frames: this.anims.generateFrameNumbers('fruit-'+f, { start: 2, end: 4 }),
                frameRate: 7,
                repeat: 0
            })
        })

        // infladores
        for (var i=0; i<=2; i++) {
            this.anims.create({
                key: this.nombresOsos[i]+'-inflando-stand',
                frames: this.anims.generateFrameNumbers(this.nombresOsos[i]+ '-inflando', { start: 0, end: 0 }),
                frameRate: 5,
                repeat: 0
            })
            this.anims.create({
                key: this.nombresOsos[i]+'-inflando-normal',
                frames: this.anims.generateFrameNumbers(this.nombresOsos[i]+ '-inflando', { start: 1, end: 2 }),
                frameRate: 5,
                repeat: -1
            })
            this.anims.create({
                key: this.nombresOsos[i]+'-inflando-fin',
                frames: this.anims.generateFrameNumbers(this.nombresOsos[i]+ '-inflando', { start: 3, end: 4 }),
                frameRate: 5,
                yoyo: true,
                repeat: 2
            })
            this.anims.create({
                key: this.nombresOsos[i]+'-inflando-perder',
                frames: this.anims.generateFrameNumbers(this.nombresOsos[i]+ '-inflando', { start: 5, end: 5 }),
                frameRate: 5,
                yoyo: true,
                repeat: 2
            })

            this.anims.create({
                key: this.nombresOsos[i]+'-inflador-0',
                frames: this.anims.generateFrameNumbers(this.nombresOsos[i]+ '-inflador', { start: 0, end: 0 }),
                repeat: 0
            })
            this.anims.create({
                key: this.nombresOsos[i]+'-inflador-1',
                frames: this.anims.generateFrameNumbers(this.nombresOsos[i]+ '-inflador', { start: 0, end: 1 }),
                frameRate: 18,
                yoyo: true,
                repeat: -1
            })
            this.anims.create({
                key: this.nombresOsos[i]+'-inflador-2',
                frames: this.anims.generateFrameNumbers(this.nombresOsos[i]+ '-inflador', { start: 2, end: 3 }),
                frameRate: 18,
                yoyo: true,
                repeat: -1
            })
            this.anims.create({
                key: this.nombresOsos[i]+'-inflador-3',
                frames: this.anims.generateFrameNumbers(this.nombresOsos[i]+ '-inflador', { start: 4, end: 5 }),
                frameRate: 18,
                yoyo: true,
                repeat: -1
            })
            this.anims.create({
                key: this.nombresOsos[i]+'-inflador-4',
                frames: this.anims.generateFrameNumbers(this.nombresOsos[i]+ '-inflador', { start: 6, end: 7 }),
                frameRate: 18,
                yoyo: true,
                repeat: -1
            })
            this.anims.create({
                key: this.nombresOsos[i]+'-inflador-5',
                frames: this.anims.generateFrameNumbers(this.nombresOsos[i]+ '-inflador', { start: 8, end: 8 }),
                repeat: -1
            })
        }
        
        //osos splash
        this.anims.create({
            key: 'pardo-splash-anim',
            frames: this.anims.generateFrameNumbers('pardo-splash', { start: 0, end: 2 }),
            frameRate: 10,
            yoyo: true,
            repeat: -1
        });
        this.anims.create({
            key: 'panda-splash-anim',
            frames: this.anims.generateFrameNumbers('panda-splash', { start: 0, end: 2 }),
            frameRate: 6,
            yoyo: true,
            repeat: -1
        });
        this.anims.create({
            key: 'polar-splash-anim',
            frames: this.anims.generateFrameNumbers('polar-splash', { start: 1, end: 2 }),
            frameRate: 12,
            yoyo: true,
            repeat: -1
        });

        WebFont.load({
            custom: {
                families: [ 'trash-hand', 'sunn', 'a-hint-of-sass' ]
            },
            active: function () {

            }
        })

    }
}

class PreloaderBackgroundAnimation extends Phaser.Scene {
    constructor ()
    {
        super('PreloaderBackgroundAnimation');
        this.grizzPreload
    }
    preload() {
        this.load.spritesheet('grizzPreload', 'assets/images/screens/preload/grizz.png', { frameWidth: 181, frameHeight: 211})
    }
    create() {
        var preloadBackground = this.add.rectangle(0,0, gWIDTH*2, gHEIGHT*2, 0x00B0CD)
        this.grizzPreload = this.add.sprite(gWIDTH/2, 900-10, 'grizzPreload')
        this.grizzPreload.setScale(2.1)
        this.anims.create({
            key: 'grizzPreload',
            frames: this.anims.generateFrameNumbers('grizzPreload', { start: 0, end: 2 }),
            frameRate: 10,
            repeat: -1
        });
        TweenMax.from(this.grizzPreload, DATA.t*2.3, {y:this.grizzPreload.y -100, ease: Sine.easeInOut}).yoyo(true).repeat(-1)

        
        game.scene.sendToBack('PreloaderBackgroundAnimation')
    }    
    update () {
        this.grizzPreload.play('grizzPreload', true)
    }
}