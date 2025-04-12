let StickStatus =
{
    xPosition: 0,
    yPosition: 0,
    x: 0,
    y: 0,
    cardinalDirection: "C"
};


var JoyStick = (function(container)
{
   //parametri da modificare per variare carateristiche del joystick (possibile inserimento al loro utilizzo ma così più semplice modifica)
    parameters ={};
    var title = "joystick",
        width = 0,
        height =  0,
        internalFillColor = "#000000",
        internalLineWidth = 2,
        internalStrokeColor = "#19247c",
        externalLineWidth = 2,
        externalStrokeColor = "#000000",
        autoReturnToCenter = true ;

    callback = function(StickStatus) {};

    // Creazione oggetto canvas e aggiunta al suo container 
    var objContainer = document.getElementById(container);
    
    objContainer.style.touchAction = "none";

    var canvas = document.createElement("canvas");
    canvas.id = title;
    if(width === 0) { width = objContainer.clientWidth; }
    if(height === 0) { height = objContainer.clientHeight; }
    canvas.width = width;
    canvas.height = height;
    objContainer.appendChild(canvas);
    var context=canvas.getContext("2d");


   //Creazione caratteristiche del joystick che poi cnavas andrà a disegnare 
    var pressed = 0; // Bool - 1=Yes - 0=No
    var circumference = 2 * Math.PI;
    var internalRadius = (canvas.width-((canvas.width/2)+ 20))/2;
    var maxMoveStick = internalRadius + 5;
    var externalRadius = internalRadius + 30;
    var centerX = canvas.width / 2;
    var centerY = canvas.height / 2;
    var directionHorizontalLimitPos = canvas.width / 10;
    var directionHorizontalLimitNeg = directionHorizontalLimitPos * -1;
    var directionVerticalLimitPos = canvas.height / 10;
    var directionVerticalLimitNeg = directionVerticalLimitPos * -1;

    // Salvataggio della posizione corrente del joystick 
    var movedX=centerX;
    var movedY=centerY;

    // Check del supporto o no al touch
    if("ontouchstart" in document.documentElement)
    {
        canvas.addEventListener("touchstart", onTouchStart, false);
        document.addEventListener("touchmove", onTouchMove, false);
        document.addEventListener("touchend", onTouchEnd, false);
    }
    else
    {
        canvas.addEventListener("mousedown", onMouseDown, false);
        document.addEventListener("mousemove", onMouseMove, false);
        document.addEventListener("mouseup", onMouseUp, false);
    }
    // Dusegno del joystick
    drawExternal();
    drawInternal();

    //Metodi privati
    
     //Disegno del cerchio esterno
     
    function drawExternal()
    {
        context.beginPath();
        context.arc(centerX, centerY, externalRadius, 0, circumference, false);
        context.lineWidth = externalLineWidth;
        context.strokeStyle = externalStrokeColor;
        context.stroke();
    }

    
    //Disegno del cerchio interno alla posizione corrente 
     
    function drawInternal()
    {
        context.beginPath();
        if(movedX<internalRadius) { movedX=maxMoveStick; }
        if((movedX+internalRadius) > canvas.width) { movedX = canvas.width-(maxMoveStick); }
        if(movedY<internalRadius) { movedY=maxMoveStick; }
        if((movedY+internalRadius) > canvas.height) { movedY = canvas.height-(maxMoveStick); }
        context.arc(movedX, movedY, internalRadius, 0, circumference, false);
        // creazione gradiente 
        var grd = context.createRadialGradient(centerX, centerY, 5, centerX, centerY, 200);
        // Colore chiaro 
        grd.addColorStop(0, internalFillColor);
        // COlore scuro
        grd.addColorStop(1, internalStrokeColor);
        context.fillStyle = grd;
        context.fill();
        context.lineWidth = internalLineWidth;
        context.strokeStyle = internalStrokeColor;
        context.stroke();
    }

    
     //gestore eventi touch
     
    let touchId = null;
    function onTouchStart(event)
    {
        pressed = 1;
        touchId = event.targetTouches[0].identifier;
    }

    function onTouchMove(event)
    {
        if(pressed === 1 && event.targetTouches[0].target === canvas)
        {
            movedX = event.targetTouches[0].pageX;
            movedY = event.targetTouches[0].pageY;
            // Gestione offset
            if(canvas.offsetParent.tagName.toUpperCase() === "BODY")
            {
                movedX -= canvas.offsetLeft;
                movedY -= canvas.offsetTop;
            }
            else
            {
                movedX -= canvas.offsetParent.offsetLeft;
                movedY -= canvas.offsetParent.offsetTop;
            }
            // Eliminazione e ricreazione canvas
            context.clearRect(0, 0, canvas.width, canvas.height);
            
            drawExternal();
            drawInternal();

            // Set attributi per il callback
            StickStatus.xPosition = movedX;
            StickStatus.yPosition = movedY;
            StickStatus.x = (100*((movedX - centerX)/maxMoveStick)).toFixed();
            StickStatus.y = ((100*((movedY - centerY)/maxMoveStick))*-1).toFixed();
            StickStatus.cardinalDirection = getCardinalDirection();
            callback(StickStatus);
        }
    }

    function onTouchEnd(event)
    {
        if (event.changedTouches[0].identifier !== touchId) return;

        pressed = 0;
        // Se necessario reset della posizione
        if(autoReturnToCenter)
        {
            movedX = centerX;
            movedY = centerY;
        }
        // Eliminazione e ricreazione oggetto 
        context.clearRect(0, 0, canvas.width, canvas.height)

        drawExternal();
        drawInternal();

        // Set atributi per il callback
        StickStatus.xPosition = movedX;
        StickStatus.yPosition = movedY;
        StickStatus.x = (100*((movedX - centerX)/maxMoveStick)).toFixed();
        StickStatus.y = ((100*((movedY - centerY)/maxMoveStick))*-1).toFixed();
        StickStatus.cardinalDirection = getCardinalDirection();
        callback(StickStatus);
    }

    //Gesione eventi mouse 
    function onMouseDown(event) 
    {
        pressed = 1;
    }

    function onMouseMove(event) 
    {
        if(pressed === 1)
        {
            movedX = event.pageX;
            movedY = event.pageY;
            // Gestione offset
            if(canvas.offsetParent.tagName.toUpperCase() === "BODY")
            {
                movedX -= canvas.offsetLeft;
                movedY -= canvas.offsetTop;
            }
            else
            {
                movedX -= canvas.offsetParent.offsetLeft;
                movedY -= canvas.offsetParent.offsetTop;
            }
            // Eliminazione e ridisegno del canvas
            context.clearRect(0, 0, canvas.width, canvas.height);
            
            drawExternal();
            drawInternal();

            // Set attributi di callback
            StickStatus.xPosition = movedX;
            StickStatus.yPosition = movedY;
            StickStatus.x = (100*((movedX - centerX)/maxMoveStick)).toFixed();
            StickStatus.y = ((100*((movedY - centerY)/maxMoveStick))*-1).toFixed();
            StickStatus.cardinalDirection = getCardinalDirection();
            callback(StickStatus);
        }
    }

    function onMouseUp(event) 
    {
        pressed = 0;
        // Se richiesto reset della poazione 
        if(autoReturnToCenter)
        {
            movedX = centerX;
            movedY = centerY;
        }
        // Eliminazione e ricreazione del canvas
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        drawExternal();
        drawInternal();

        // Set attributi di callback
        StickStatus.xPosition = movedX;
        StickStatus.yPosition = movedY;
        StickStatus.x = (100*((movedX - centerX)/maxMoveStick)).toFixed();
        StickStatus.y = ((100*((movedY - centerY)/maxMoveStick))*-1).toFixed();
        StickStatus.cardinalDirection = getCardinalDirection();
        callback(StickStatus);
    }

    function getCardinalDirection()
    {
        let result = "";
        let orizontal = movedX - centerX;
        let vertical = movedY - centerY;
        
        if(vertical >= directionVerticalLimitNeg && vertical <= directionVerticalLimitPos)
        {
            result = "C";
        }
        if(vertical < directionVerticalLimitNeg)
        {
            result = "N";
        }
        if(vertical > directionVerticalLimitPos)
        {
            result = "S";
        }
        
        if(orizontal < directionHorizontalLimitNeg)
        {
            if(result === "C")
            { 
                result = "W";
            }
            else
            {
                result += "W";
            }
        }
        if(orizontal > directionHorizontalLimitPos)
        {
            if(result === "C")
            { 
                result = "E";
            }
            else
            {
                result += "E";
            }
        }
        
        return result;
    }

    //Metodi pubblici

    //larghezza dfel canvas 
    this.GetWidth = function () 
    {
        return canvas.width;
    };

    //altezza del canvas
    this.GetHeight = function () 
    {
        return canvas.height;
    };

    //Posizione relativa x 
    this.GetPosX = function ()
    {
        return movedX;
    };

    //posizione relativa y 
    this.GetPosY = function ()
    {
        return movedY;
    };

    //Posizione normalizzata di x e di y 
    this.GetX = function ()
    {
        return (100*((movedX - centerX)/maxMoveStick)).toFixed();
    };

    this.GetY = function ()
    {
        return ((100*((movedY - centerY)/maxMoveStick))*-1).toFixed();
    };

    //Direzione del cursore come stringa 
    this.GetDir = function()
    {
        return getCardinalDirection();
    };
});