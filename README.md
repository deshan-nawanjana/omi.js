# ♦️ ♣️ Omi Card Game Engine ♠️ ♥️

[Omi.js](./assets/modules/Omi.js) is a JavaScript game engine for Omi, one of the most popular traditional card games in Sri Lanka.
It manages game players, core rules, trick logic, scoring, and can handle gameplay flow for any valid situation.

This project includes both the [Game Engine](./assets/modules/Omi.js) and a separate [Game Experience (UI)](https://deshan-nawanjana.github.io/omi.js/) for easier usage and understanding.

## Game Rules

Omi is usually played using only these ranks: `A`, `K`, `Q`, `J`, `10`, `9`, `8`, `7`

At the start of the game:

1. The deck is shuffled and cards are evenly distributed among all players.
2. The first player selects a trump suit (`spades`, `hearts`, `diamonds`, or `clubs`) by looking only at the first four cards of their hand.
3. The same player plays the first card of the first trick.
4. Players continue playing one card each in an anti-clockwise direction.

Following Suit Rule

- The first card played in a trick decides the trick suit.
- Starting from the second player, everyone must play a card of the same suit as the trick suit if possible.
- A player may play a different suit only if they do not have any cards of the trick suit.

Winning a Trick

- A trump suit card beats any non-trump card.
- If no trump cards are played, the highest card of the trick suit wins.
- If a card is neither trump nor trick suit, it has the lowest value in that trick.

The next trick is started by the player who won the previous trick.

## Game Engine Definitions

- `Card` - Represents a single card in the deck
- `Deck` - Generates the full set of cards used in the game
- `Stack` - A collection of cards used for sorting and comparisons
- `Trick` - A set of cards played by each player in a round
- `Player` - Represents an individual player
- `Team` - Groups players into partnerships (ex: NS vs EW)
- `Game` - The main module that controls the full game logic

### Create Teams and Players

You can create teams and players like this:

```js
// import omi game engine
import { Omi } from "./assets/modules/Omi.js"

// create teams
const teams_1 = new Omi.Team("NS")
const teams_2 = new Omi.Team("EW")

// create players
const players = [
  new Omi.Player("south", teams_1),
  new Omi.Player("east", teams_2),
  new Omi.Player("north", teams_1),
  new Omi.Player("west", teams_2)
]
```

### Create a Game

Create an Omi game by passing the player list into the `Game` module:

```js
// create game module
const game = new Omi.Game(players)
```

### Game Status

The game has a `status` that you can check anytime to understand what to do next:

```js
// check game status
if (game.status === "pending") {
  // do something
}
```

Available statuses:

- `pending` - Game has not started yet
- `trump` - Trump suit must be selected
- `playing` - A round is currently in progress
- `restart` - Round is complete and the game should restart

### Start the Game

Start the game using the `.start()` method.
This shuffles the deck and distributes cards between players.

```js
// check game status
if (game.status === "pending") {
  // start the game
  game.start()
}
```

### Select Trump Suit

Select a trump suit using `.setTrump(suit)`:

```js
// set trump suit
game.setTrump("hearts")
```

Valid suit values: `spades`, `hearts`, `diamonds`, `clubs`

### Play Cards

You can play cards by accessing the current player and selecting a card from their hand.

A valid move returns the current `Trick`.

If the trick is completed (all players have played), it also returns the **winner** `Player`.

```js
// get current player oft the game
const currentPlayer = game.player

// play a card from player hand and get the trick
const currentTrick = game.playCard(game.player.hand.cards[0])

// check if trick has a winner
if(currentTrick.winner) {
  // display winner
  // time for next trick
}
```

### Difficulty / Automation

You can automate gameplay using `.automate(level)` method.

Available intelligence levels:

 - `high` - Attempts to play the best possible card
 - `low` - Often misses winning chances and plays weaker moves

This can be used to create a difficulty mode for the game.

### Developed by Deshan Nawanjana

[Deshan.lk](https://deshan.lk/)
&ensp;|&ensp;
[LinkedIn](https://www.linkedin.com/in/deshan-nawanjana/)
&ensp;|&ensp;
[Facebook](https://www.facebook.com/mr.dnjs)
&ensp;|&ensp;
[GitHub](https://github.com/deshan-nawanjana)
&ensp;|&ensp;
[YouTube](https://www.youtube.com/@deshan-nawanjana)
&ensp;|&ensp;
[X](https://x.com/DeshanNawanjana)
&ensp;|&ensp;
[Instagram](https://www.instagram.com/_d.boy_/)
&ensp;|&ensp;
[Reddit](https://www.reddit.com/user/DeshanNawanjana/)