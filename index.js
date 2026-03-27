// import omi game engine
import { Omi } from "./assets/modules/Omi.js"

// mobile devices identification flags
const isIOS = /iPad|iPhone|iPod/i.test(navigator.userAgent) && !window.MSStream
const isAndroid = /android/i.test(navigator.userAgent)

// get device type
const device = isAndroid || isIOS ? "mobile" : "desktop"

// player teams
const teams = [
  new Omi.Team("NS"),
  new Omi.Team("EW")
]

// player names
const names = ["south", "east", "north", "west"]

// suits and names mapping
const suits = { south: "clubs", east: "diamonds", north: "spades", west: "hearts" }

// players
const players = [
  new Omi.Player("south", teams[0]),
  new Omi.Player("east", teams[1]),
  new Omi.Player("north", teams[0]),
  new Omi.Player("west", teams[1])
]

// difficulty levels
const levels = ["easy", "medium", "hard"]

// get current origin
const origin = new URL(import.meta.url).origin

// assets to preload
const assets = [
  // fonts
  "/assets/fonts/Inter-Regular.ttf",
  "/assets/fonts/Inter-Bold.ttf",
  // common
  "/assets/images/logo.png",
  "/assets/images/backgrounds/default.png",
  "/assets/images/cards/default.png",
  // suits
  "/assets/images/suits/clubs.png",
  "/assets/images/suits/diamonds.png",
  "/assets/images/suits/hearts.png",
  "/assets/images/suits/spades.png",
  // trumps
  "/assets/images/trumps/clubs.png",
  "/assets/images/trumps/diamonds.png",
  "/assets/images/trumps/hearts.png",
  "/assets/images/trumps/spades.png"
]

// helper to preload assets
const preload = async () => {
  for (let i = 0; i < assets.length; i++) {
    await fetch(origin + assets[i])
  }
}

// helper to sleep delay
const sleep = time => new Promise(resolve => setTimeout(resolve, time ?? 600))

// helper to create trump selection
const createTrumps = (suit, selectable) => (
  // reduce name into trumps object
  names.reduce((output, name) => {
    // create trump card
    const card = new Omi.Card(null, suits[name], "idle")
    // switch by props
    if (selectable) {
      // make card selectable
      card.tag = "selectable"
    } else if (suit) {
      // highlight or disabled specific card
      card.tag = suits[name] === suit ? "selected" : "disabled"
    }
    // assign card into output
    return { ...output, [name]: card }
  }, {})
)

// helper to select intelligence level
const getLevelByTeam = (level, team) => {
  // return a random level for medium difficulty
  if (level === "medium") return Math.random() > 0.5 ? "high" : "low"
  // get player team flag
  const isPlayerTeam = team.name === "NS"
  // switch by difficulty level
  if (level === "easy") {
    // switch easy difficulty levels
    return isPlayerTeam ? "high" : "low"
  } else if (level === "hard") {
    // switch hard difficulty levels
    return isPlayerTeam ? "low" : "high"
  }
}

// empty trick slots
const slots = {
  south: new Omi.Card(null, null, "empty"),
  east: new Omi.Card(null, null, "empty"),
  north: new Omi.Card(null, null, "empty"),
  west: new Omi.Card(null, null, "empty")
}

// game module
const game = new Omi.Game(players)

// card component
Vue.component("card", {
  template: "#card",
  props: ["data", "select"]
})

// trick component
Vue.component("trick", {
  template: "#trick",
  props: ["cards", "select"]
})

// hidden-hand component
Vue.component("hidden-hand", {
  template: "#hidden-hand",
  props: ["name", "cards"]
})

// player-hand component
Vue.component("player-hand", {
  template: "#player-hand",
  props: ["name", "cards", "select"]
})

