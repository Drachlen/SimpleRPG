/**
 * %SRPG%
 * 2011 Kevin Tyma (drachlen@gmail.com)
 * 
 **/

var viewport; //points to the render area
var tickInterval; //points to our setInterval call of tick()
var frame; //current render frame
var grid = []; //intended for collision detection vs map
var keystate = {}; //currently pressed keys
var queuedKey = {}; //keys that have been pressed, but not yet processed
var player = { //the local player
  allowInput:0, //whether the client is accepting input for commands
  inputDelay:0, //delay between hotkeys
  lastInput:0, //last input time
  name:-1, //local username
  zoneSN:-1, //local zone
  zoneID:-1, //local zone id
  x:-1, //local x position
  y:-1, //local y position
  speed:150, //player movement speed
  lastmove:0, //the last time we moved
  actions:[], //our bound abilities
  abilities:[1,2], //abilities that our character has
  performingAction:-1, //whether or not we're doing something (primarily for 0-9 hotkeys)
  globalActionDelay:10, //our default "in between action" time.
  lastActionDelay:0, //the delay timer from the last action (some actions delay longer)
  cooldownTimers:[], //all of our cooldown timers, by -type-
  lastAction:0, //the last time we did an ability
  cursorspeed:100, //the speed of the look cursor
  lastcursor:0, //the last time the cursor moved
  cursor:{x:-1,y:-1}, //where the cursor points 
  cursorFocus:-1, //id to an entity if the cursor is over a -single- entity.
  weapondelay:1000, //player weapon delay
  lastattack:0, //the last time we attacked
  canLoot:-1, //id to lootable corpse
  canTrade:-1, //id to tradable person
  lootingItem:-1, //id to current item slot on corpse potentially being looted
  view:0, //if we're looking at a menu
  lookingAt:-1, //id to entity we're looking at from looklist
  target:-1, //id of our target
  equipment: [0,0,0,0,0,0,0,0,0,0,0,0,0], //an array of item id's that we're wearing
  buffs: [], //any spells affecting us
  basestats: [0,0,0,0,0,0,0], //points we've spent toward stats
  inventory: [], //a list of item id's that we're carrying
  weight: 0, //the sum of all our equipment, inventory, and gold.
  chatting:0, //if our chat box is open
  chatlock:0, //if we have chat lock enabled
  HP: [0,0], //cur hp, max hp
  MP: [0,0], //cur mana, max mana
  EN: [0,0], //cur endurance, max endurance
  XP: [0,0], //cur XP, max XP
  ac: 0, //armor class
  atk: 0, //attack
  gold:0, //money
  lastTellFrom:-1, //name of last person to private message us
  loading:0, //when transitioning between areas
  archetype:0, //our archetype
  class:0, //our class
  attributes: {
     AC: 0,
    ATK: 0,
     HP: 0,
     MP: 0,
    STR: 0,
    STA: 0,
    AGI: 0,
    DEX: 0,
    INT: 0,
    WIS: 0,
    CHA: 0,
    SVM: 0,
    SVF: 0,
    SVC: 0,
    SVP: 0,
    SVD: 0
  }
};
//used when making a trade with another player:
var trading = {
  weOffer: {
    items:[],
    gold:0
  },
  theyOffer: {
    items:[],
    gold:0
  }
};
var tradeRequestFrom = -1;
var tradeRequestTo = -1;
var tradeWith = -1;
var tradeAccepted=0;
var tradeTheyAccept=0;

//current item being viewed on screen. hold the state
var currentDisplayedItem = {id:-1,slot:-1,droppable:1};
//current ability on screen
var currentDisplayedAbility = -1;
var currentDisplayedAbilityHotkey = -1;
//current item being considered for destroying. hold the state
var currentDestroy = {id:-1,slot:-1};

var groupInviteFrom = -1;
var groupInviteFromName = -1;
var inGroup = -1;
var groupLeader = 0;
var group = [];

var chatExpand=0;
var merchantID = -1;
var merchantList=[];



var map = [];

var entityGFX = {
  goblin:'goblin',
  bat:'bat',
  spider:'spider',
  corpse:'corpse'
}

//var globalItemList = [];

var debugWindow=0;

var _ = 0;