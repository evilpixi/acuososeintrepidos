class TrackPreviewScene extends Phaser.Scene {
    constructor ()
    {
        super("TrackPreviewScene");

        this.data
    }
    init(data) {
        this.data = data
    }
    preload() {

    }
    create() {
        var thisScene = this
        this.add.image(gWIDTH/2, gHEIGHT/2, 'levelSelectionBg')
        var cell = this.add.image(gWIDTH/2, gHEIGHT/2, 'trackPreviewCellphone')
        var track = this.add.image(cell.x+320, cell.y+55, 'trackPreview'+thisScene.data.level)
        track.x = track.x - track.width/2
        this.add.image(gWIDTH*0.3, gHEIGHT*0.8, 'pandaLevelPreview')        
        var levelLogo = this.add.image(cell.x-320, cell.y-500, 'unlockedLevelButton')
        thisScene.add.text(
            levelLogo.x - 10 + (thisScene.data.level < 10 ? 7 : 0), 
            levelLogo.y - 25, 
            thisScene.data.level, 
            {
                fontFamily: 'trash-hand',
                fontStyle: 'bold',
                align: "center",
                fontSize: 60,
                color: '#fff'
            })
        
        var btn = this.add.image(cell.x+330, cell.y+580-100, 'trackPreviewPlayButton')
        
        DATA.animarBoton(btn)
        btn.on('pointerup', ()=> {
            trackEvent("game", "level:"+this.data.level+":enter")
            game.scene.stop('TrackPreviewScene')
            game.scene.stop('LevelSelectionScene')
            /*game.scene.remove('LevelSelectionScene')
            game.scene.add('LevelSelectionScene', LevelSelectionScene)*/
            game.scene.add("GameScene", GameScene)
            game.scene.start('GameScene', {level: thisScene.data.level})
        })
    }
    update () {
    }
}