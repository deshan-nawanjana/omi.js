/** Card ranks */
export const RANKS = ["7", "8", "9", "10", "J", "Q", "K", "A"]
/** Card suits */
export const SUITS = ["spades", "hearts", "diamonds", "clubs"]

/**
 * @typedef {'7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A'} Rank Rank of the card
 * @typedef {'spades' | 'hearts' | 'diamonds' | 'clubs'} Suit Suit of the card
 * @typedef {'pending' | 'trump' | 'playing' | 'restart'} Status Status of the game
 */

/** Card of the deck */
class Card {
  /**
   * Card of the deck
   * @param {Rank} rank Rank of the card
   * @param {Suit} suit Suit of the card
   * @param {string} [tag] Tag of the card
   */
  constructor(rank, suit, tag) {
    /** @type {Rank} Rank of the card */
    this.rank = rank
    /** @type {Suit} Suit of the card */
    this.suit = suit
    /** @type {string} Tag of the card */
    this.tag = tag ?? null
    /** @type {Player | null} Player that holds the card */
    this.player = null
  }
  /**
   * Checks equality with another card
   * @param {Card} card
   * @returns {boolean}
   */
  isEqualsTo(card) {
    // return comparison flag
    return this.rank === card.rank && this.suit === card.suit
  }
  /**
   * Calculates position by current trick suit and trump suit
   * @param {Suit} [trick] Suit of current trick
   * @param {Suit} [trump] Suit of trump
   * @returns {number}
   */
  toValue(trick, trump) {
    // get index by rank
    const rankIndex = RANKS.indexOf(this.rank)
    // current trick suit increment
    const trickOffset = this.suit === trick ? RANKS.length : 0
    // trump suit increment
    const trumpOffset = this.suit === trump ? RANKS.length * 2 : 0
    // return rank index
    return rankIndex + trickOffset + trumpOffset
  }
}

/** Deck of cards */
class Deck {
  /** Deck of cards */
  constructor() {
    /** @type {Card[]} Set of cards */
    this.cards = RANKS.reduce((arr, rank) => {
      // reduce suites with ranks
      return [...arr, ...SUITS.map(suit => new Card(rank, suit))]
    }, [])
  }
  /** Shuffles the cards */
  shuffle() {
    // sort cards in random order
    this.cards.sort(() => 0.5 - Math.random())
  }
}

/** Set of cards */
class Stack {
  /**
   * Collection of cards
   * @param {Card[]} [cards] Set of cards
   */
  constructor(cards) {
    /** @type {Card[]} Set of cards */
    this.cards = cards ?? []
  }
  /**
   * Generates a sorted set of cards by position in descending order
   * @param {Suit} trick Suit of the trick
   * @param {Suit} [trump] Suit of the trump
   * @returns {Card[]}
   */
  toSorted(trick, trump) {
    // clone and sort cards by position value
    return [...this.cards].sort((a, b) => (
      // compare position values
      b.toValue(trick, trump) - a.toValue(trick, trump)
    ))
  }
  /**
   * Finds if a given card is included in the stack
   * @param {Card} card Card to find
   * @returns {boolean}
   */
  has(card) {
    // match with each card in the stack
    return !!this.cards.find(item => item.isEqualsTo(card))
  }
  /**
   * Finds if a given suit is available the stack
   * @param {Suit} suit Card to find
   * @returns {boolean}
   */
  hasSuit(suit) {
    // match with suit of each card
    return !!this.cards.some(item => item.suit === suit)
  }
  /**
   * Removes a card from the stack
   * @param {Card} card Card to remove
   */
  remove(card) {
    // filter out card from stack
    this.cards = this.cards.filter(item => (
      // match with each card in the stack
      item.rank !== card.rank || item.suit !== card.suit
    ))
  }
}

/** Trick of a game */
class Trick {
  /**
   * Trick of a game
   * @param {Suit} [suit] Suit of the trick
   */
  constructor(suit) {
    /** @type {Suit | null} Suit of the trick */
    this.suit = suit ?? null
    /** @type {Card[]} Set of cards */
    this.cards = []
    /** @type {Player | null} Winner of the trick */
    this.winner = null
  }
  /**
   * Puts a card into trick
   * @param {Card} card 
   */
  put(card) {
    // set trick suit as first suit of the the card
    if (this.cards.length === 0) this.suit = card.suit
    // push into cards array
    this.cards.push(card)
  }
  /**
   * Closes the trick and determines the winner
   * @param {Suit} trump Trump suit
   * @returns {Player} Winning player of the trump
   */
  close(trump) {
    // return if no cards
    if (this.cards.length === 0) return
    // create a stack and sort from current suit and trump
    const cards = new Stack(this.cards).toSorted(this.suit, trump)
    // set top card player as winner
    this.winner = cards[0].player
    // return winning player
    return this.winner
  }
}

