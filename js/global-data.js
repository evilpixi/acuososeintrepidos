class DATA {
    constructor() {}
}
DATA.t = 0.3
DATA.pausedDebug = false
DATA.isLogged = true
try {
    window.parent.sendCode("isLogged").then((res)=> {
        DATA.isLogged = res
    })
} catch(e) {
    //console.warn("can't ask if user logged", e)
}
DATA.osoSeleccionado = 'pardo'
DATA.hayUnOsoSeleccionado = false

DATA.playerFrameRate = 20
DATA.widthElementoPista = 880 //316 //1897 // width / 3
DATA.heightElementoPista = 240 //120 //720 // height / 3

DATA.animarBoton = (boton) => {
    boton.setInteractive()
    boton.on('pointerover', ()=> {
        TweenMax.to(boton, DATA.t*1.2, {scale:1.2, ease: Back.easeOut.config(3)})
    })
    boton.on('pointerout', ()=> {
        TweenMax.to(boton, DATA.t/3, {scale:1, ease: Back.easeOut.config(3)})
    })
}

// level management
DATA.getGameProgress = function () {
    var p = []
    if (!localStorage.getItem('level_1_unlocked')) return null

    for (var i=1; i<=20; i++) {
        p.push({
            unlocked: JSON.parse(localStorage.getItem('level_'+i+'_unlocked')),
            bestTime: Number(localStorage.getItem('level_'+i+'_best_time')),
            stars: Number(localStorage.getItem('level_'+i+'_stars')),
            //stickerCollected: JSON.parse(localStorage.getItem('level_'+i+'_sticker_collected')),
            //filterCollected: JSON.parse(localStorage.getItem('level_'+i+'_filter_collected')),
            score: Number(localStorage.getItem('level_'+i+'_score'))
        })
    }
    return p
}
DATA.setNewGameProgress = function() {
    var p = []
    for (var i=1; i<=20; i++) {
        var l = {
            unlocked: i==1,
            bestTime: 0,
            stars: 0,
            stickerCollected: false,
            filterCollected: false,
            score: 0
        }
        localStorage.setItem('level_'+i+'_unlocked', l.unlocked)
        localStorage.setItem('level_'+i+'_best_time', l.bestTime)
        localStorage.setItem('level_'+i+'_stars', l.stars)
        //localStorage.setItem('level_'+i+'_sticker_collected', l.stickerCollected)
        //localStorage.setItem('level_'+i+'_filter_collected', l.filterCollected)
        localStorage.setItem('level_'+i+'_score', l.score)


        p.push(l)
    }

    return p
}
DATA.getLastUnlockedLevel = function () {
    var contador = 0
    for (var i=0; i<20; i++) {
        if (DATA.progress[i].unlocked) {
            contador++
        }
    }

    return contador
}
DATA.progress =  DATA.getGameProgress() || DATA.setNewGameProgress()
DATA.currentLevel = DATA.getLastUnlockedLevel()
DATA.gotIt = JSON.parse(localStorage.getItem('gotIt')) || false

// AUDIO
if (localStorage.getItem('music_active')==null) { // if not exist
    localStorage.setItem('music_active', 1)
    DATA.musicActive = 1
} else { DATA.musicActive = parseInt(localStorage.getItem('music_active')) }

if (localStorage.getItem('sound_active')==null) { // if not exist
    localStorage.setItem('sound_active', 1)
    DATA.soundActive = 1
} else { DATA.soundActive = parseInt(localStorage.getItem('sound_active')) }

DATA.sounds = { 
    youWon: false,
    youLost: false,
    points: false
}
DATA.musics = {
    mainMusic: false,
    gameMusic: false
}

DATA.stopMusic = function () {
    for (var m in DATA.musics) {
        if (DATA.musics[m])  DATA.musics[m].stop()
    }
}
//DATA.playSound(soundTag, context)

DATA.playMusic = function (musicTag) {
    DATA.musics[musicTag].play({ loop: true})
}

