class ObjectPool {
    constructor(list = [], creationStrategy) {
        this.pool = list
        this.createNewMethod = creationStrategy
    }
    
    isEmpty() { 
        return this.pool.length == 0 ? true : false
    }

    getNew() {
        if (this.isEmpty()) {
            // reuse one in this.pool
        }
        else {
            // create new
        }
    }

    deleteOne(anObject) {
        // anObject.destroy() ??
        this.pool.push(anObject)
    }
}

class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene")
        
        this.player
        this.playerHasControl
        this.hSpeed = 15
        this.vAccel = 1
        this.maxSpeedY = 14
        this.brakeAccelerationY = 0.3
        this.brakeAccelerationX = 1.12

        this.removeIndicator
        this.createIndicator
        this.dynamicStructure = []
        this.getDynamicIndex = (y)=> { return Math.floor((y-350)/(240-3)) }
        this.getDynamicDesfaseY = (i)=> { return 350 + (240-3)*i}
        this.wallPool
        this.trackPool

        

        this.velText
        this.accText
        this.cursor
        this.keys

        this.widthElementoPista = DATA.widthElementoPista
        this.heightElementoPista = DATA.heightElementoPista
        this.widthJugable = {
            wide: 620,
            mid: 560,
            narrow: 400
        }
        this.levelData = {}
        this.currentLevel

        this.desfaseX = 0
        this.desfaseY = 0  
              

        this.ososSprites = []
        this.ososColliders = []
        this.ososSombras = []

        this.ososLugares = []
        this.ososPuestosFinales = []
        this.ososAnimacionFinal = {
            'panda': false,
            'pardo': false,
            'polar': false
        }

        this.ososScale = 0.82

        this.movX = function(obj,lado) {
            obj.setVelocityX(lado*this.hSpeed)
        }

        this.tAnimOsoAire = 0.25
        this.yMaxAnimOsoAire = 120

        this.nombresOsos = ['panda', 'pardo', 'polar']
        this.panda = {
            label: 'panda',
            velMax: this.maxSpeedY,
            llego: 0
        }
        this.pardo = {
            label: 'pardo',
            velMax: this.maxSpeedY,
            llego: 0
        }
        this.polar = {
            label: 'polar',
            velMax: this.maxSpeedY,
            llego: 0
        }
        this.osos = {
            "panda": this.panda,
            "pardo": this.pardo,
            "polar": this.polar
        }
        Object.values(this.osos).forEach(oso => {
            oso.velMax = this.maxSpeedY
            oso.enAire = false
            oso.t0EnAire = 0
            oso.desfaseSpriteY = 0
            oso.rampasAgarradas = []
        })
        
        this.objetosPista = {
            "rampa": [],
            "oso": [],
            "big-fish": [],
            "really-big-fish": [],
            "squid": [],
            "frog": [],
            "ice": [],
            "log": [],
            "shark": [],
            "spikes": [],
            "piranha": [],
            "wheel": [],
            "seal": [],
            "plataforma": []
        }
        this.llegadaY = 0

        this.collectables = []
        this.specialObjectCount = {}
        this.specialObjectCollected = 0

        this.contadorFrutas = {}

        this.startTime = 0
        this.AICanPlay = false

        this.hayQueLargar = true
        this.sePuedeAcelerar = false
        this.camaraPrincipal
        this.puntoInicialCamara 
        this.UI = []
        this.getPorcentajePista = function(y) {
            var largoTotal = 400 + this.largoPista * (240-3)
            var proporcionRecorrida = (y+150)/largoTotal
            return 1250*proporcionRecorrida
        }
        this.spritesOsosEnPista = []

        this.largoPista = 0

        this.partida_t0 = 0
        this.partida_tDisp = 0
        this.contandoTiempo = false
        this.partida_dT = 0
        this.partida_tRest = 0
        this.partida_tiempoFinal = 0
        
        // by event
        this.timeEndEvent = 0

        this.vecesDesinflado = 0
        this.vidas = 0

        this.puestoActual = 0

        this.terminarPartida = function (datosFin) {
            
            trackEvent("game","level:"+this.currentLevel, ":clear")
            this.UI.forEach(u => {
                u.visible = false
            })
            game.scene.pause("GameScene")
            game.scene.start('LevelEndScene', {
                puestos: datosFin.puestos,
                stars: datosFin.stars,
                ganaste: datosFin.ganaste,
                bonus: datosFin.bonus,
                tiempo: datosFin.tiempo,
                frutas: datosFin.frutas,
                largoPista: datosFin.largoPista
            })
            game.scene.bringToTop('LevelEndScene')
        }

        this.recogerObjetoEspecial
        this.recogerFruta
    }
    init(data) {
        this.currentLevel = data.level
        DATA.currentLevel = data.level

        this.vidas = DATA.balance.player.lifes
        
        //this.matter.world.destroy()
        //this.matter.world = new Phaser.Physics.Matter.World(this, { gravity: {y: 1.2}})
    }

    preload ()
    {
    }



    // ========================================================================================== 
    // ========================================= CREATE ========================================= 
    // ========================================================================================== 
    create ()
    {
        this.matter.world.engine.positionIterations = 20
        this.matter.world.engine.velocityIterations = 20

        this.wallPool = new ObjectPool()
        this.trackPool = new ObjectPool()


        this.levelData = DATA.levelData["level" + this.currentLevel]
        for (var i=0; i<=2; i++) this.contadorFrutas[DATA.levelData['level'+DATA.currentLevel].fruits[i]] = 0
        var thisScene = this 
        Object.keys(DATA.levelBonusDistribution).forEach(s => {
            thisScene.specialObjectCount[s] = 0
        })
        
        thisScene.partida_tDisp = thisScene.levelData.time*1000
        thisScene.partida_tRest = thisScene.levelData.time*1000
        DATA.stopMusic()
        DATA.playMusic("gameMusic")    
        this.puntoInicialCamara = thisScene.add.circle(gWIDTH/2, 150, 50, 0xff0000, 1) 
        thisScene.camaraPrincipal = this.cameras.main
        thisScene.camaraPrincipal.setScroll(0, -gHEIGHT/2 +150)
        thisScene.camaraPrincipal.setFollowOffset(0, 400 * (2*debugMode - 1))
        this.cursor = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys({
            up: 'UP',
            down: 'DOWN',
            left: 'LEFT',
            right: 'RIGHT'
        })

        this.desfaseX = 0 
        this.desfaseY = 0

        // --------------------------------------------------
        // ------------------- background -------------------
        // --------------------------------------------------
        var skySprite = this.add.image(400,-285, 'bgCielo')
        skySprite.setScale(2.2)
        skySprite.y -= skySprite.height/2 -10
        var bgData = this.add.image(0, 0,'bg'+this.currentLevel)
        bgData.visible = false
        bgData = {width: bgData.width*3, height: bgData.height*3}
        for (var i=0; i<70; i++) {
            for (var j=-1; j<=1; j++)
            {
                var im = thisScene.add.image(gWIDTH/2 + (bgData.width -10)*j, (bgData.height-10)*i + bgData.height/2 -135,'bg'+this.currentLevel)
                im.setCrop(2,2, bgData.width-2, bgData.height-2).setScale(3)
            }
        }
        
        // ----------------------------------------------
        // ------------------- walls --------------------
        // ----------------------------------------------
        var w = thisScene.widthJugable
        w.wide /= 2
        w.mid /= 2
        w.narrow /= 2

        this.add.image(gWIDTH/2 + 2, 0, "largada-"+this.currentLevel)

        addPared(undefined,
            gWIDTH/2 + thisScene.desfaseX - w.wide*1.05, 
            -130, 4)

        addPared(undefined,
            gWIDTH/2 + thisScene.desfaseX + w.wide*1.05, 
            -130, 4)

        this.desfaseY += 350

        if (!thisScene.currentLevel) {
            thisScene.currentLevel = 1
        }
        /*for (var i = 0; i< this.largoPista; i++) { 
            var dato = thisScene.levelData.structure[i]
            this.dynamicStructure.append(new TrackTile(dato[0], dato[1]))
        }*/

        class TrackTile {
            constructor(name, data) {
                this.isShown = false
                this.name = name
                this.data = data
                this.image = null
                this.walls = []
                this.objects = []
                this.localDesfaseX = gWIDTH/2
            }

            show() {
                this.isShown = true
                switch (this.name) {
                    case "wide rect":               addWideRect(this.data, this); break;
                    case "wide curve left":         addWideCurveLeft(this.data, this); break;
                    case "wide curve right":        addWideCurveRight(this.data, this); break;
                    case "wide oblique left":       addWideObliqueLeft(this.data, this); break;
                    case "wide oblique right":      addWideObliqueRight(this.data, this); break;
                    case "bifurcation open":        addBifurcationOpen(this.data, this); break;
                    case "bifurcation rect":        addBifurcationRect(this.data, this); break;
                    case "bifurcation close":       addBifurcationClose(this.data, this); break;
                    case "wide to mid left":        addWideToMidLeft(this.data, this); break;
                    case "wide to mid right":       addWideToMidRight(this.data, this); break;
                    case "wide to mid center":      addWideToMidCenter(this.data, this); break;
                    case "wide to narrow center":   addWideToNarrowCenter(this.data, this); break;
                    case "mid rect":                addMidRect(this.data, this); break;
                    case "mid curve left":          addMidCurveLeft(this.data, this); break;
                    case "mid curve right":         addMidCurveRight(this.data, this); break;
                    case "mid oblique left":        addMidObliqueLeft(this.data, this); break;
                    case "mid oblique right":       addMidObliqueRight(this.data, this); break;
                    case "mid to wide right":       addMidToWideRight(this.data, this); break;
                    case "mid to wide left":        addMidToWideLeft(this.data, this); break;
                    case "mid to wide center":      addMidToWideCenter(this.data, this); break;
                    case "mid to narrow left":      addMidToNarrowLeft(this.data, this); break;
                    case "mid to narrow right":     addMidToNarrowRight(this.data, this); break;
                    case "mid to narrow center":    addMidToNarrowCenter(this.data, this); break;
                    case "narrow rect":             addNarrowRect(this.data, this); break;
                    case "narrow oblique left":     addNarrowObliqueLeft(this.data, this); break;     
                    case "narrow oblique right":    addNarrowObliqueRight(this.data, this); break;
                    case "narrow to wide center":   addNarrowToWideCenter(this.data, this); break;
                    case "narrow to mid right":     addNarrowToMidRight(this.data, this); break;
                    case "narrow to mid left":      addNarrowToMidLeft(this.data, this); break;
                    case "narrow to mid center":    addNarrowToMidCenter(this.data, this); break;
                    case "end":                     addEnd(); break;
                }
            }

            removeItem() {
                for (var i=0; i<this.walls.length;i++) {
                    thisScene.matter.world.remove(this.walls[i])
                    this.walls[i] = undefined
                }
                this.walls = []
                /*this.objects.forEach(o => {
                    o.remove()
                })*/
                this.objects.forEach(o => {
                    o.removeItem()
                })
                if (this.image) this.image.destroy()
                this.image = null
                this.isShown = false
            }
        }


        this.largoPista = thisScene.levelData.structure.length
        for (var i = 0; i< this.largoPista; i++) {
            var dato = thisScene.levelData.structure[i]
            this.dynamicStructure.push(new TrackTile(dato[0], dato[1]))
        }
        this.dynamicStructure.push(new TrackTile("end", []))



        

        function addPared(p, x,y, t=1, a=0) {
            var pared 
            
            = thisScene.matter.add.rectangle(x, y, 30, thisScene.heightElementoPista*t, {isStatic: true, angle: a})//.setCollisionCategory(DATA.categoria1)
            //pared.setCollisionCategory(DATA.categoria1)
            pared.collisionFilter.category = DATA.categoriaParedYOsos
            if (p) p.walls.push(pared)
        }

        function addWideRect(objectData, parentObject) {
            var imagenActual = thisScene.add.sprite(gWIDTH/2 + thisScene.desfaseX, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY,
                "track-tile-" + thisScene.levelData.tilemap, 0)
            // obj
            if (objectData) {
                objectData.forEach(o => {
                    addObject(parentObject, o.t, o.l, o.opts)
                })
            }

            // izq
            var paredIzq = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX - w.wide*1.05, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY)

            // der
            var paredDer = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX + w.wide*1.05, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY)


            thisScene.desfaseY += thisScene.heightElementoPista -3
            //thisScene.desfaseX += -1
            parentObject.image = imagenActual
            parentObject.localDesfaseX = gWIDTH/2 + thisScene.desfaseX
        }

        function addWideCurveLeft(objectData, parentObject) {
            var imagenActual = thisScene.add.sprite(gWIDTH/2 + thisScene.desfaseX+1, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY,
                "track-tile-" + thisScene.levelData.tilemap, 3)

            // obj
            if (objectData) {
                objectData.forEach(o => {
                    addObject(parentObject, o.t, o.l, o.opts)
                })
            }

            // izq
            var paredIzq = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX -w.wide*1.05 - 10, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY - 70, 0.4, 0.2)
            paredIzq = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX -w.wide*1.05 - 45, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY + 10, 0.4, 0.65)
            paredIzq = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX -w.wide*1.05 - 75, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY + 80, 0.4, 0.25)

            // der
            var paredIzq = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX +w.wide*1.05 - 10, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY - 70, 0.4, 0.2)
            paredIzq = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX +w.wide*1.05 - 45, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY + 10, 0.4, 0.65)
            paredIzq = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX +w.wide*1.05 - 75, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY + 80, 0.4, 0.25)


            thisScene.desfaseY += thisScene.heightElementoPista -3
            thisScene.desfaseX += -90 +2
            parentObject.image = imagenActual
            parentObject.localDesfaseX = gWIDTH/2 + thisScene.desfaseX+1
        }

        function addWideCurveRight(objectData, parentObject) {
            var imagenActual = thisScene.add.sprite(gWIDTH/2 + thisScene.desfaseX +1, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY,
                "track-tile-" + thisScene.levelData.tilemap, 6)

            // obj
            if (objectData) {
                objectData.forEach(o => {
                    addObject(parentObject, o.t, o.l, o.opts)
                })
            }            
            // izq
            var paredIzq = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX -w.wide*1.05 + 10, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY - 70, 0.4, -0.2)
            paredIzq = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX -w.wide*1.05 + 45, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY + 10, 0.4, -0.65)
            paredIzq = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX -w.wide*1.05 + 75, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY + 80, 0.4, -0.25)

            // der
            var paredIzq = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX +w.wide*1.05 + 10, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY - 70, 0.4, -0.2)
            paredIzq = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX +w.wide*1.05 + 45, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY + 10, 0.4, -0.65)
            paredIzq = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX +w.wide*1.05 + 75, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY + 80, 0.4, -0.25)

            thisScene.desfaseY += thisScene.heightElementoPista -3
            thisScene.desfaseX += +90 -2
            parentObject.image = imagenActual
            parentObject.localDesfaseX = gWIDTH/2 + thisScene.desfaseX+1
        }
        function addWideObliqueLeft(objectData, parentObject) {
            var imagenActual = thisScene.add.sprite(gWIDTH/2 + thisScene.desfaseX , 
                thisScene.heightElementoPista/2 + thisScene.desfaseY,
                "track-tile-" + thisScene.levelData.tilemap, 9)

            // obj
            if (objectData) {
                objectData.forEach(o => {
                    addObject(parentObject, o.t, o.l, o.opts)
                })
            }
            // izq
            var paredIzq = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX -w.wide*1.05 - 40, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY, 1.2, 0.35)

            // der
            var paredDer = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX +w.wide*1.05 - 40, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY, 1.2, 0.35)
            
            thisScene.desfaseY += thisScene.heightElementoPista -3
            thisScene.desfaseX += -90 +2
            parentObject.image = imagenActual
            parentObject.localDesfaseX = gWIDTH/2 + thisScene.desfaseX
        }
        function addWideObliqueRight(objectData, parentObject) {
            var imagenActual = thisScene.add.sprite(gWIDTH/2 + thisScene.desfaseX , 
                thisScene.heightElementoPista/2 + thisScene.desfaseY,
                "track-tile-" + thisScene.levelData.tilemap, 12)

            // obj
            if (objectData) {
                objectData.forEach(o => {
                    addObject(parentObject, o.t, o.l, o.opts)
                })
            }
            // izq
            var paredIzq = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX -w.wide*1.05 + 40, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY, 1.2, -0.35)

            // der
            var paredDer = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX +w.wide*1.05 + 40, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY, 1.2, -0.35)
            
            thisScene.desfaseY += thisScene.heightElementoPista -3 
            thisScene.desfaseX += 90 -2
            parentObject.image = imagenActual
            parentObject.localDesfaseX = gWIDTH/2 + thisScene.desfaseX
        }
        function addBifurcationOpen(objectData, parentObject) {
            var imagenActual = thisScene.add.sprite(gWIDTH/2 + thisScene.desfaseX , 
                thisScene.heightElementoPista/2 + thisScene.desfaseY,
                "track-tile-" + thisScene.levelData.tilemap, 15)

            // obj
            if (objectData) {
                objectData.forEach(o => {
                    addObject(parentObject, o.t, o.l, o.opts)
                })
            }
            // izq
            var paredIzq = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX -w.wide*1.05, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY, 1, 0)

            // der
            var paredDer = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX +w.wide*1.05, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY, 1, 0)

            // med
            var paredMedIzq = addPared(parentObject,
                gWIDTH/2 + 40 + thisScene.desfaseX, 
                thisScene.heightElementoPista*0.75 + thisScene.desfaseY, 0.5, 0)
            var paredMedDer = addPared(parentObject,
                gWIDTH/2 - 40 + thisScene.desfaseX, 
                thisScene.heightElementoPista*0.75 + thisScene.desfaseY, 0.5, 0)
            thisScene.matter.add.circle(
                gWIDTH/2 + thisScene.desfaseX,
                thisScene.heightElementoPista*0.55 + thisScene.desfaseY, 50, {isStatic: true})
            
            thisScene.desfaseY += thisScene.heightElementoPista -3
            parentObject.image = imagenActual
            parentObject.localDesfaseX = gWIDTH/2 + thisScene.desfaseX
        }

        function addBifurcationRect(objectData, parentObject) {
            var imagenActual = thisScene.add.sprite(gWIDTH/2 + thisScene.desfaseX , 
                thisScene.heightElementoPista/2 + thisScene.desfaseY,
                "track-tile-" + thisScene.levelData.tilemap, 18)

            // obj
            if (objectData) {
                objectData.forEach(o => {
                    addObject(parentObject, o.t, o.l, o.opts)
                })
            }
            // izq
            var paredIzq = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX -w.wide*1.05, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY, 1, 0)

            // der
            var paredDer = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX +w.wide*1.05, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY, 1, 0)

            // med
            var paredMedIzq = addPared(parentObject,
                gWIDTH/2 + 40 + thisScene.desfaseX, 
                thisScene.heightElementoPista*0.5 + thisScene.desfaseY, 1, 0)
            var paredMedDer = addPared(parentObject,
                gWIDTH/2 - 40 + thisScene.desfaseX, 
                thisScene.heightElementoPista*0.5 + thisScene.desfaseY, 1, 0)
            
            thisScene.desfaseY += thisScene.heightElementoPista -3
            parentObject.image = imagenActual
            parentObject.localDesfaseX = gWIDTH/2 + thisScene.desfaseX
        }

        function addBifurcationClose(objectData, parentObject) {
            var imagenActual = thisScene.add.sprite(gWIDTH/2 + thisScene.desfaseX , 
                thisScene.heightElementoPista/2 + thisScene.desfaseY,
                "track-tile-" + thisScene.levelData.tilemap, 21)

            // obj
            if (objectData) {
                objectData.forEach(o => {
                    addObject(parentObject, o.t, o.l, o.opts)
                })
            }

            // izq
            var paredIzq = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX -w.wide*1.05, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY, 1, 0)

            // der
            var paredDer = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX +w.wide*1.05, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY, 1, 0)

            // med
            var paredMedIzq = addPared(parentObject,
                gWIDTH/2 + 40 + thisScene.desfaseX, 
                thisScene.heightElementoPista*0.25 + thisScene.desfaseY, 0.5, 0)
            var paredMedDer = addPared(parentObject,
                gWIDTH/2 - 40 + thisScene.desfaseX, 
                thisScene.heightElementoPista*0.25 + thisScene.desfaseY, 0.5, 0)
            thisScene.matter.add.circle(gWIDTH/2 + thisScene.desfaseX, 
                thisScene.heightElementoPista*0.45 + thisScene.desfaseY, 50, {isStatic: true})
            
            thisScene.desfaseY += thisScene.heightElementoPista -3
            parentObject.image = imagenActual
            parentObject.localDesfaseX = gWIDTH/2 + thisScene.desfaseX
        }
        function addWideToMidLeft(objectData, parentObject) {
            var imagenActual = thisScene.add.sprite(gWIDTH/2 + thisScene.desfaseX, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY,
                "track-tile-" + thisScene.levelData.tilemap, 24)

            // obj
            if (objectData) {
                objectData.forEach(o => {
                    addObject(parentObject, o.t, o.l, o.opts)
                })
            }

            // izq
            var paredIzq = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX - w.wide*1.05, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY)

            // der
            var paredDer = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX + w.wide*1.05 - 70, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY-20, 1, 0.65)
            addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX + w.wide*1.05 -140, 
                thisScene.heightElementoPista*0.9 + thisScene.desfaseY, 0.18)

            thisScene.desfaseY += thisScene.heightElementoPista -3
            thisScene.desfaseX -= 70
            parentObject.image = imagenActual
            parentObject.localDesfaseX = gWIDTH/2 + thisScene.desfaseX
        }
        function addWideToMidRight(objectData, parentObject) {
            var imagenActual = thisScene.add.sprite(gWIDTH/2 + thisScene.desfaseX +1, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY,
                "track-tile-" + thisScene.levelData.tilemap, 27)

            // obj
            if (objectData) {
                objectData.forEach(o => {
                    addObject(parentObject, o.t, o.l, o.opts)
                })
            }
            
            // izq
            var paredIzq = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX - w.wide*1.05 + 70, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY-20, 1, -0.65)
            addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX - w.wide*1.05 +140, 
                thisScene.heightElementoPista*0.9 + thisScene.desfaseY, 0.18)

            // der
            var paredDer = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX + w.wide*1.05, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY)

            thisScene.desfaseY += thisScene.heightElementoPista -3
            thisScene.desfaseX += 70
            parentObject.image = imagenActual
            parentObject.localDesfaseX = gWIDTH/2 + thisScene.desfaseX+1
        }

        function addWideToMidCenter(objectData, parentObject) {
            var imagenActual = thisScene.add.sprite(gWIDTH/2 + thisScene.desfaseX, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY,
                "track-tile-" + thisScene.levelData.tilemap, 1)

            // obj
            if (objectData) {
                objectData.forEach(o => {
                    addObject(parentObject, o.t, o.l, o.opts)
                })
            }

            // izq
            var paredIzq = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX - w.mid*1.05, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY, 1.1, -0.29)

            // der
            var paredDer = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX + w.mid*1.05, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY, 1.1, 0.29)

            thisScene.desfaseY += thisScene.heightElementoPista -3
            parentObject.image = imagenActual
            parentObject.localDesfaseX = gWIDTH/2 + thisScene.desfaseX
        }

        function addWideToNarrowCenter(objectData, parentObject) {
            var imagenActual = thisScene.add.sprite(gWIDTH/2 + thisScene.desfaseX -2, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY,
                "track-tile-" + thisScene.levelData.tilemap, 4)
            
            // obj
            if (objectData) {
                objectData.forEach(o => {
                    addObject(parentObject, o.t, o.l, o.opts)
                })
            }

            // izq
            var paredIzq = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX - w.mid+10, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY, 1.1, -0.55)

            // der
            var paredDer = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX + w.mid-10, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY, 1.1, 0.55)

            thisScene.desfaseY += thisScene.heightElementoPista -3
            parentObject.image = imagenActual
            parentObject.localDesfaseX = gWIDTH/2 + thisScene.desfaseX-2
        }

        function addMidRect(objectData, parentObject) {
            var imagenActual = thisScene.add.sprite(gWIDTH/2 + thisScene.desfaseX-37, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY,
                "track-tile-" + thisScene.levelData.tilemap, 7)
            
            // obj
            if (objectData) {
                objectData.forEach(o => {
                    addObject(parentObject, o.t, o.l, o.opts)
                })
            }       
            addParedDebug()
            // izq
            var paredIzq = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX - w.mid*0.92, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY)

            // der
            var paredDer = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX + w.mid*0.92, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY)

            thisScene.desfaseY += thisScene.heightElementoPista -3
            parentObject.image = imagenActual
            parentObject.localDesfaseX = gWIDTH/2 + thisScene.desfaseX-37
        }

        function addMidCurveLeft(objectData, parentObject) {
            var desfaseExtra = 45
            thisScene.desfaseX -= desfaseExtra
            var imagenActual = thisScene.add.sprite(gWIDTH/2 + thisScene.desfaseX+8, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY,
                "track-tile-" + thisScene.levelData.tilemap, 10)

            // obj
            if (objectData) {
                objectData.forEach(o => {
                    addObject(parentObject, o.t, o.l, o.opts)
                })
            }

            // izq
            var paredIzq = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX -w.mid -15, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY + 95, 0.3, 0.2)
            paredIzq = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX -w.mid +20, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY + 20, 0.5, 0.55)
            paredIzq = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX -w.mid +60, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY - 80, 0.4, 0.2)

            // der
            var paredIzq = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX +w.mid -60, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY + 95, 0.3, 0.2)
            paredIzq = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX +w.mid -20 -5, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY + 20, 0.5, 0.55)
            paredIzq = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX +w.mid +15, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY - 80, 0.4, 0.2)


            thisScene.desfaseY += thisScene.heightElementoPista -3
            thisScene.desfaseX -= desfaseExtra
            parentObject.image = imagenActual
            parentObject.localDesfaseX = gWIDTH/2 + thisScene.desfaseX+8
        }

        function addMidCurveRight(objectData, parentObject) {
            var desfaseExtra = 45
            thisScene.desfaseX += desfaseExtra
            var imagenActual = thisScene.add.sprite(gWIDTH/2 + thisScene.desfaseX+2, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY,
                "track-tile-" + thisScene.levelData.tilemap, 13)

            // obj
            if (objectData) {
                objectData.forEach(o => {
                    addObject(parentObject, o.t, o.l, o.opts)
                })
            }
            
            // izq
            var paredIzq = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX +w.mid +15, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY + 95, 0.3, -0.2)
            paredIzq = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX +w.mid -20, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY + 20, 0.5, -0.55)
            paredIzq = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX +w.mid -60, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY - 80, 0.4, -0.2)

            // der
            var paredIzq = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX -w.mid +60, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY + 95, 0.3, -0.2)
            paredIzq = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX -w.mid +20, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY + 20, 0.5, -0.55)
            paredIzq = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX -w.mid -15, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY - 80, 0.4, -0.2)


            thisScene.desfaseY += thisScene.heightElementoPista -3
            thisScene.desfaseX += desfaseExtra+2
            parentObject.image = imagenActual
            parentObject.localDesfaseX = gWIDTH/2 + thisScene.desfaseX+2
        }

        function addMidObliqueLeft(objectData, parentObject) {
            var desfaseExtra = -43
            thisScene.desfaseX += desfaseExtra
            var imagenActual = thisScene.add.sprite(gWIDTH/2 + thisScene.desfaseX +6, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY,
                "track-tile-" + thisScene.levelData.tilemap, 16)

            // obj
            if (objectData) {
                objectData.forEach(o => {
                    addObject(parentObject, o.t, o.l, o.opts)
                })
            }

            // izq
            var paredIzq = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX - w.mid*0.93, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY, 1, 0.35)

            // der
            var paredDer = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX + w.mid*0.93, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY, 1, 0.35)
            
            thisScene.desfaseY += thisScene.heightElementoPista -3
            thisScene.desfaseX += desfaseExtra
            parentObject.image = imagenActual
            parentObject.localDesfaseX = gWIDTH/2 + thisScene.desfaseX+6
        }

        function addMidObliqueRight(objectData, parentObject) {
            var desfaseExtra = +44
            thisScene.desfaseX += desfaseExtra
            var imagenActual = thisScene.add.sprite(gWIDTH/2 + thisScene.desfaseX -10, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY,
                "track-tile-" + thisScene.levelData.tilemap, 19)

            // obj
            if (objectData) {
                objectData.forEach(o => {
                    addObject(parentObject, o.t, o.l, o.opts)
                })
            }

            // izq
            var paredIzq = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX - w.mid*0.93, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY, 1, -0.35)

            // der
            var paredDer = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX + w.mid*0.93, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY, 1, -0.35)
            
            thisScene.desfaseY += thisScene.heightElementoPista -3
            thisScene.desfaseX += desfaseExtra
            parentObject.image = imagenActual
            parentObject.localDesfaseX = gWIDTH/2 + thisScene.desfaseX-10
        }

        function addMidToWideRight(objectData, parentObject) {
            var imagenActual = thisScene.add.sprite(gWIDTH/2 + thisScene.desfaseX +55, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY,
                "track-tile-" + thisScene.levelData.tilemap, 22)

            // obj
            if (objectData) {
                objectData.forEach(o => {
                    addObject(parentObject, o.t, o.l, o.opts)
                })
            }
            // izq
            var paredIzq = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX - w.mid*0.91, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY)

            // der
            var paredDer = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX + w.mid*0.91 +70, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY-20, 1, -0.65)
            addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX + w.mid*0.91 +140, 
                thisScene.heightElementoPista*0.9 + thisScene.desfaseY, 0.18)
            

            thisScene.desfaseY += thisScene.heightElementoPista -3
            thisScene.desfaseX += 70
            parentObject.image = imagenActual
            parentObject.localDesfaseX = gWIDTH/2 + thisScene.desfaseX+55
        }

        function addMidToWideLeft(objectData, parentObject) {
            var imagenActual = thisScene.add.sprite(gWIDTH/2 + thisScene.desfaseX -70, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY,
                "track-tile-" + thisScene.levelData.tilemap, 25)

            // obj
            if (objectData) {
                objectData.forEach(o => {
                    addObject(parentObject, o.t, o.l, o.opts)
                })
            }
            // izq
            var paredIzq = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX - w.mid*0.91 -70, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY-20, 1, 0.65)
            addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX - w.mid*0.91 -140, 
                thisScene.heightElementoPista*0.9 + thisScene.desfaseY, 0.18)

            // der
            var paredDer = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX + w.mid*0.91, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY)
            

            thisScene.desfaseY += thisScene.heightElementoPista -3
            thisScene.desfaseX -= 70
            parentObject.image = imagenActual
            parentObject.localDesfaseX = gWIDTH/2 + thisScene.desfaseX-70
        }

        function addMidToWideCenter(objectData, parentObject) {
            var imagenActual = thisScene.add.sprite(gWIDTH/2 + thisScene.desfaseX -7, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY,
                "track-tile-" + thisScene.levelData.tilemap, 28)
            
            // obj
            if (objectData) {
                objectData.forEach(o => {
                    addObject(parentObject, o.t, o.l, o.opts)
                })
            }

            // izq
            var paredIzq = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX - w.mid*1.05, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY, 1.1, 0.29)

            // der
            var paredDer = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX + w.mid*1.05, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY, 1.1, -0.29)

            thisScene.desfaseY += thisScene.heightElementoPista -3
            parentObject.image = imagenActual
            parentObject.localDesfaseX = gWIDTH/2 + thisScene.desfaseX-7
        }

        function addMidToNarrowLeft(objectData, parentObject) {
            var imagenActual = thisScene.add.sprite(gWIDTH/2 + thisScene.desfaseX-40, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY,
                "track-tile-" + thisScene.levelData.tilemap, 2)
            
            // obj
            if (objectData) {
                objectData.forEach(o => {
                    addObject(parentObject, o.t, o.l, o.opts)
                })
            }

            // izq
            var paredIzq = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX - w.mid*0.92 , 
                thisScene.heightElementoPista/2 + thisScene.desfaseY)

            // der
            var paredDer = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX + w.mid*0.92 -70, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY+20, 1, 0.7)
            addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX + w.mid*0.92, 
                thisScene.heightElementoPista*0.1 + thisScene.desfaseY, 0.18)

            thisScene.desfaseY += thisScene.heightElementoPista -3
            thisScene.desfaseX -= 80
            parentObject.image = imagenActual
            parentObject.localDesfaseX = gWIDTH/2 + thisScene.desfaseX-40
        }

        function addMidToNarrowRight(objectData, parentObject) {
            var imagenActual = thisScene.add.sprite(gWIDTH/2 + thisScene.desfaseX+3, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY,
                "track-tile-" + thisScene.levelData.tilemap, 5)

            // izq
            var paredIzq = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX - w.mid*0.92 +70, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY+20, 1, -0.7)
            addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX - w.mid*0.92, 
                thisScene.heightElementoPista*0.1 + thisScene.desfaseY, 0.18)

            // obj
            if (objectData) {
                objectData.forEach(o => {
                    addObject(parentObject, o.t, o.l, o.opts)
                })
            }
            // der
            var paredDer = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX + w.mid*0.92, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY)

            thisScene.desfaseY += thisScene.heightElementoPista -3
            thisScene.desfaseX += 80
            parentObject.image = imagenActual
            parentObject.localDesfaseX = gWIDTH/2 + thisScene.desfaseX+3
        }

        function addMidToNarrowCenter(objectData, parentObject) {
            var imagenActual = thisScene.add.sprite(gWIDTH/2 + thisScene.desfaseX-50, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY,
                "track-tile-" + thisScene.levelData.tilemap, 8)
            
            // obj
            if (objectData) {
                objectData.forEach(o => {
                    addObject(parentObject, o.t, o.l, o.opts)
                })
            }
            // izq
            var paredIzq = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX - (w.mid+w.narrow)*0.45, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY, 1, -0.27)

            // der
            var paredDer = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX + (w.mid+w.narrow)*0.45, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY, 1, 0.27)

            thisScene.desfaseX += -5
            thisScene.desfaseY += thisScene.heightElementoPista -3
            parentObject.image = imagenActual
            parentObject.localDesfaseX = gWIDTH/2 + thisScene.desfaseX-50
        }

        function addNarrowRect(objectData, parentObject) {
            var imagenActual = thisScene.add.sprite(gWIDTH/2 + thisScene.desfaseX-46, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY,
                "track-tile-" + thisScene.levelData.tilemap, 11)

            // obj
            if (objectData) {
                objectData.forEach(o => {
                    addObject(parentObject, o.t, o.l, o.opts)
                })
            }

            // izq
            var paredIzq = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX - (w.narrow*0.9), 
                thisScene.heightElementoPista/2 + thisScene.desfaseY)

            // der
            var paredDer = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX + (w.narrow*0.9), 
                thisScene.heightElementoPista/2 + thisScene.desfaseY)

            thisScene.desfaseY += thisScene.heightElementoPista -3
            parentObject.image = imagenActual
            parentObject.localDesfaseX = gWIDTH/2 + thisScene.desfaseX-46
        }
        function addNarrowObliqueLeft(objectData, parentObject) {
            var dX = -40
            thisScene.desfaseX += dX
            var imagenActual = thisScene.add.sprite(gWIDTH/2 + thisScene.desfaseX+72, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY,
                "track-tile-" + thisScene.levelData.tilemap, 14)

            // obj
            if (objectData) {
                objectData.forEach(o => {
                    addObject(parentObject, o.t, o.l, o.opts)
                })
            }
            addParedDebug()
            // izq
            var paredIzq = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX - w.narrow*0.92, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY, 1.1, 0.35)

            // der
            var paredDer = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX + w.narrow*0.92, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY, 1.1, 0.35)

            thisScene.desfaseY += thisScene.heightElementoPista -3
            thisScene.desfaseX += dX-7
            parentObject.image = imagenActual
            parentObject.localDesfaseX = gWIDTH/2 + thisScene.desfaseX+72
        }
        function addNarrowObliqueRight(objectData, parentObject) {
            var dX = 40
            thisScene.desfaseX += dX
            var imagenActual = thisScene.add.sprite(gWIDTH/2 + thisScene.desfaseX-33, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY,
                "track-tile-" + thisScene.levelData.tilemap, 17)

            // obj
            if (objectData) {
                objectData.forEach(o => {
                    addObject(parentObject, o.t, o.l, o.opts)
                })
            }
            addParedDebug()
            // izq
            var paredIzq = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX - w.narrow*0.92, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY, 1, -0.35)

            // der
            var paredDer = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX + w.narrow*0.92, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY, 1, -0.35)

            thisScene.desfaseY += thisScene.heightElementoPista -3
            thisScene.desfaseX += dX+4
            parentObject.image = imagenActual
            parentObject.localDesfaseX = gWIDTH/2 + thisScene.desfaseX-33
        }
        function addNarrowToWideCenter(objectData, parentObject) {
            var imagenActual = thisScene.add.sprite(gWIDTH/2 + thisScene.desfaseX+18, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY,
                "track-tile-" + thisScene.levelData.tilemap, 20)
            
            // obj
            if (objectData) {
                objectData.forEach(o => {
                    addObject(parentObject, o.t, o.l, o.opts)
                })
            }

            // izq
            var paredIzq = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX - w.mid +37, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY, 1.1, 0.55)

            // der
            var paredDer = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX + w.mid -10, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY, 1.1, -0.65)

            thisScene.desfaseX += 22
            thisScene.desfaseY += thisScene.heightElementoPista -3
            parentObject.image = imagenActual
            parentObject.localDesfaseX = gWIDTH/2 + thisScene.desfaseX+18
        }

        function addNarrowToMidRight(objectData, parentObject) {
            var dX = 40
            thisScene.desfaseX += dX
            var imagenActual = thisScene.add.sprite(gWIDTH/2 + thisScene.desfaseX, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY,
                "track-tile-" + thisScene.levelData.tilemap, 23)

            // obj
            if (objectData) {
                objectData.forEach(o => {
                    addObject(parentObject, o.t, o.l, o.opts)
                })
            }
            // izq
            var paredDer = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX - w.narrow -dX/2, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY)

            // der
            var paredIzq = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX + w.narrow +27, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY-20, 1, -0.7)
            addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX + w.narrow +98, 
                thisScene.heightElementoPista*0.9 + thisScene.desfaseY, 0.18)

            thisScene.desfaseY += thisScene.heightElementoPista -3
            thisScene.desfaseX += dX
            parentObject.image = imagenActual
            parentObject.localDesfaseX = gWIDTH/2 + thisScene.desfaseX
        }

        function addNarrowToMidLeft(objectData, parentObject) {
            var dX = -40
            thisScene.desfaseX += dX
            var imagenActual = thisScene.add.sprite(gWIDTH/2 + thisScene.desfaseX+20, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY,
                "track-tile-" + thisScene.levelData.tilemap, 26)

            // obj
            if (objectData) {
                objectData.forEach(o => {
                    addObject(parentObject, o.t, o.l, o.opts)
                })
            }

            // izq
            var paredIzq = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX - w.narrow -27, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY-20, 1, 0.7)
            addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX - w.narrow -98, 
                thisScene.heightElementoPista*0.9 + thisScene.desfaseY, 0.18)

            // der
            var paredDer = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX + w.narrow -dX/2, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY)

                thisScene.desfaseY += thisScene.heightElementoPista -3
                thisScene.desfaseX += dX
                parentObject.image = imagenActual
                parentObject.localDesfaseX = gWIDTH/2 + thisScene.desfaseX+20
        }

        function addNarrowToMidCenter(objectData, parentObject) {
            var imagenActual = thisScene.add.sprite(gWIDTH/2 + thisScene.desfaseX -20, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY,
                "track-tile-" + thisScene.levelData.tilemap, 29)

            // obj
            if (objectData) {
                objectData.forEach(o => {
                    addObject(parentObject, o.t, o.l, o.opts)
                })
            }

            // izq
            var paredIzq = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX - (w.mid + w.narrow)*0.45, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY, 1, 0.32)

            // der
            var paredDer = addPared(parentObject,
                gWIDTH/2 + thisScene.desfaseX + (w.mid + w.narrow)*0.45 +7, 
                thisScene.heightElementoPista/2 + thisScene.desfaseY, 1, -0.36)

            thisScene.desfaseY += thisScene.heightElementoPista -3
            thisScene.desfaseX += 10 -3
            parentObject.image = imagenActual
            parentObject.localDesfaseX = gWIDTH/2 + thisScene.desfaseX-20
        }

        function addParedDebug() {
            /*
            thisScene.matter.add.rectangle(gWIDTH/2 + thisScene.desfaseX, thisScene.heightElementoPista/2 + thisScene.desfaseY, 3,200, {
                isStatic: true,
                isSensor: true
            })*/
        }