// game app
new Vue({
  // root element
  el: "#app",
  // app data
  data: {
    // ready state
    ready: false,
    // game module
    game,
    // players
    players,
    // teams
    teams,
    // levels
    levels,
    // player cards
    cards: [],
    // current trick
    trick: createTrumps(null, true),
    // current trump
    trump: null,
    // selected level
    level: "easy",
    // locked status
    locked: false,
  },
  // computed values
  computed: {
    // game started state
    isPlaying() { return game.status !== "pending" },
    // player activity state
    isPlayer() { return game.player.name === "south" },
    // trump selection state
    isTrump() { return game.status === "trump" }
  },
  methods: {
    // method to start game
    start() {
      // start game
      game.start()
      // check if current player
      if (this.isPlayer) {
        // show first four card of player
        this.cards = game.player.hand.cards.map((item, index) => (
          // hide cards beyond first four
          index < 4 ? item : new Omi.Card(null, null, "hidden")
        ))
      } else {
        // show player full hand
        this.cards = game.player.hand.cards
      }
    },
    // method on card selection
    select(card) {
      // return if locked
      if (this.locked) return
      // check for trump selection state
      if (card.tag === "selectable" && this.isTrump) {
        // lock user inputs
        this.locked = true
        // set trump suit for the game
        const data = game.setTrump(card.suit)
        // display trump suit
        this.trump = card.suit
        // clear trick slots
        this.trick = { ...slots }
        // update options
        this.update(data)
      } else if (card.tag === "playable" && this.isPlayer) {
        // lock user inputs
        this.locked = true
        // clear card tag
        card.tag = null
        // play card for the trick
        const data = game.playCard(card)
        // update options
        this.update(data)
      }
    },
    // method to update
    async update(data) {
      // get current trick if available in response
      const trick = typeof data === "object" ? data : null
      // update current trick
      this.trick = names.reduce((output, name) => {
        // get player card from current trick
        const card = trick?.cards.find(item => item.player.name === name)
        // set player card if available or empty slot
        output[name] = card ?? new Omi.Card(null, null, "empty")
        // return output cards object
        return output
      }, {})
      // update player cards
      this.cards = players[0].hand.cards
      // for each card in player hand
      this.cards.forEach(item => {
        // check game state
        if (this.isPlayer) {
          // check trick state
          if (!game.trick) {
            // every card is playable if trick starting
            item.tag = "playable"
          } else if (!game.player.hand.hasSuit(game.trick.suit)) {
            // every card is playable if no current suit
            item.tag = "playable"
          } else {
            // set card as playable or idle by trick suit
            item.tag = item.suit === game.trick.suit ? "playable" : "disabled"
          }
        } else {
          // idle card if someone else playing
          item.tag = "idle"
        }
      })
      // check if trick has a winner
      if (trick && trick.winner) {
        // display delay before highlight
        await sleep()
        // highlight winning card from trick
        trick.cards.forEach(item => {
          // select or disabled by winner
          item.tag = item.player === trick.winner ? "selected" : "disabled"
        })
        // display delay for highlight
        await sleep(1200)
        // clear trick slots
        this.trick = { ...slots }
      }
      // unlock controls if turn for player
      if (this.isPlayer) { this.locked = false }
      // clear trump on restart
      if (game.status === "restart") this.trump = null
      // round starting flag
      const isStarting = !game.trick && game.tricks.length === 0
      // check if non player starting
      if (!this.isPlayer && game.status === "playing" && isStarting) {
        // show trump auto selection
        this.trick = createTrumps(null, false)
        // display delay before highlight
        await sleep()
        // highlight selected trump
        this.trick = createTrumps(game.trump, false)
        // display delay for highlight
        await sleep(1000)
        // display trump suit
        this.trump = game.trump
        // clear trick slots
        this.trick = { ...slots }
      }
      // check if should reset on player move
      if (this.isPlayer && game.status === "restart") {
        // restart game
        this.start()
        // show trump selection
        this.trick = createTrumps(null, true)
      }
      // check if not player move
      if (!this.isPlayer) {
        // automate step delay
        await sleep()
        // select difficulty level
        const level = getLevelByTeam(this.level, game.player.team)
        // automate game step
        this.update(game.automate(level))
      }
    }
  },
  async mounted() {
    // preload all assets
    await preload()
    // loading delay
    await sleep()
    // set device type on document
    document.documentElement.setAttribute("data-device", device)
    // set as ready
    this.ready = true
  }
})