DATA.switchSound = (val = !DATA.soundActive)=> {
    DATA.soundActive = val
    for (var s in DATA.sounds) {
        if (DATA.sounds[s]) DATA.sounds[s].setVolume(1*DATA.soundActive)
    }
    localStorage.setItem('sound_active', 1*val)
    return DATA.soundActive
}
DATA.switchMusic = (val = !DATA.musicActive)=> {
    DATA.musicActive = val
    for (var m in DATA.musics) {
        if (DATA.musics[m]) DATA.musics[m].setVolume(1*DATA.musicActive)
    }
    localStorage.setItem('music_active', 1*val)
    return DATA.musicActive
}
DATA.switchAudio = (val = !(DATA.soundActive || DATA.musicActive)) => {
    DATA.switchSound(val)
    DATA.switchMusic(val)
    
    return val
}

// game flow
DATA.endGame = ()=> {
    game.scene.stop("GameScene")
    game.scene.remove("GameScene")
}

// time helpers
DATA.cuentaAtras = true
DATA.tiempoATexto = (tX, t0, desfase, tF)=> {
    t = tX - t0 - desfase
    if (DATA.cuentaAtras) {
        t = tF - t
    }
    var min = Math.trunc(t/60000)
    var minT = "" + (min<10 ? "0"+min : min)

    var seg = Math.trunc(t/1000 - min*60)
    var segT = "" + (seg<10 ? "0"+seg : seg)

    var msg = Math.trunc((t - seg*1000 - min*60000)/10 )
    var msgT = "" + (msg<10 ? "0"+msg : msg)
    return (t<0) ? "00:00:00" : minT +":"+ segT +":"+ msgT
}
DATA.tiempoATextoUnico = (t)=> {
    var min = Math.trunc(t/60000)
    var minT = "" + (min<10 ? "0"+min : min)

    var seg = Math.trunc(t/1000 - min*60)
    var segT = "" + (seg<10 ? "0"+seg : seg)

    var msg = Math.trunc((t - seg*1000 - min*60000)/10 )
    var msgT = "" + (msg<10 ? "0"+msg : msg)
    return (t<0) ? "00:00:00" : minT +":"+ segT +":"+ msgT
}

//score helpers
DATA.balance = {}
DATA.getScore = function(length, fruits, time) {
    var usedFruits = Object.keys(fruits)
    return length * DATA.balance.scorePerLevelLength +
        DATA.balance.scorePerFruit[usedFruits[0]] * fruits[usedFruits[0]] +
        DATA.balance.scorePerFruit[usedFruits[1]] * fruits[usedFruits[1]] +
        DATA.balance.scorePerFruit[usedFruits[2]] * fruits[usedFruits[2]] +
        DATA.balance.scorePerSecond * Math.round(time/1000)
}
DATA.getTotalScore = function(k) {
    var n = 0
    for (var i=1; i<=20; i++) {
        if (localStorage.getItem('level_'+i+'_unlocked')=='true') n++
        else break;
    }

    for (var i=1; i<=n; i++) {

    }
}

