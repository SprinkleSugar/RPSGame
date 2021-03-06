var gamejs = require('gamejs');
var font = require('gamejs/font');
var mask = require('gamejs/mask');
var screenWidth = 1200;
var screenHeight = 600;
var spriteSize = 128;
var numSprites = 4;
var up = 1, down = 2, left = 4, right = 8, canChange = 16; formChange = 32;
var forms = [];
var timeBetweenHits = 300;
var timeSinceHit = 0;
var activeGame = true;
var defaultFont = new font.Font("40px Arial");
var bestTwoOutOfThree = false;
var player1Score = 0;
var player1;
var player2;

function Player(placement, formIndex){
  this.placement = placement;
  this.yPlacement = 80;
  this.form = forms[formIndex];
  this.mask = 16;
  this.hit = false;
  this.health = 30;
};
Player.prototype.changeForm = function(index) {
  this.form = forms[index];
};
Player.registerHit = function(player1, player2){
  player1Index = player1.form.index;
  player2Index = player2.form.index;
  if (player1Index !== player2Index) {
    if(player1Index === 0){
      if (player2Index === 1) {
        player1.hit = true;
      }else if (player2Index === 2) {
        player2.hit = true;
      };
    }else if (player1Index === 1){
      if (player2Index === 0) {
        player2.hit = true;
      }else if (player2Index === 2) {
        player1.hit = true;
      };
    }else if (player1Index === 2){
      if (player2Index === 0) {
        player1.hit = true;
      }else if (player2Index === 1) {
        player2.hit = true;
      };
    }else{
      player1.hit = true;
    }
    if(player2Index === 3){
      player2.hit = true;
    }
    if(player2Index !== player1Index || player1Index === 3){
      timeSinceHit = 0;
    };
  }
};
Player.prototype.update = function(msDuration) {
  if (this.mask & formChange) {
    if (this.mask & canChange) {
      this.changeForm((this.form.index+3-1)%3);
      this.mask &= ~canChange;
    }
    /*
      if (this.mask & canChange) {
        this.changeForm((this.form.index+1)%3);
        this.mask &= ~canChange;
      }*/
  }
  if(this.mask & up){
    if (this.yPlacement > 0) {
      this.yPlacement -= 14;
    }
  }
  if(this.mask & down){
    if (this.yPlacement < 470) {
      this.yPlacement += 14;
    }
  };
  if(this.mask & left){
    if(this.placement > 0){
      this.placement = this.placement - 14;
    }
  }else if(this.mask & right){
    if(this.placement < 1000){
      this.placement = this.placement + 14;
    }
  }
  if(this.hit===true){
    this.health = this.health -3;
    this.hit = false;
  };
};

Player.prototype.draw = function(display) {
  display.blit(this.form.image, [this.placement, this.yPlacement]);
};