/** Player of the game */
class Player {
  /**
   * Player of the game
   * @param {string} name Name of the player
   * @param {Team} team Team of the player
   * @param {Stack} [hand] Set of cards belong to the player
   */
  constructor(name, team, hand) {
    /** @type {string} Name of the player */
    this.name = name
    /** @type {Team} Team of the player */
    this.team = team
    /** @type {Stack} Set of cards belong to the player */
    this.hand = hand ?? new Stack()
  }
}

/** Team of a player */
class Team {
  /**
   * Team of a player
   * @param {string} name Name of the team
   */
  constructor(name) {
    /** @type {string} Name of the team */
    this.name = name
    /** @type {number} Number of tricks won by team */
    this.tricks = 0
    /** @type {number} Number of rounds won by team */
    this.rounds = 0
  }
}

/** Omi Game  */
class Game {
  /**
   * Omi Game
   * @param {Player[]} players Set of players
   */
  constructor(players) {
    /** @type {Status} Status of the game */
    this.status = "pending"
    /** @type {Player[]} Set of players */
    this.players = players
    /** @type {Player} Current player */
    this.player = players[0] ?? null
    /** @type {Suit | null} Trump suit for the current trick */
    this.trump = null
    /** @type {Trick | null} Currently playing trick */
    this.trick = null
    /** @type {Trick[]} Completed tricks of the current round */
    this.tricks = []
    /** @type {Trick[][]} Completed rounds of the game */
    this.rounds = []
  }
  /**
   * Shuffles and divides cards between players
   * @returns {boolean} Success status
   */
  start() {
    // return if currently playing
    if (this.status === "playing") return false
    // create a deck of cards
    const deck = new Deck()
    // return if cards cannot be divided equally
    if (deck.cards.length % this.players.length !== 0) return false
    // shuffle deck
    deck.shuffle()
    // get length of a hand per player
    const length = deck.cards.length / this.players.length
    // for each player in the game
    for (let i = 0; i < this.players.length; i++) {
      // get current player
      const player = this.players[i]
      // get slice offset
      const offset = i * length
      // slice desk by player index
      const cards = deck.cards.slice(offset, offset + length)
      // assign player into each card
      cards.forEach(card => card.player = player)
      // assign hand of cards to current player
      player.hand.cards = cards
    }
    // switch to trump selection status
    this.status = "trump"
    // return as success
    return true
  }
  /**
   * Sets a suit as trump
   * @param {Suit} suit Trump suit
   * @returns {boolean} Success status
   */
  setTrump(suit) {
    // return if invalid status
    if (this.status !== "trump") return false
    // set trump suit
    this.trump = suit
    // switch to playing status
    this.status = "playing"
    // return as success
    return true
  }
  /**
   * Plays a card for the current trick
   * @param {Card} card Card from player hand
   */
  playCard(card) {
    // return if not playing
    if (this.status !== "playing") return false
    // return if card not belong to current player
    if (!this.player.hand.has(card)) return false
    // initiates a trick with given suit if not available
    if (!this.trick) this.trick = new Trick(card.suit)
    // check if current suit is available in player hand
    if (this.player.hand.hasSuit(this.trick.suit)) {
      // return if user not paying current suit
      if (card.suit !== this.trick.suit) return false
    }
    // get current trick
    const trick = this.trick
    // put card into the trick
    trick.put(card)
    // remove card for player hand
    this.player.hand.remove(card)
    // check if the current trick is not completed
    if (trick.cards.length !== this.players.length) {
      // get current player index
      const index = this.players.indexOf(this.player)
      // assign next player to play the card
      this.player = this.players[(index + 1) % this.players.length]
    } else {
      // close ongoing trick
      const winner = trick.close(this.trump)
      // increase winner team tricks
      winner.team.tricks += 1
      // assign winning player as next trick starting player
      this.player = this.players[this.players.indexOf(winner)]
      // push into completed tricks
      this.tricks.push(trick)
      // clear current trick
      this.trick = null
      // check if all hands are empty
      if (this.players.every(item => item.hand.cards.length === 0)) {
        // get all teams
        const teams = this.players.reduce((array, item) => (
          // reduce players into teams
          array.includes(item.team) ? array : [...array, item.team]
        ), [])
        // get tricks array
        const tricks = teams.map(item => item.tricks).sort()
        // get maximum tricks
        const maximum = Math.max(...tricks)
        // check if not multiple maximum tricks
        if (tricks.pop() !== tricks.pop()) {
          // find winner team
          const winner = teams.find(item => item.tricks === maximum)
          // increase winner team round score
          winner.rounds += 1
        }
        // reset each team tricks
        teams.forEach(item => item.tricks = 0)
        // switch to restart status
        this.status = "restart"
        // clear trump suit
        this.trump = null
        // clear push previous tricks to rounds history
        this.rounds.push(this.tricks)
        // assign second player for first trump to start
        this.player = this.tricks[0].cards[1].player
        // reset current tricks
        this.tricks = []
      }
    }
    // return current trick
    return trick
  }
  /**
   * Automates next step of the game
   * @param {'low' | 'high'} level Intelligence level
   * @returns {boolean | Trick} Success status or current trick
   */
  automate(level = "high") {
    // switch by game status
    if (this.status === "pending" || this.status === "restart") {
      // shuffle and divide card of the deck
      return this.start()
    } else if (this.status === "trump") {
      // get first four cards of current player
      const cards = this.player.hand.cards.slice(0, this.players.length)
      // sort card by their values
      const sorted = new Stack(cards).toSorted()
      // switch by difficulty level
      if (level === "high") {
        // get first card
        const first = sorted[0]
        // check if the highest card is an ace
        if (first.rank === "A") {
          // set trump suit as card with ace 
          return this.setTrump(first.suit)
        } else {
          // map cards into suites
          const suits = sorted.map(item => item.suit)
          // find any repetitive suit
          const repetitive = suits.find((item, i) => (
            suits.some((suit, n) => item === suit && i !== n)
          ))
          // set trump as repetitive suit or highest available
          return this.setTrump(repetitive ?? suits[0])
        }
      } else {
        // set trump suit with lowest value
        return this.setTrump(sorted[sorted.length - 1].suit)
      }
    } else if (this.status === "playing") {
      // get hand of current player
      const hand = this.player.hand
      // get all sorted cards
      const sorted = hand.toSorted(this.trick?.suit, this.trump)
      // get current card from current suit
      const current = sorted.filter(item => item.suit === this.trick?.suit)
      // get all available cards
      const available = current.length > 0 ? current : sorted
      // get the lowest available cards
      const lowest = available[available.length - 1]
      // switch by difficulty level
      if (level === "high") {
        // switch by trick status
        if (!this.trick) {
          // find any ace from non trump suit
          const ace = available.find(item => (
            // match with rank and suit
            item.rank === "A" && item.suit !== this.trump
          ))
          // put ace or lowest available 
          return this.playCard(ace ?? lowest)
        } else {
          // create pool of cards with trick and available cards in hand
          const pool = new Stack([...this.trick.cards, ...available])
          // sort card into pool
          const sorted = pool.toSorted(this.trick.suit, this.trump)
          // get target index and card to beat from pool
          const targetIndex = sorted.findIndex(item => item.player !== this.player)
          const targetCard = sorted[targetIndex]
          // get lowest beatable cards of player
          const lowestBeatable = sorted[targetIndex - 1]
          // same team beating flag
          const isSameTeam = targetCard.player.team.name === this.player.team.name
          // check if in middle of trick
          if (this.trick.cards.length < this.players.length - 2) {
            // get all beatable cards
            const beatable = sorted.filter((_, i) => i < targetIndex)
            // check if any beatable
            if (beatable.length > 0) {
              // check if trumps in beatable and not the trick
              if (beatable[0].suit === this.trump && this.trick.suit !== this.trump) {
                // check if currently top card from the same team
                if (isSameTeam) {
                  // put the lowest card and let the supporter win
                  return this.playCard(lowest)
                } else {
                  // put the lowest beatable card
                  return this.playCard(lowestBeatable)
                }
              } else {
                // put the highest beatable card
                return this.playCard(beatable[0])
              }
            } else {
              // put the lowest card
              return this.playCard(lowest)
            }
          } else {
            // check if currently top card from the same team
            if (isSameTeam) {
              // put the lowest card and let the supporter win
              return this.playCard(lowest)
            } else {
              // put lowest beatable or put lowest card
              return this.playCard(lowestBeatable ?? lowest)
            }
          }
        }
      } else {
        // put the lowest available card
        return this.playCard(lowest)
      }
    }
  }
}

export const Omi = { Card, Deck, Stack, Trick, Player, Team, Game }