DATA.levelData = {}
DATA.specialObjectCallback = function(specialObject) {    
    var name = specialObject.label + '-' + specialObject.businessId
    //var index = DATA.levelBonusDistribution[name].indexOf(name+"__"+specialObject.lvl+"__"+specialObject.idInLvl)
    //trackEvent("ingame.level"+specialObject.lvl, "touch.bubble-"+name+"-"+index)
    var objetoABuscar = ''+ name + '__' + specialObject.lvl +'__'+ specialObject.idInLvl

    var callbackIndex = DATA.levelBonusDistribution[name].indexOf(objetoABuscar) + 1
    
    var localStorageSave = localStorage.getItem(name+'_'+callbackIndex)
    if (localStorageSave == null) // si aun no existe
    { 
        localStorage.setItem(name+'_'+callbackIndex, Math.sqrt(specialObject.lvl*0.777+13)*44+'-'+Math.sin(specialObject.idInLvl*0.1212+77))
    }

    let text = 'unlook'
    switch(name) {
        case 'accesory-1': text+= 'headphones'; break;
        case 'accesory-2': text+= 'headselfie'; break;
        case 'accesory-3': text+= 'headband'; break;
        case 'filter-1': text+= 'filter'; break;
        case 'filter-2': 
        case 'sticker-1':
        case 'sticker-2': text+= name.split("-").join(""); break;
    }
    text += "_"+(callbackIndex)
    try {
        let cryptText
        cryptText= CryptoJS.SHA256(text)
        window.parent.sendCode(text.toString(CryptoJS.enc.Base64))

        var cant = 0
        var max = DATA.levelBonusDistribution[name].length
        for (var i = 0; i < max; i++) {
            if (localStorage.getItem(name+'_'+(i+1)) != null) cant++
        }
        cryptText = CryptoJS.SHA256(text.split("_")[0])
        if (cant == max && cant != 0) {
            window.parent.sendCode(cryptText.toString(CryptoJS.enc.Base64))
            //console.log("hice todos")
            //window.parent.sendCode(text.split("_")[0])
            trackEvent("gift", name.split("-").join(":"))
        }
    }
    catch (e) {
        console.warn('EVENTO SOCIAL TOOON: '+text.split("_")[0]+'\n'+e)
    }
}

DATA.last_level = 20

DATA.levelBonusDistribution = {}
DATA.configureLevel = ()=> {
    [ APP.accesories_names, APP.stickers_names, APP.filters_names].forEach(bList => {
        bList.forEach(item => {
            DATA.levelBonusDistribution[item] = []
        })
    })

    var names = Object.keys(DATA.levelBonusDistribution)

    for (var i=1; i<=DATA.last_level; i++) // for each level
    { 
        var counter = {}
        names.forEach(n => { counter[n] = 0})
        DATA.levelData["level"+i].structure.forEach(tile =>  // for each structure lvl
        {
            if (tile.length == 1) return
            tile[1].forEach(object => // for each specific object in a tile
            { 
                names.forEach(name => 
                {
                    if (object.t == name) 
                    { // if its a special object
                        counter[name]++
                        var obj = ''+ name + '__'+ i +'__'+ counter[name]
                        /*{
                            lvl: i,
                            label: name,
                            idInLvl: counter[name]
                        }*/
                        DATA.levelBonusDistribution[name].push(obj)
                    }
                })
            })

        })

    }
}

DATA.rectangularBodyCollisionCheck = (rect_a, rect_b, callback) => {
    if ( (rect_b.bounds.min.x <= rect_a.bounds.max.x && 
          rect_a.bounds.max.x <= rect_b.bounds.max.x ||
          rect_b.bounds.min.x <= rect_a.bounds.min.x && 
          rect_a.bounds.min.x <= rect_b.bounds.max.x)
        &&
         (rect_b.bounds.min.y <= rect_a.bounds.max.y && 
          rect_a.bounds.max.y <= rect_b.bounds.max.y ||
          rect_b.bounds.min.y <= rect_a.bounds.min.y && 
          rect_a.bounds.min.y <= rect_b.bounds.max.y) )
    {
        callback.call()
    }
}

DATA.categoriaParedYOsos
DATA.categoriaObstaculosSolidos
DATA.categoriaPowerUps
DATA.categoriaObstaculosDesinflantes
DATA.categoriaReboteTiburon
DATA.categoriaIA

DATA.circularBodyCollisionCheck = (circ_a, radius_a, circ_b, radius_b, callback) => {
    let dx = circ_b.position.x - circ_a.position.x
    let dy = circ_b.position.y - circ_a.position.y
    let dist = Math.sqrt( dx**2 + dy**2 )

    if (radius_a + radius_b >= dist) {
        callback.call()
    }
}

DATA.removeFromArray = (anArray, obj)=> {
    let i = anArray.indexOf(obj)
    if (i == -1) return anArray
    let a = anArray
    var l=anArray.length;
    if (l)
    {
        while (i<l){
            a[i++] = a[i];
        }--a.length;
    }
    return a
}