/*
        ignore this: is just to find this code part quickly
        Luz x Amity <3
        XXXKKKXXXX0xc'.  ........................................,ddddo;..'''''''''',,',;;:clodooooooooooooooooooooooooooooooddo
        XXXKKOxoc;'..  ....................................... .'lollllc,..'''''.'',;:::c:::;;;cooooooooooooooooooooddoolllclloo
        xoc;,..  ............................................ ..;:::;;;;;;',:lodxkO0KXXNNNXK0Odl::clllllllllllcccccllooooddxkO0K
        .  ................................................. .;cccclllllolckXNNNNNNNNNNNNNNNNNNNKxoccddddddddddxxkkOO0KKKKKKKKKK
        .............................................. .... .;c:;,,loooolckNNNNNNNNNNNNNNNNNNNNNNNKodKKKKKKKKKKKKKKKKKKKKKKKKKKK
        ..............................  ..............  ......... .:dooocxNNNNNNNNNNNNNNNNNNNNNNNNXooKKKKKKKKKKKKKKKKKKKKKKKKKKK
        .............................   ..............  ......... .cdddloKNNNNNNNNNNNNNNNNNNNNNNNNXc:0KKKKKKKKKKKKKKKKKKKKKKKKKK
        ............................   ...............  ......... .dKKkoONNNNNNNNNNNNNNNNNNNNNNNNNNo:kKKKKKKKKKKKKKKKKKKKKKKKKKK
        ...........................   ...............   ......... 'ONXxdXNNNNNNNNNKKNNNNNNNNNNNNNNNkcoOKKKKKKKKKKKKKKKKKKKKKKKKK
        ..........................  ...............   ........... ;0NKokNNNNNNXkxk0XNNNNNNNNNNNNNNW0oddkKKKKKKKKKKKKKKKKKKKKKKKK
        ........................   .............. .,:'............cXNOo0WNNNOlco0NNNNNNNNNNNNNNNNNNNxdkdx0KKKKKKKKKKKKKKKKKKKKKK
        ......................    ..........  ..';ldxo,......... .xNNdoXXKk:,l0NNNNNNNNNNNNNNNNNNNNNKdx0xxOKKKKKKKKKKKKKKKKKKKKK
        ....................    .....   ....';:cllccldo,....... .cKXKddN0:'c0NNNNNNNNNNNNNNNNNNNNNNNNKdkKOxxO0KKKKKKKKKKKKKKKKKK
        ....................      .,,;;:cc:::;;,,',,:dxl. ..    ;ONK0dxWXOONNNNNNNNNNNNNNNNNNNNNNNNNNNKdxKKOkxk0KKKKKKK00OOkkOKK
        ........................ 'lxxxxxddoooodddddxxddxc.     ,OXXK0oxNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNXkxOKK0kkxxkkkkOOkxdoood0
        ....................... .lxddddddddddddddddddddxd,   .:0XXXXKoxNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN0xxkkkkkxO0KXNWNKOkOolO
        ...................... .:dddddddddddddddddddolodxl. 'dKXXXXXXddNNNNNXXXNNNNNNNNNNNNNNNNNNNNNNNNNNNXOOKKNNNNNNK0O0OkkxldK
        ...................... 'oxddxddddddddddddddddoodxd;:OXXXXXXNNxdXNNNNXKXXNNNNNNNNNNNNNNNNNNNNNNNNNNNWNNNNNN0OOO0XKkkklo0K
        ..................... .:xddddddddddddddddddddddddxll0NXXXXXNWkdKWNNNKXNNNNNNNNNNKOO0XNNNNNNNNNNNNNNNNNNKOOOKNNNXOkkolOKK
        ..................... .lxddddddddddddddddddddddddxdlxXXXXXXNWOdKWNNXk0WNNNNNKko::oOXNNNNNNNNNNNNNNNNNK0OKNNNNNXOkkolOKKK
        ..................... 'oxddxddddddddddddddxddxddddxlo0NNNNXNW0d0NNNx,:loolc;..'l0NNXNNNNNNNNNNNNNNNNNXXNNNNNNXOkkolOKKKK
        ............  ....... .oxdxdddddddddddxxdoooddxoodddlokxxxddxxxKWNNXkl;'..';cxKXXXXXXNNNNNNNNNNNNNNNNNNNNNNNXOkxloOKKKKK
        .........'...  ...... .lxddddddddddoc;;,'....,;,;lddolloloxkO0XNNNNNNNXKKKKXXXXXXXXXXXXNNNNNNNNNNNNNXx;xNNNXOkdld0KKKKKK
        .... .;ldddoc;.........;dddxdddddl:,....',,,,',,,;looodc:x0KKXNNNNNNNNXXXXXXXXXXXXXXXXNNNNNNNNNNNNNN0l'lXNKOxllkKKKKKKKK
        ... .cdddxdddxc. ..... .lxddddddddoooooodddddddddooooodl:cxkkOXNNNNNNNXXXXXXKXXXXXXXXNNNNNNNNNNNNKO0XNXXKOdlld0KKKKKKKKK
        .. .;ddoc:lodxdc. ..... 'oxdddddoooooooooooooooooooooddddlcx0KNNNNNNNNXXXXXXXXXXXXXXNNNNNNNNNNNNNklxkkkxdddx0KKKK00KKKKK
        .. .lxddo:,,:cloo,...... 'odddddoooooooooooooooooooodddddod0NNNNNNNNNNNNXXXXXXXXNNNNNNNNNNNNNNWXxoOKKKKKKKKKKKKK0xxKKKKK
        .. .lxddddl:;,,,:lc'. .....lddddoooooooooooooooodddddddddcoKXNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNXdd0KKKKKKKKKKKKK0dx0KKKKK
        .. .cxddddddolccloddc'. .. .:ddddoooooooooooodddddddddddxdloodOXNNNNNNNNNNNNNNNNNNNNNNNNNNNNNKdd0KKKKK0kOKKKKKOdx0KKKKKK
        ... 'oxdddxdddolldxdddl;..  .'lddddddddddddddddddddddddddddxxdlkNNNNNNNNNNNNNNNNNNNNNNNNNNNNXdd0KKKKKOdx0KKKKOoxKKKKKKKK
        ...  'odddddd:. .;ddddxxdl:,'..;lddddddddddddddddddddddddddxxdd0NNNNNNNNNNNNNNNNNNNNNNNNNNNXxd0KKKK0xdOKKKKKkokKKKKKKKKK
        ....  .:odddxc...:docoxddddxdolloddddddddddddddddddddddddddxxcoXNNNNNNNNNNNNNNNNNNNNNNNNNNNkoOKKKKOdx0KKKK0ddOKKKKKKKKKK
        ...... ..;lodddoddc'.:ddddddddddddddxddddddddddddddddddddddxxc,dNNNNNNNNNNNNNNNNNNNNNNNNNN0okKKKKkdkKKKKKkdk0KKKKKKKKKK0
        ........ ...',;;,..  'dxdddddddddddddddddddddddddddddddddddddclddKNNNNNNNNNNNNNNNNNNNK0OO0xxKKK0xdOK00Okoldxxxxxxxkkkkkk
                             .:oddxdddddddddddddddddddddddddddddddxl;l0Xkdx0XNWNNNNNNNNNNKOkxxddkdoOOkxocoxOkkkkkO0000KKKKXXXNNN
                             .,;:loddxddddddddddddddddddddddddddxdlld0NNNXOkkkkkOOOOOOOOOOkOKNXxoldkOOOOkodKNNXOdlcclodk0XNNNNNN
                             .,;,;;:clodddxddddddxddddddddddddxollxKNNNNNNNNNXK0OO000KXXNNNNNNNNOd0WWNNNKkddxd;....   ...;o0NNNN
        :.                  .';,,,;,,;;::clloddddddxxdddxxxdollokKNNNNNNNNNNNNNNNNNNNNNNNNNNNX0dl,:0NNNNXOd:...............'dXNN
        ;.                  .,;;;,,,,,;;;,,;;;::cccccc:::cldxkKNNNNNNNNNNNNNNNNNNNNNNNNNNNNNO:.....;0NNN0c.........   ..... .dNN
                          .loc:;,,,,,;;;;;,,,,;;;::clooxk0XNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNO,.......,0Ko'..........     .... ,0N
               ..       .cOXXXK0kko;,;,,,;,;dO0KKKXNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN0:.........',................  ... 'OW
        '',;:ll,.    .,lOXXX0kdoloc'.'',;;,':lod0NNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNXkc'.............................  ...:KN
        KKKX0o'...,cokKXXXOo:;,;;;;;,,',,;:;,;,',oKXXXXXKKKKKKKKKKKXXXXXXXXNNNNNNNNNNNKc.................................  .;0NN
        XXXX0xxkO0XXXXXXKd;,,,'''',,,,;;;,,,.,;,''lOO0000KKKKKKKKKK0000K000KKKXXNNNNNXl..................................  :KNNN
        XXXXXXXXXXXXXXXXk;''''''''''''',,;:;'.,;,..;:;;::cclodxkO0KKKKKKK0000000KXNNWO,....................................cXNNN
*/




        function addObject(parentObject, tag, carril, opts = {}) {
            var tamCarril = (thisScene.widthElementoPista * 0.14)*0.95
            var desfaseCarril = tamCarril * (carril) - 3 * tamCarril
            var objX = gWIDTH/2 + thisScene.desfaseX + desfaseCarril
            var objY = thisScene.desfaseY + thisScene.heightElementoPista/2

            if (tag.substr(0,7) == 'sticker' || tag.substr(0,6) == 'filter' || tag.substr(0,8) == 'accesory') {
            //if (tag.substr(0,6) == 'unlook') {
                addSpecialObject(objX, objY, tag)
                return
            }

            switch (tag) {
                case 'platform':    addObsPlataforma(objX, objY); break;
                case 'really-big-fish':
                case 'big-fish':    
                case 'squid':       
                case 'frog':        
                case 'ice':        
                case 'log':        
                case 'seal':
                case 'wheel':       addObsStatic(parentObject, objX, objY, tag, carril); break;
                
                case 'ramp':        addObjRampa(objX, objY); break;
                
                case 'shark':
                case 'piranha':     
                case 'spikes':      addObsDesinflante(objX, objY, tag, carril, opts); break;

                case 'red-apple':       
                case 'green-apple':
                case 'cherry-banana':
                case 'guava':
                case 'grape':
                case 'mango':   
                case 'orange':      addFruta(objX, objY, tag); break;
                case 'go-left':
                case 'go-right':    addMovOso(objX,objY, tag); break;
            }
        }
        function addMovOso(pX, pY, tag) {
            var lado = tag.substring(3) == 'left' ? -1 : 1
            var movedor = thisScene.matter.add.image(pX, pY-100, 'osoCollider')
            movedor.setSensor(true)
            movedor.setStatic(true)
            movedor.alpha = 0
            movedor.body.label = tag
            movedor.lado = lado
            movedor.setCollisionCategory(DATA.categoriaIA)
            //globalDebugVariable = movedor
        }

        // power ups
        function addFruta(pX, pY, tag) {
            var frutaSprite = thisScene.add.sprite(pX, pY, 'fruit-'+tag)
            frutaSprite.setScale(0.7)
            var frutaCollider = thisScene.matter.add.circle(frutaSprite.x, frutaSprite.y, 70, {isSensor: true, isStatic: true})

            TweenMax.from(frutaSprite, DATA.t*1.2,{alpha:0.1, ease: Power2.easeOut}).yoyo(true).repeat(-1)

            frutaCollider.label = 'fruit-' + tag
            frutaCollider.ownSprite = frutaSprite
            frutaCollider.collisionFilter.category = DATA.categoriaPowerUps

            frutaSprite.play(tag + '-stand', true)

            thisScene.collectables.push(frutaCollider)
        }

        function addSpecialObject(pX, pY, tag) {
            thisScene.specialObjectCount[tag]++
            var sombra = thisScene.add.circle(pX, pY+57, 40, 0x000000, 0.17).setScale(1, 0.2)
            //var specialObjectSprite = thisScene.add.image(pX, pY, 'game-bonus', tag)
            var specialObjectSprite = thisScene.add.image(pX, pY, tag)
            var specialObjectCollider = thisScene.matter.add.circle(specialObjectSprite.x, specialObjectSprite.y, 70, {isSensor: true, isStatic: true})

            TweenMax.from(specialObjectSprite, DATA.t*1.2,{alpha:0.1, ease: Power2.easeOut}).yoyo(true).repeat(-1)
            TweenMax.from(specialObjectSprite, DATA.t*2.3,{y:specialObjectSprite.y -11, ease: Sine.easeInOut}).yoyo(true).repeat(-1)

            specialObjectCollider.label = tag.split("-")[0]
            specialObjectCollider.businessId = tag.split("-")[1]
            specialObjectCollider.idInLvl = thisScene.specialObjectCount[tag]
            specialObjectCollider.lvl = thisScene.currentLevel

            specialObjectCollider.ownSprite = specialObjectSprite
            specialObjectCollider.collisionFilter.category = DATA.categoriaPowerUps
            specialObjectCollider.sombra = sombra
            specialObjectCollider.collisionFilter.category = DATA.categoriaPowerUps

            thisScene.collectables.push(specialObjectCollider)
            //}
        }

        // obstacles
        function addObsPlataforma(pX, pY) {
            var plat = thisScene.matter.add.sprite(pX, pY, 'obsPlataforma', 7)
            plat.setScale(0.5)
            plat.setBody({
                type: 'rectangle',
                width: 110,
                height: 80
            })
            plat.setStatic(true)
            plat.depth = pY
            plat.label = "platform"
            plat.estado = "abajo"
            thisScene.objetosPista['plataforma'].push(plat)
            plat.anims.play('obs-plataforma-abajo', true)
            thisScene.time.delayedCall(DATA.balance.obstacles.TimePlatformDown*1000, subir, thisScene)

            function subir() {
                plat.estado = 'subir'
                plat.setCollisionCategory(DATA.categoriaObstaculosSolidos)
                plat.anims.play('obs-plataforma-subir', false).once('animationcomplete', ()=> {
                    plat.estado = 'arriba'
                    plat.anims.play('obs-plataforma-arriba', true)
                    thisScene.time.delayedCall(DATA.balance.obstacles.TimePlatformDown*1000, bajar, thisScene)
                })
            }
            function bajar() {
                plat.estado = 'bajar'
                plat.anims.play('obs-plataforma-bajar', false).once('animationcomplete', ()=> {
                    plat.estado = 'bajar'
                    plat.anims.play('obs-plataforma-abajo', true)     
                    plat.setCollisionCategory(undefined)
                    thisScene.time.delayedCall(DATA.balance.obstacles.TimePlatformUp*1000, subir, thisScene)
                })
            }
        }

        // obstacles
        /*function addObsPezGigante(pX, pY) {
            var pez = thisScene.matter.add.sprite(pX, pY, 'obsPezGigante', 0)
            pez.setScale(0.35)
            pez.setBody({
                type: 'circle',
                radius: 60
            })
            pez.setStatic(true)
            pez.setCollisionCategory(DATA.categoriaObstaculosSolidos)
            pez.depth = pY
            pez.label = "big-fish"
            thisScene.objetosPista['pezGigante'].push(pez)
        }*/

        function addObsStatic(parentObject, pX, pY, tag, carril) {
            if (carril >0.5 && carril <1.49) {
                addMovOso(pX,pY,'go-right')
            }
            if (carril >4.51 && carril <5.49) {
                addMovOso(pX,pY,'go-left')
            }
            var name = tag == 'really-big-fish' ? 'big-fish' : tag
            var staticObstacle = thisScene.add.sprite(pX, pY, 'obs-'+name)
            parentObject.objects.push(staticObstacle)
            staticObstacle.depth = pY
            var o = {}
            switch(tag) {
                case 'big-fish': o = {scale: 0.35, radius: 50, dX:0, dY: 5}; break;
                case 'really-big-fish': o = {scale: 0.9, radius: 70, dX:0, dY: 20}; break;
                case 'squid': o = {scale: 1.1, radius: 35, dX: +5, dY:-5}; break;
                case 'frog': o = {scale: 0.9, radius: 55, dX:0, dY:10}; break;
                case 'ice': o = {scale: 0.9, radius: 50, dX:0, dY:15}; break;
                case 'log': o = {scale: 1.18, radius: 55, dX:0, dY:0}; break;
                case 'wheel': o = {scale: 0.6, radius: 40, dX:0, dY:0}; break;
                case 'seal': o = {scale: 0.6, radius: 40, dX:0, dY:0}; break;
            }

            staticObstacle.setScale(o.scale)
            var staticObstacleCollider = thisScene.matter.add.circle(staticObstacle.x +o.dX, staticObstacle.y +o.dY, o.radius, {isStatic: true})
            //staticObstacleCollider.scale.x = o.scale
            staticObstacleCollider.label = tag
            staticObstacleCollider.collisionFilter.category = DATA.categoriaObstaculosSolidos
            staticObstacle.colliders = [staticObstacleCollider]

            if (tag == 'really-big-fish') {
                var colIzq = thisScene.matter.add.circle(pX-65, pY+30, o.radius*0.75, {isStatic: true})
                colIzq.collisionFilter.category = DATA.categoriaObstaculosSolidos
                var colDer = thisScene.matter.add.circle(pX+65, pY+30, o.radius*0.75, {isStatic: true})
                colDer.collisionFilter.category = DATA.categoriaObstaculosSolidos
                staticObstacle.colliders.push(colIzq)
                staticObstacle.colliders.push(colDer)
            }
            if (tag == 'seal') {
                var colIzq = thisScene.matter.add.circle(pX-60, pY+5, o.radius*0.65, {isStatic: true})
                colIzq.collisionFilter.category = DATA.categoriaObstaculosSolidos
                var colDer = thisScene.matter.add.circle(pX+60, pY+5, o.radius*0.65, {isStatic: true})
                colDer.collisionFilter.category = DATA.categoriaObstaculosSolidos
                staticObstacle.colliders.push(colIzq)
                staticObstacle.colliders.push(colDer)
            }
            thisScene.objetosPista[tag].push(staticObstacle)
            
            staticObstacle.removeItem = ()=> { 
                staticObstacle.colliders.forEach(s => {
                    thisScene.matter.world.remove(s)
                })
                staticObstacle.destroy()
            }
        }
        function addObsDesinflante(pX, pY, tag, carril, opts = {}) {
            var x = pX
            var s = true
            if (tag=='shark') {
                s = false
                x = gWIDTH/2 + thisScene.desfaseX
            }
            var obstaculo = thisScene.matter.add.sprite(x, pY, 'obs-'+tag, 0)
            obstaculo.setStatic(s)
            

            var bodyScale = tag == 'shark' ? 0.8 : 0.59
            obstaculo.setScale(bodyScale)
            var bodyRadius = tag == 'shark' ? 75 : 60
            obstaculo.setBody({
                type: 'circle',
                radius: bodyRadius
            })
            obstaculo.body.label = 'obs-'+tag
            thisScene.objetosPista[tag].push(obstaculo)
            

            obstaculo.setCollisionCategory(DATA.categoriaObstaculosDesinflantes)
            if (tag == 'spikes') {
                obstaculo.anims.play('anim-obs-spikes', true)
            }
            if (tag == 'piranha') {
                obstaculo.anims.play('anim-obs-piranha', true)
            }

            obstaculo.setIgnoreGravity(true)
            obstaculo.setStatic(true)
            //obstaculo.setSensor(true)

            function salirAModer() {
                thisScene.time.delayedCall(1000*DATA.balance.obstacles.TimeSharkDown, salirAModer, thisScene)
                if (obstaculo.lado == 0) return
                obstaculo.estado = 'afuera'
                if (obstaculo.lado == 1) { // si voy a la derecha
                    obstaculo.anims.play('anim-obs-shark-salir-derecha').once('animationcomplete', ()=> {
                        obstaculo.anims.play('anim-obs-shark-abajo-derecha', true)
                        obstaculo.estado = 'normal'
                    })
                }
                else if (obstaculo.lado == -1) { // si voy a la izquierda
                    obstaculo.anims.play('anim-obs-shark-salir-izquierda').once('animationcomplete', ()=> {
                        obstaculo.anims.play('anim-obs-shark-abajo-izquierda', true)
                        obstaculo.estado = 'normal'
                    })
                }
            }

            if (tag=='shark') {
                if (opts == {} || opts.alwaysDive == false) {
                    thisScene.time.delayedCall(1000*DATA.balance.obstacles.TimeSharkDown, salirAModer, thisScene)
                }
                obstaculo.anims.play('anim-obs-shark-abajo-derecha', true)
                obstaculo.setFrictionAir(0)
                obstaculo.setFriction(0)
                //obstaculo.setVelocityX(5)
                obstaculo.originY = 0.7

                obstaculo.paredIzq = thisScene.matter.add.rectangle(x - w.wide*0.85, pY, 30, 170, {isStatic: true, isSensor: true})
                obstaculo.paredIzq.collisionFilter = DATA.categoriaReboteTiburon
                obstaculo.paredDer = thisScene.matter.add.rectangle(x + w.wide*0.85, pY, 30, 170, {isStatic: true, isSensor: true})
                obstaculo.paredDer.collisionFilter = DATA.categoriaReboteTiburon

                obstaculo.setPosition(pX, pY)

                obstaculo.estado = 'normal'
                obstaculo.lado = 1
            }

            
        }

        function addObjRampa(pX, pY) {
            var rampa = thisScene.add.image(pX, pY, 'obsRampa')
            rampa.setScale(0.4)
            var rampaCollider = thisScene.matter.add.rectangle(rampa.x, rampa.y, 138, 70, {isStatic: true, isSensor: true})
            rampaCollider.label = "ramp"
            rampaCollider.collisionFilter.category = DATA.categoriaObstaculosSolidos
            rampaCollider.numero = thisScene.objetosPista['rampa'].length
            thisScene.objetosPista.rampa.push(rampaCollider)
        }

        function addEnd() {
            var nubeSprite = thisScene.add.image(gWIDTH/2 + thisScene.desfaseX, thisScene.desfaseY - thisScene.heightElementoPista, 'nubesLlegada')
            var llegadaSprite = thisScene.add.image(gWIDTH/2 + thisScene.desfaseX, thisScene.desfaseY - thisScene.heightElementoPista +300, 'llegada-'+thisScene.currentLevel)
            var llegadaCartelSprite = thisScene.add.image(llegadaSprite.x -300, llegadaSprite.y + 250, 'llegadaCartel')

            nubeSprite.depth = thisScene.desfaseY + 10
            llegadaSprite.depth = nubeSprite.depth+1
            llegadaCartelSprite.depth = nubeSprite.depth+200
            //thisScene.llegadaY = thisScene.desfaseY
        }
        



        // ----------------------------------------------   
        // --------------- Osos Section -----------------
        // ----------------------------------------------
        // #region osos
        

        var yLargada = -150

        class Colisionador extends Phaser.Physics.Matter.Image {
            constructor(desfaseX, desfaseY, tag, oso) {
                super(thisScene.matter.world, 0, 0, 'osoCollider')

                this.desfaseX = desfaseX
                this.desfaseY = desfaseY

                this.alpha = 0
                this.body.label = tag
                this.body.isSensor = true
                //rectMedio.setIgnoreGravity(true)
                this.setScale(0.65, 1.2)
                this.oso = oso
                this.oso.estadoColisionador = {
                    fullIzq: false,
                    med: false,
                    medIzq: false,
                    medDer: false,
                    cooldown: false
                }
                //this.setCollisionCategory(DATA.categoriaParedYOsos)
                this.setCollidesWith([DATA.categoriaObstaculosSolidos, DATA.categoriaParedYOsos])
            }
        }

        for (var i=0; i<3; i++) { // for each oso (c = osoCollider)
            this.ososSombras.push( this.add.circle(gWIDTH*(0.32 + 0.18*i), yLargada, 100, 0x000000, 0.3))
            this.ososSombras[i].setScale(0.5, 0.26)

            this.ososSprites.push( this.add.sprite(gWIDTH*(0.32 + 0.18*i), yLargada, thisScene.nombresOsos[i]))
            this.ososSprites[i].setScale(this.ososScale)
            this.ososSprites[i].alpha = 1

            this.ososColliders.push( this.matter.add.image(this.ososSprites[i].x, this.ososSprites[i].y, 'osoCollider'))
            var c = this.ososColliders[i]
            c.setCircle()
            c.setCollisionCategory(DATA.categoriaParedYOsos)
            c.setCollidesWith([1, DATA.categoriaParedYOsos, DATA.categoriaObstaculosSolidos, DATA.categoriaPowerUps, DATA.categoriaObstaculosDesinflantes, DATA.categoriaIA])
            c.setScale(1.05, 0.8)
            c.setBounce(0.6)
            c.alpha = 0//1 * debugMode b
            c.setFriction(0.05)
            c.setIgnoreGravity(true)

            c.prevVelocity = 0
            c.prevY = 1

            c.body.label = this.nombresOsos[i]
            this.ososSprites[i].label = this.nombresOsos[i]

            this.osos[this.nombresOsos[i]].sprite = this.ososSprites[i]
            this.osos[this.nombresOsos[i]].collider = c
            this.osos[this.nombresOsos[i]].sombra = this.ososSombras[i]

            // col check
            //var rectthis.matter.
            
            var colisionadores = [
                //new Colisionador(-180, 0, "iaColFullIzq", c), 
                new Colisionador(-31, 60, "iaColIzqMed", c), 
                //new Colisionador(0, 120, "iaColMed", c)//, 
                new Colisionador(55, 55, "iaColDerMed", c), 
                //new Colisionador(+240, 70, "derFull")
            ]
            
            c.colisionadores = colisionadores
        }

        /*this.matter.world.on('collisionactive', function(event, objeto, osoCollider) {
            var esUnOso = false
            thisScene.ososColliders.forEach(c => {
                esUnOso = esUnOso || c.body == osoCollider
            })           

            if (!esUnOso) return

            var osoObjeto = thisScene.osos[osoCollider.label]

            switch (objeto.label) {
                case 'go-left':
                case 'go-right': tomarAccion(osoCollider, objeto.gameObject.lado); break;
            }
        })*/
        /*function tomarAccion(osoCollider) {
            var estado = 100000 +
                o//soCollider.estadoColisionador.fullIzq*1000 +
                osoCollider.estadoColisionador.medIzq * 100 + 
                //osoCollider.estadoColisionador.med *     10 + 
                //osoCollider.estadoColisionador.medDer *   1 + 
                ""
            //
            estado = estado.substring(2)
            console.log(estado)
            if (estado == "1010") {
                thisScene.movX(osoCollider,1)
            }
            if (estado == "010") {
                thisScene.movX(osoCollider,-1)
            } else
            if (estado == "1110") {
                thisScene.movX(osoCollider,1)
            }
            if (estado == "0110") {
                thisScene.movX(osoCollider,-1)
            }

            osoCollider.estadoColisionador = {
                med: false,
                medIzq: false,
                medDer: false
            }
            osoCollider.cooldown = true
            thisScene.time.delayedCall(100, ()=> { osoCollider.estadoColisionador.cooldown = false })
        }*/

        // --------------------- checkers de colliders ----------------------
        this.matter.world.on('collisionstart', function (event, osoCollider, objeto) {
            /*if (objeto.label == "rectMedio" && objeto.oso.collider != thisScene.player) {
                console.log(event)
                console.log("Encontre un obstaculo")
            }*/

            /*var iaCol = osoCollider.gameObject
            if (osoCollider.label == "iaColMed") 
            {
                if (iaCol.oso == thisScene.player) return
                if (iaCol.oso.estadoColisionador.cooldown) return
                if (!iaCol.oso.estadoColisionador.med) // si el medio no esta haciendo nada
                {
                    iaCol.oso.estadoColisionador.med = true // detecto un obstaculo adelante

                    thisScene.time.delayedCall(10, ()=> { tomarAccion(iaCol.oso)}, thisScene)
                }
            }*/
            if (osoCollider.label == "iaColIzqMed") {
                if (osoCollider.gameObject.oso == thisScene.player) return
                //if (iaCol.oso.estadoColisionador.cooldown) return
                //iaCol.oso.estadoColisionador.medIzq = true
                tomarAccion(osoCollider.gameObject.oso, 1)
                //thisScene.movX(osoCollider.gameObject.oso, 1)
            } else
            if (osoCollider.label == "iaColDerMed") {
                if (osoCollider.gameObject.oso == thisScene.player) return
                //thisScene.movX(osoCollider.gameObject.oso, -1)
                tomarAccion(osoCollider.gameObject.oso, -1)
            }
            

            // -------------------------

            var esUnOso = false
            thisScene.ososColliders.forEach(c => {
                esUnOso = esUnOso || c.body == osoCollider
            })           

            if (!esUnOso) return

            

            var osoObjeto = thisScene.osos[osoCollider.label]
            switch (objeto.label) {
                case 'go-left':
                case 'go-right': tomarAccion(osoCollider.gameObject, objeto.gameObject.lado); break;
                //case 'ramp': thisScene.acelerarOso(osoObjeto); break;
                case 'obs-piranha':
                case 'obs-shark':
                case 'obs-spikes': pinchar(osoObjeto, objeto); break;
                /*case 'fruit-red-apple':
                case 'fruit-green-apple':
                case 'fruit-orange':
                case 'fruit-mango':
                case 'fruit-guava':
                case 'fruit-grape':
                case 'fruit-cherry-banana': if (DATA.osoSeleccionado == osoCollider.label) recogerFruta(objeto); break;
                case 'sticker':
                case 'filter':
                case 'accesory': if (DATA.osoSeleccionado == osoCollider.label) recogerObjetoEspecial(objeto); break;*/
            }
        });

        function tomarAccion(osoCollider, lado) {
            if (!thisScene.AICanPlay) return
            if (osoCollider != thisScene.player) {
                thisScene.movX(osoCollider, lado)
            }
        }

        function pinchar(oso, objetoPunzante) {
            if (objetoPunzante.label == 'obs-shark' && objetoPunzante.gameObject.estado == 'normal') return
            if (oso.label == DATA.osoSeleccionado) {
                game.scene.pause("GameScene")
                game.scene.run("InflateMinigameScene", {oso: oso, vecesDesinflado: thisScene.vecesDesinflado})
                game.scene.bringToTop("InflateMinigameScene")
                thisScene.vecesDesinflado++

                oso.collider.setCollidesWith([DATA.categoriaParedYOsos, DATA.categoriaObstaculosSolidos, DATA.categoriaPowerUps, DATA.categoriaIA])
                var immuneTime = DATA.balance.player.postInflateMinigameImmuneTime
                
                //oso.sprite.alpha = 0
                thisScene.tweens.add({
                    targets: oso.sprite,
                    alpha: { value: 0.3, duration: 1000*immuneTime/10, ease: 'Power1'},
                    yoyo: true,
                    loop: 10/2-2
                })

                thisScene.time.delayedCall(immuneTime*1000, ()=> {
                    oso.collider.setCollidesWith([DATA.categoriaParedYOsos, DATA.categoriaObstaculosSolidos, DATA.categoriaObstaculosDesinflantes, DATA.categoriaPowerUps, DATA.categoriaIA])
                }, thisScene)
            }
        }

        

        
        

        thisScene.acelerarOso = function acelerarOso(oso) {
            oso.velMax = thisScene.maxSpeedY*2
            oso.collider.setVelocityY(thisScene.maxSpeedY*2)
            oso.collider.setCollidesWith([DATA.categoriaParedYOsos, DATA.categoriaPowerUps])

            
            /*thisScene.time.delayedCall(DATA.t*1800, ()=> {
                
                
            })*/
            var t = thisScene.tAnimOsoAire
            oso.enAire = true
            //oso.t0EnAire = thisScene.time.now

            thisScene.tweens.add({
                targets: oso.sprite,
                duration: 300,
                originY: 1,
                scale: thisScene.ososScale*1.33,
                ease: 'Power2',
                yoyo: true,
                repeat: 0,
                onComplete: ()=> {
                    oso.velMax = thisScene.maxSpeedY;
                    oso.enAire = false
                    oso.collider.setCollidesWith([DATA.categoriaParedYOsos, DATA.categoriaObstaculosSolidos, DATA.categoriaPowerUps, DATA.categoriaObstaculosDesinflantes])
                }
            })
            /*var onCompleteTween = ()=> {
                
                console.log("this log is not working")
            }*/

            /*TweenMax.to(oso.sprite, t, {
                scale: thisScene.ososScale*1.33,
                ease: Bounce.easeOut,
                //y: -500
            })
            TweenMax.to(oso.sprite, t*0.75, {
                delay: t,
                scale: thisScene.ososScale*1.05,
                ease: Bounce.easeIn,
                //y: -500
            })
            TweenMax.to(oso.sprite, t*0.25, {
                delay: t*1.75,
                scale: thisScene.ososScale*1,
                ease: Bounce.easeIn,
                //y: -500
                onComplete: onCompleteTween
            })*/
        }

        // ----------------------------------------------
        // ------------------- player -------------------
        // ----------------------------------------------
        
        game.input.addPointer();

        var botonPausa = this.add.image(gWIDTH - 65, 55, 'botonPausa')
        var botonAudio = this.add.image(gWIDTH - 35 - botonPausa.width, 55, 'botonAudio')
        var botonAudioOff = this.add.image(gWIDTH - 35 - botonPausa.width, 55, 'botonAudioOff')

        DATA.animarBoton(botonPausa)
        DATA.animarBoton(botonAudio)
        DATA.animarBoton(botonAudioOff)

        
        botonPausa.on('pointerup', (pointer) => {
            trackEvent("game", "pause")
            thisScene.scene.pause()
            game.scene.start('OptionsScene', {parentScene: "GameScene"})
        })
        botonAudio.on('pointerup', (pointer) => {
            trackEvent("game", "audio:on")
            DATA.switchAudio()
        })
        botonAudioOff.on('pointerup', (pointer) => {
            trackEvent("game", "audio:off")
            DATA.switchAudio()
        })

        var iconoTiempo = this.add.image(gWIDTH/2 -150 -20, 65, 'iconoTiempo').setScale(1.2)
        var textoTiempo = this.add.text(gWIDTH/2 -20, 
            65, 
            DATA.tiempoATextoUnico(thisScene.levelData.time*1000), 
            {
                fontFamily: 'sunn',
                align: "center",
                fontSize: 120,
                color: '#000'
            })
        textoTiempo.setOrigin(0.5)
        var textoNivel = this.add.text(gWIDTH/2 -310 -20+ 30, 
            65, 
            "Nivel "+this.currentLevel, 
            {
                fontFamily: 'sunn',
                align: "center",
                fontSize: 70,
                color: '#000'
            })
        textoNivel.setOrigin(0.5)

        var trackPreview = this.add.image(gWIDTH*0.1, gHEIGHT/2, 'ingameTrack')

        this.spritesOsosEnPista = {
            panda: this.add.image(gWIDTH*0.1, 100, 'ingameTrackPanda'),
            pardo: this.add.image(gWIDTH*0.1, 100, 'ingameTrackPardo'),
            polar: this.add.image(gWIDTH*0.1, 100, 'ingameTrackPolar')
        }
        
        //#endregion

        thisScene.UI = [
            textoTiempo,
            iconoTiempo,
            botonAudio,
            botonPausa,
            trackPreview, //4
            this.spritesOsosEnPista['panda'],
            this.spritesOsosEnPista['pardo'],
            this.spritesOsosEnPista['polar'], //7
            botonAudioOff,
            textoNivel
        ]
        thisScene.UI.forEach(u => {
            u.setScrollFactor(0)
            u.visible = false
        })



        

        // anims
        thisScene.objetosPista['squid'].forEach(c => {
            c.play('calamarAnim', true)
        })
        thisScene.objetosPista['log'].forEach(c => {
            c.play('troncoAnim', true)
        })
        thisScene.objetosPista['frog'].forEach(c => {
            c.play('ranaAnim', true)
        })
        thisScene.objetosPista['ice'].forEach(c => {
            c.play('hieloAnim', true)
        })        
        thisScene.objetosPista['spikes'].forEach(c => { 
            c.play('anim-obs-spikes', true)
        })
        thisScene.objetosPista['piranha'].forEach(c => { 
            c.play('anim-obs-piranha', true)
        })
        thisScene.objetosPista['big-fish'].forEach(p => {
            p.play('pezGiganteAnim', true)
        })
        thisScene.objetosPista['really-big-fish'].forEach(p => {
            p.play('pezGiganteAnim', true)
        })
        thisScene.objetosPista['wheel'].forEach(p => {
            p.play('anim-obs-wheel', true)
        })
        thisScene.objetosPista['seal'].forEach(p => {
            p.play('anim-obs-seal', true)
        })

        function recogerFruta (objetoFrutal) {
            thisScene.collectables = DATA.removeFromArray(thisScene.collectables, objetoFrutal)
            DATA.sounds.points.play()
            var f = objetoFrutal.label.substring(6)
            if (thisScene.contadorFrutas[f] == undefined) {
                thisScene.contadorFrutas[f] = 1
            }
            else {
                thisScene.contadorFrutas[f]++
            }

            //objetoFrutal.sombra.destroy()
            objetoFrutal.ownSprite.play(f + '-collect', true )
            objetoFrutal.ownSprite.once(Phaser.Animations.Events.SPRITE_ANIMATION_COMPLETE, ()=> { 
                objetoFrutal.ownSprite.destroy()
                thisScene.matter.world.remove(objetoFrutal)
            })
        }

        function recogerObjetoEspecial (objetoEspecial) {
            thisScene.collectables = DATA.removeFromArray(thisScene.collectables, objetoEspecial)
            DATA.sounds.points.play()
            thisScene.tweens.add({
                targets: objetoEspecial.ownSprite,
                alpha: {value: 0, duration: DATA.t*3500, ease: 'Power2'},
                scale: {value: 3, duration: DATA.t*1500, ease: 'Power2'},
                onComplete: ()=> {
                    objetoEspecial.ownSprite.destroy()
                }
            })

            // sticker control
            thisScene.specialObjectCollected++
            DATA.specialObjectCallback(objetoEspecial)

            
            objetoEspecial.sombra.destroy()
            thisScene.matter.world.remove(objetoEspecial)
        }

        for (var i=0; i<=6; i++) {
            thisScene.dynamicStructure[i].show()
        }
    }


    //region update
    // ========================================================================================== 
    // ========================================= UPDATE ========================================= 
    // ========================================================================================== 
    update (worldTime, deltaTime)
    {
        this.UI[8].alpha = 1 -(DATA.soundActive || DATA.musicActive)
        this.UI[2].alpha = (DATA.soundActive || DATA.musicActive)

        if (this.startTime != 0 && worldTime - this.startTime > 2000) {
            this.AICanPlay = true
        }
        function recogerFruta (objetoFrutal) {
            thisScene.collectables = DATA.removeFromArray(thisScene.collectables, objetoFrutal)
            DATA.sounds.points.play()
            var f = objetoFrutal.label.substring(6)
            //trackEvent("ingame.level"+thisScene.currentLevel, "touch-bubble-fruit"+(thisScene.contadorFrutas[f]+1))
            if (thisScene.contadorFrutas[f] == undefined) {
                thisScene.contadorFrutas[f] = 1
            }
            else {
                thisScene.contadorFrutas[f]++
            }

            //objetoFrutal.sombra.destroy()
            objetoFrutal.ownSprite.play(f + '-collect', true )
            objetoFrutal.ownSprite.once(Phaser.Animations.Events.SPRITE_ANIMATION_COMPLETE, ()=> { 
                objetoFrutal.ownSprite.destroy()
                thisScene.matter.world.remove(objetoFrutal)
            })
        }

        function recogerObjetoEspecial (objetoEspecial) {
            thisScene.collectables = DATA.removeFromArray(thisScene.collectables, objetoEspecial)
            DATA.sounds.points.play()
            thisScene.tweens.add({
                targets: objetoEspecial.ownSprite,
                alpha: {value: 0, duration: DATA.t*3500, ease: 'Power2'},
                scale: {value: 3, duration: DATA.t*1500, ease: 'Power2'},
                onComplete: ()=> {
                    objetoEspecial.ownSprite.destroy()
                }
            })

            // sticker control
            thisScene.specialObjectCollected++
            if (!APP.standAloneMode) DATA.specialObjectCallback(objetoEspecial)

            
            objetoEspecial.sombra.destroy()
            thisScene.matter.world.remove(objetoEspecial)
        }
        
        var thisScene = this
        
        if (thisScene.player) {
            let indexDelPlayer = thisScene.getDynamicIndex(thisScene.player.y)
            let indexABorrar = this.dynamicStructure[indexDelPlayer-6]
            let indexACrear = this.dynamicStructure[indexDelPlayer+6]
            if (indexABorrar && indexABorrar.isShown) {
                indexABorrar.removeItem()
            }
            if (indexACrear && !indexACrear.isShown) {
                indexACrear.show()
            }

            for (var i=0; i<=2; i++) {
                let o = thisScene.ososColliders[i]
                if (o == thisScene.player) continue
                if (o.y < thisScene.player.y - (240-3)*6) {
                    let correctY = thisScene.dynamicStructure[thisScene.dynamicStructure.indexOf(indexABorrar)+4]
                    o.x = correctY ? correctY.localDesfaseX : gWIDTH/2
                    o.y = thisScene.player.y - (240-3)*5+100
                }
            }

            for (var i=0; i<=2; i++) {
                let o = thisScene.ososColliders[i]
                if (o == thisScene.player) continue
                let indexO = thisScene.getDynamicIndex(o.y)
                if (indexO < 0 || indexO > this.dynamicStructure.length-1) continue
                if (Math.abs(o.x - thisScene.dynamicStructure[indexO].localDesfaseX) > 400) {
                    //console.log("DISPOARO", indexO, thisScene.dynamicStructure[indexO].localDesfaseX, thisScene.dynamicStructure[indexO])
                    o.x = thisScene.dynamicStructure[indexO].localDesfaseX
                }
            }
        }
        
        thisScene.UI.forEach(u => {
            u.depth = 90000
        })
        

        
        // iniciar largada
        if (!DATA.hayUnOsoSeleccionado) {
            game.scene.start("CharacterSelectionScene", {level: thisScene.currentLevel})
            game.scene.bringToTop("CharacterSelectionScene")
            thisScene.scene.pause()
        } else
        
        //else 
        if (thisScene.hayQueLargar) {
            trackEvent("game","level:"+thisScene.currentLevel+ ":play")
            thisScene.startTime = worldTime
            thisScene.UI.forEach(u => {
                u.visible = true
                u.depth += this.desfaseY+1000
            })

            thisScene.player = thisScene.osos[DATA.osoSeleccionado].collider            

            // camera
            thisScene.camaraPrincipal.startFollow(thisScene.puntoInicialCamara)
            TweenMax.to(thisScene.puntoInicialCamara, DATA.t*3, {
                x: thisScene.player.x,
                y: thisScene.player.y,
                ease: Power4.easeOut,
                onComplete: ()=> {                     
                    prepararLargada()
                    thisScene.camaraPrincipal.stopFollow()
                    thisScene.camaraPrincipal.startFollow(thisScene.player)
                }
            })
            thisScene.ososSprites.forEach(s => {
                TweenMax.from(s, DATA.t*2, {
                    alpha: 0,
                    ease: Power0.easeOut,
                    onComplete: ()=> {
                    }
                })
            })

            thisScene.time.delayedCall(3000, ()=> {
                thisScene.sePuedeAcelerar = true
            }, thisScene)
            thisScene.hayQueLargar = false

            thisScene.llegadaY = 350 + (240-3)*(thisScene.dynamicStructure.length-1)
            //return
        }

        thisScene.objetosPista['rampa'].forEach(rampa => {
            thisScene.ososColliders.forEach(oso => {
                DATA.circularBodyCollisionCheck(rampa, 80, oso.body, 70, ()=> {
                //DATA.rectangularBodyCollisionCheck(rampa, oso.body, ()=> {
                    let osoObjeto = thisScene.osos[oso.body.label]
                    if (osoObjeto.rampasAgarradas.indexOf(rampa.numero) == -1) // si no existe, es la primera vez que la toca
                    { 
                        osoObjeto.rampasAgarradas.push(rampa.numero)
                        thisScene.acelerarOso(osoObjeto)
                        thisScene.time.delayedCall(500, ()=> {
                            osoObjeto.rampasAgarradas = DATA.removeFromArray(osoObjeto.rampasAgarradas, rampa.numero)
                        }, thisScene)
                    }
                    else {
                    }
                })
            })
        })
        
        thisScene.collectables.forEach(c => {
            if (thisScene.player) {
                DATA.circularBodyCollisionCheck(thisScene.player.body, 90, c, 70, ()=> {
                    switch(c.label) {
                        case 'fruit-red-apple':
                        case 'fruit-green-apple':
                        case 'fruit-orange':
                        case 'fruit-mango':
                        case 'fruit-guava':
                        case 'fruit-grape':
                        case 'fruit-cherry-banana': recogerFruta(c); break;
                        case 'sticker':
                        case 'filter':
                        case 'accesory': recogerObjetoEspecial(c); break;
                    }
                })
            }
        })

        //thisScene.objetosPista[]

        function prepararLargada() {
            largar()
        }
        function largar() {
            thisScene.playerHasControl = true
            Object.values(thisScene.osos).forEach(o => {
                o.collider.setIgnoreGravity(false)
            })
            //trackEvent("ingame.clock", "ok.level"+thisScene.currentLevel)
            thisScene.timeEndEvent = thisScene.time.addEvent({
                delay: thisScene.partida_tDisp,
                callback: finDelTiempo,
                callbackScope: thisScene
            })
            thisScene.contandoTiempo = true
        }

        if (DATA.cuentaAtras && thisScene.contandoTiempo) {
            thisScene.partida_tRest = thisScene.partida_tDisp*(1-thisScene.timeEndEvent.getProgress())
            thisScene.UI[0].setText(DATA.tiempoATextoUnico(thisScene.partida_tRest))
        }
        function finDelTiempo() {
            this.terminarPartida({
                puestos: [],
                stars: 0,
                ganaste: false,
                bonus: thisScene.specialObjectCollected,
                tiempo: thisScene.partida_dT,
                frutas: thisScene.contadorFrutas,
                largoPista: thisScene.largoPista
            })
        }
        
        function actualizarPuestos() {
            var puestoPanda = thisScene.ososColliders[0].y // panda
            var puestoPardo = thisScene.ososColliders[1].y // pardo
            var puestoPolar = thisScene.ososColliders[2].y // polar

            var primerLugar = 'panda'
            var segundoLugar = 'pardo'
            var tercerLugar = 'polar'
            
            if (puestoPanda >= puestoPardo && puestoPardo >= puestoPolar) {
                primerLugar = 'panda'
                segundoLugar = 'pardo'
                tercerLugar = 'polar'
            }
            else if (puestoPanda >= puestoPolar && puestoPolar >= puestoPardo) {
                primerLugar = 'panda'
                segundoLugar = 'polar'
                tercerLugar = 'pardo'
            }
            else if (puestoPardo >= puestoPanda && puestoPanda >= puestoPolar) {
                primerLugar = 'pardo'
                segundoLugar = 'panda'
                tercerLugar = 'polar'
            }
            else if (puestoPardo >= puestoPolar && puestoPolar >= puestoPanda) {
                primerLugar = 'pardo'
                segundoLugar = 'polar'
                tercerLugar = 'panda'
            }
            else if (puestoPolar >= puestoPardo && puestoPardo >= puestoPanda) {
                primerLugar = 'polar'
                segundoLugar = 'pardo'
                tercerLugar = 'panda'
            }
            else if (puestoPolar >= puestoPanda && puestoPanda >= puestoPardo) {
                primerLugar = 'polar'
                segundoLugar = 'panda'
                tercerLugar = 'pardo'
            }

            thisScene.ososLugares = [
                { label:  primerLugar, y: thisScene.osos[primerLugar].collider.y + thisScene.osos[primerLugar].llego*200 }, 
                { label: segundoLugar, y: thisScene.osos[segundoLugar].collider.y + thisScene.osos[primerLugar].llego*100 }, 
                { label:  tercerLugar, y: thisScene.osos[tercerLugar].collider.y }
            ]            
        }
        actualizarPuestos()

        // actualizar minimapa
        for(var i=0; i<=2; i++) {
            if (thisScene.player == undefined) break;
            this.spritesOsosEnPista[this.nombresOsos[i]].y = this.getPorcentajePista(this.osos[this.nombresOsos[i]].collider.y) + 180
            this.spritesOsosEnPista[this.nombresOsos[i]].depth = this.getPorcentajePista(this.osos[this.nombresOsos[i]].collider.y)*10 +thisScene.desfaseY+90001
        }

        this.ososColliders.forEach(oso => {
            oso.setAngularVelocity(0)

            if (oso.body.velocity.y > this.maxSpeedY) {
                if (thisScene.osos[oso.body.label].velMax > this.maxSpeedY) {
                    oso.setVelocityY(oso.body.velocity.y - this.brakeAccelerationY)
                }
                else {
                    oso.setVelocityY(this.maxSpeedY)
                }
            }
            /*if (oso != thisScene.player) {

            }*/
            oso.colisionadores[0].setPosition(oso.x + oso.colisionadores[0].desfaseX, oso.y + oso.colisionadores[0].desfaseY)
            oso.colisionadores[1].setPosition(oso.x + oso.colisionadores[1].desfaseX, oso.y + oso.colisionadores[1].desfaseY)
        })

        // movimiento osos
        this.input.on('pointerdown', (pointer)=> {
            if (!thisScene.playerHasControl) return

            if (pointer.x < gWIDTH/2)
            {
                this.movX(this.player, -1)
            }
            else if (pointer.x > gWIDTH/2)
            {
                this.movX(this.player, 1)
            }
        })

        if (thisScene.playerHasControl) {
            this.input.keyboard.on("keydown-LEFT", (key)=> {
                this.player.setVelocityX(-this.hSpeed)
            })
            this.input.keyboard.on("keydown-RIGHT", (key)=> {
                this.player.setVelocityX(this.hSpeed)
            })
        }
        
        var minSpeedToChangeAnim = 1
        for (var i = 0; i<3; i++) {
            var osoActual = this.osos[this.ososSprites[i].label]
            if (osoActual.enAire) {
                this.ososSprites[i].updateDisplayOrigin()
                /*var yMax = this.yMaxAnimOsoAire
                var tX = thisScene.time.now/1000
                var tAnim = this.tAnimOsoAire
                var t = Math.pow(tX - osoActual.t0EnAire/1000 -tAnim, 2)
                var a = (-yMax) / (Math.pow(tAnim, 2))
                osoActual.desfaseSpriteY = a*t + yMax*/
            }
            
            this.ososSprites[i].x = this.ososColliders[i].x
            this.ososSprites[i].y = this.ososColliders[i].y - 30 - osoActual.desfaseSpriteY
            this.ososSombras[i].x = this.ososColliders[i].x
            this.ososSombras[i].y = this.ososColliders[i].y - 10

            if (osoActual.velMax > this.maxSpeedY) {
                this.ososSprites[i].play(thisScene.nombresOsos[i] + 'Rapido', true)
            }
            else if (this.ososColliders[i].body.velocity.x < -minSpeedToChangeAnim) {
                this.ososSprites[i].play(thisScene.nombresOsos[i] + 'Izquierda', true)
                osoActual.collider.setVelocityX(osoActual.collider.body.velocity.x +thisScene.brakeAccelerationX)
            }
            else if (this.ososColliders[i].body.velocity.x > minSpeedToChangeAnim) {
                this.ososSprites[i].play(thisScene.nombresOsos[i] + 'Derecha', true)
                osoActual.collider.setVelocityX(osoActual.collider.body.velocity.x -thisScene.brakeAccelerationX)
            }
            else {
                this.ososSprites[i].play(thisScene.nombresOsos[i] + 'Normal', true)
            }

            // debug AI
            /*if (osoActual.collider != thisScene.player && thisScene.sePuedeAcelerar) {
                if (osoActual.collider.prevVelocity != undefined &&
                    osoActual.collider.prevVelocity == osoActual.collider.body.velocity.y &&
                    osoActual.collider.prevY == osoActual.collider.body.position.y)
                {
                    thisScene.acelerarOso(osoActual)
                }
                else {
                    osoActual.collider.prevVelocity = osoActual.collider.body.velocity.y
                    osoActual.collider.prevY = osoActual.collider.body.position.y
                }
            }*/
        }        
        
        // anims shark
        thisScene.objetosPista['shark'].forEach( shark => {
            if (shark.x > shark.paredDer.position.x -30) {
                shark.anims.play('anim-obs-shark-giro-derecha', false)
                
                shark.lado = -0.1
                
                //shark.setVelocityX(0)

                shark.once('animationcomplete', ()=> {
                    shark.anims.play('anim-obs-shark-abajo-izquierda', false)
                    shark.lado = -1
                    
                    //shark.setVelocityX(-5)
                })
            }
            else
            if (shark.x < shark.paredIzq.position.x +30) {
                shark.anims.play('anim-obs-shark-giro-izquierda', false)
                shark.lado = 0.1
                
                //shark.setVelocityX(0)

                shark.once('animationcomplete', ()=> {
                    shark.anims.play('anim-obs-shark-abajo-derecha', false)
                    shark.lado = 1
                    
                    //shark.setVelocityX(+5)
                })
            }
            shark.x += 3*shark.lado
        })
        
        // colision fin
        Object.values(thisScene.osos).forEach(oso => {
            // depth sorting
            oso.sprite.depth = oso.collider.y <= 0? 1 : oso.collider.y

            // if llegada
            if (thisScene.llegadaY != 0 && oso.collider.y > thisScene.llegadaY-50 && oso.llego == 0) {
                llegoAlFinal(oso);
            }
        })
        function llegoAlFinal(oso) {
            thisScene.puestoActual++
            oso.llego = 1
            oso.collider.setIgnoreGravity(true)
            oso.collider.setScale(0)
            oso.sprite.alpha = 0
            oso.sombra.alpha = 0
            oso.sombra.destroy()
            var osoAnimado = thisScene.add.sprite(oso.collider.x, oso.collider.y, oso.label, 0)
            thisScene.ososAnimacionFinal[oso.label] = osoAnimado
            osoAnimado.alpha = 0
            osoAnimado.depth = thisScene.desfaseY + 20 - thisScene.puestoActual
            
            //thisScene.children.bringToTop(osoAnimado)
            TweenMax.to(osoAnimado, DATA.t*2, { alpha: 1, ease: Power0.easeNone})
            TweenMax.to(osoAnimado, DATA.t, { 
                y: osoAnimado.y + 170-35*thisScene.puestoActual, 
                ease: Power0.easeNone
            })

            
            oso.collider.y += 20 + 2*thisScene.puestoActual
            oso.collider.setToSleep()
            // if player
            if (!(DATA.osoSeleccionado == oso.label)) return

            thisScene.camaraPrincipal.stopFollow()
            thisScene.camaraPrincipal.startFollow(osoAnimado)
            thisScene.partida_tiempoFinal = thisScene.partida_tDisp*thisScene.timeEndEvent.getProgress()
            thisScene.playerHasControl = false

            thisScene.ososPuestosFinales = [
                thisScene.ososLugares[0].label, 
                thisScene.ososLugares[1].label, 
                thisScene.ososLugares[2].label
            ]
            var puestoDeMiOso = 0
            if (DATA.osoSeleccionado == thisScene.ososPuestosFinales[0]) {
                puestoDeMiOso = 1
            }
            else if (DATA.osoSeleccionado == thisScene.ososPuestosFinales[1]) {
                puestoDeMiOso = 2
            }
            else if (DATA.osoSeleccionado == thisScene.ososPuestosFinales[2]) {
                puestoDeMiOso = 3
            }
            thisScene.time.delayedCall(2000, ()=> {
                thisScene.terminarPartida({
                    puestos: thisScene.ososPuestosFinales,
                    bonus: thisScene.specialObjectCollected,
                    stars: 4-puestoDeMiOso,
                    ganaste: puestoDeMiOso != 3? true : false,
                    tiempo: thisScene.partida_tiempoFinal,
                    frutas: thisScene.contadorFrutas,
                    largoPista: thisScene.largoPista
                })  
            }, thisScene)
        }

        // depth animacion fin
        for (var i=0; i<=2; i++) {
            if (thisScene.ososAnimacionFinal[thisScene.nombresOsos[i]] != false) {
                thisScene.ososAnimacionFinal[thisScene.nombresOsos[i]].depth = thisScene.ososAnimacionFinal[thisScene.nombresOsos[i]].y
            }
        }
    }
    // //#endregion
}