function main() {
  var display = gamejs.display.setMode([screenWidth, screenHeight]);
  var sprites = gamejs.image.load('fireicewater.png');
  var surfaceCache = [];
  var maskCache = [];
  for (var i = 0; i < numSprites; i++){
    var surface = new gamejs.Surface([spriteSize, spriteSize]);
    var rect = new gamejs.Rect(spriteSize*i, 0, spriteSize, spriteSize);
    var imgSize = new gamejs.Rect(0, 0, spriteSize, spriteSize);
    surface.blit(sprites, imgSize, rect);
    surfaceCache.push(surface);
    var maskCacheElement = mask.fromSurface(surface);
    maskCache.push(maskCacheElement);
  };
  forms = [
    {index: 0,
      image: surfaceCache[0],
      mask: maskCache[0]},
    {index: 1,
      image: surfaceCache[1],
      mask: maskCache[1]},
    {index: 2,
      image: surfaceCache[2],
      mask: maskCache[2]},
    {index: 3,
      image: surfaceCache[3],
      mask: maskCache[3]}
  ];

  function handleEvent(event) {
    if(event.type === gamejs.event.KEY_DOWN){
      if (event.key === gamejs.event.K_ENTER) {
        player2.mask |= formChange;
      } else if(event.key === gamejs.event.K_UP){
        player2.mask |= up;
        player2.mask &= ~down;
      }else if(event.key === gamejs.event.K_DOWN){
        player2.mask |= down;
        player2.mask &= ~up;
      }else if(event.key === gamejs.event.K_LEFT){
        player2.mask |= left;
        player2.mask &= ~right;
      }else if(event.key === gamejs.event.K_RIGHT){
        player2.mask |= right;
        player2.mask &= ~left;
      }else if (event.key === gamejs.event.K_SPACE) {
        player1.mask |= formChange;
      } else if(event.key === gamejs.event.K_w){
        player1.mask |= up;
        player1.mask &= ~down;
      }else if(event.key === gamejs.event.K_s){
        player1.mask |= down;
        player1.mask &= ~up;
      }else if(event.key === gamejs.event.K_a){
        player1.mask |= left;
        player1.mask &= ~right;
      }else if(event.key === gamejs.event.K_d){
        player1.mask |= right;
        player1.mask &= ~left;
      }
    } else if(event.type === gamejs.event.KEY_UP){
      if (event.key === gamejs.event.K_ENTER) {
        player2.mask &= ~formChange;
        player2.mask |= canChange;
      } else if(event.key === gamejs.event.K_UP){
        player2.mask &= ~up;
      }else if(event.key === gamejs.event.K_DOWN){
        player2.mask &= ~down;
      }else if(event.key === gamejs.event.K_RIGHT){
        player2.mask &= ~right;
      }else if(event.key === gamejs.event.K_LEFT){
        player2.mask &= ~left;
      }else if (event.key === gamejs.event.K_SPACE) {
        player1.mask &= ~formChange;
        player1.mask |= canChange;
      } else if(event.key === gamejs.event.K_w){
        player1.mask &= ~up;
      }else if(event.key === gamejs.event.K_a){
        player1.mask &= ~left;
      }else if(event.key === gamejs.event.K_s){
        player1.mask &= ~down;
      }else if(event.key === gamejs.event.K_d){
        player1.mask &= ~right;
      }
    }
  };

  function gameTick(msDuration) {
    if(activeGame){
      gamejs.event.get().forEach(function(event) {
        handleEvent(event);
      });
      display.clear();
      if(timeSinceHit > timeBetweenHits){
        var hasMaskOverlap = player1.form.mask.overlap(player2.form.mask, [player1.placement - player2.placement, player1.yPlacement - player2.yPlacement]);
        if (hasMaskOverlap) {
          Player.registerHit(player1, player2);
        };
      }else{
        timeSinceHit +=msDuration;
      };
      player1.update(msDuration);
      player2.update(msDuration);
      display.blit(defaultFont.render("FIRE", "#FF3700"), [390, 0]);
      display.blit(defaultFont.render("ICE", "#8766CE"), [520, 0]);
      display.blit(defaultFont.render("WATER", "#3E7ED2"), [620, 0]);
      display.blit(defaultFont.render("Player 1: ", "#000000"), [0, 500]);
      display.blit(defaultFont.render(player1.health, "#000000"), [170, 500]);
      display.blit(defaultFont.render("Controls: W A S D SPACE", "#000000"), [0, 540]);
      display.blit(defaultFont.render("Player 2: ", "#000000"), [600, 500]);
      display.blit(defaultFont.render(player2.health, "#000000"), [770, 500]);
      display.blit(defaultFont.render("Controls: \u2191 \u2193 \u2190 \u2192 ENTER", "#000000"), [600, 540]);
      player1.draw(display);
      player2.draw(display);
      if(player1.health === 0 || player2.health === 0){
        activeGame = false;
        if (player1.health === 0){
          display.blit(defaultFont.render("Player 1 Defeated", "#000000"), [0, 320]);
          player1Score--;
        }
        if (player2.health === 0){
          display.blit(defaultFont.render("Player 2 Defeated", "#000000"), [600, 320]);
          player1Score++;
        }
        if (!bestTwoOutOfThree) {
          var confirmMoreGame = confirm("Best two out of three?");
          if (confirmMoreGame) {
            restart();
            bestTwoOutOfThree = true;
          }
        } else if ((player1Score > -2) && (player1Score < 2)) {
          var confirmContinue = confirm("Continue?");
          if (confirmContinue) {
            restart();
          }
        } else {
          var confirmExtraGames = confirm("One player died. More game?");
          if (confirmExtraGames) {
            location.reload();
          }
        }
      };
    };
  };
  player1 = new Player(0, 3);
  player2 = new Player(1000, 3);
  gamejs.time.fpsCallback(gameTick, this, 60);
};

function restart() {
  activeGame = true;
  player1 = new Player(0, 3);
  player2 = new Player(1000, 3);
  console.log("restart");
}

gamejs.preload(['fireicewater.png']);
gamejs.ready(main);

//var audio = new Audio('Kalimba.mp3');
//audio.play();
