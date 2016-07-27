// Given Data Set Constants 
var SUITS = ['♣','♦','♥','♠'];
var RANKS = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];

var card = {
  // Initialize cards with corresponding properties.
  create: function(suit, rank) {
    var instance = Object.create(this);
    instance.suit = suit;
    instance.rank = rank;
    instance.value = null;
    instance.calculateValue(rank);

    return instance;
  },

  // Object method checks suit and assigns value for face cards.
  calculateValue: function(rank) {
    if(rank.match(/J|Q|K/)) {
      this.value = 10
    }
  }
};

var deck = {
  // Initialize deck with corresponding properties.
  create: function() {
    var instance = Object.create(this);
    instance.cards = [];

    // Loop over suits and ranks to build card instances and append to the
    // deck's cards array propery.
    SUITS.forEach(function(suit) {
      RANKS.forEach(function(rank) {
        instance.cards.push(card.create(suit, rank));
      });
    });

    return instance;
  }
};

var hand = {
  // Initialize hand with corresponding properties.
  create: function() {
    var instance = Object.create(this);
    instance.cards = [];

    return instance;
  },

  // Object method calculates score -- hand is self aware of its score.
  score: function() {
    // Initalize variable to keep within scope and to keep the code dry.
    var cards = this.cards;
    var ace = null;

    // Loop over the cards arry
    for(i = cards.length - 1; i >= 0; i--) {
        // Conditionally check if the card is an ace. If it is grab that object
        // so that we can assing it a value. For complexity's sake the game will 
        // assign a value to the ace when the hand is first scored. This means
        // the ace cannot adjust its vaule when more cards are delt.
        if(cards[i].rank === 'A' && cards[i].value === null) {
          ace = (cards.splice(i, 1)[0]);
        }
    }

    // Calculate the total by using reduce on the card objects. Even if there is
    // only one object in the cards array, this will return only the value of
    // that card and not the object. As a defualt of 0 has been set.
    var total = cards.reduce(function(previous, current) {
     return previous + current.value;
    }, 0);

    // Conditionally set the vaule of the ace.
    if(ace !== null) {
      if( total + 11 <= 21) {
        ace.value = 11;
        // Append ace card object back into the cards with proper scope.
        cards.push(ace)
      }
      else {
        ace.value = 1;
        cards.push(ace)
      }
      // Returns the total with the ace's value and breaks the return on
      // line 92 will not run.
      return total + ace.value;
    }
    // Returns total when the if conditional on line 77 is false
    return total;
  }
};


var player = {
  // Initialize player with corresponding properties.
  create: function(name){
    var instance = Object.create(this);
    instance.name = name;
    instance.hand = hand.create();
    instance.status = 'Active';

    return instance;
  }
}

var game = {
  // Initialize game with corresponding properties.
  create: function(numberOfDecks, players) {
    var instance = Object.create(this);
    instance.stack = [];
    instance.players = players;
    // Call object method on the instance being created to generate the stack!
    instance.buildStack(numberOfDecks);

    return instance;
  },

  // Object method iterates though  number of decks privided and builds a
  // stack.
  buildStack: function(numberOfDecks) {
    for (i = 0; i < numberOfDecks; i++) {
      // Using prototyle inheritace makes things abit cleaner. Calling the
      // create method allows us to then just get the cards generated from the
      // deck. Nice and modular!
      this.stack = this.stack.concat(deck.create().cards)
    }
  },

  // Object method deals cards to all players
  deal: function() {
    // Keeping things in scope.
    var self = this

    // loops though the players
    this.players.forEach(function(player) {
      // Removes one card object from the beginnig of the stack array and
      // appends it to the players hand object's cards array property. 
      player.hand.cards.push(self.stack.shift())
    });
  },

  // Altenative deal randomly pulls card from the stack no need to shuffle. It 
  // breaks from the classic Black Jack rules. But, I wanted to show an
  // alteraitve way to approach shuffling.
  randomizedPullAndDeal: function(player) {
    // Randomly generate a number and convert it to an round it down within the 
    // limits of the length of the array.
    var randomIndex = Math.floor(Math.random() * this.stack.length);
    // Set cards array to equal the merged arrays (Itself and the random splice)
    player.hand.cards = player.hand.cards.concat(
      // using the random index remove the object from the stack this will be
      // returned from the splice function allowing us to concat/ merge into
      // the cards array.
      this.stack.splice(randomIndex, 1)
    )
  },

  // Basic shuffel method.
  shuffle: function() {
    // Using sort and passing a function to it.
    this.stack.sort( function() {
      // randomly generate a postion for the sort -- this is called repeatdly
      // resulting in a modest randomization/ shuffel.
      return 0.5 - Math.random();
    });
  }
};

// Reusable anonymous function to run game
var runner = function(numberOfDecks, participants) {
  // Create a new game object passing in the corresponding variables
  newGame = game.create(numberOfDecks, participants);
  // Use the object's shuffle method.
  newGame.shuffle();
  // Use the object's deal method.
  newGame.deal();

  // Uterate over the players and 
  newGame.players.forEach(function(player) {
    // continuously loop over the player until the status changes
    while(player.status === 'Active') {
      // conditionally check if the hand has a score over 21.
      if(player.hand.score() > 21) {
        // if it is update the status to bust and break the while loop.
        player.status = 'Busts'
        break;
      }
      // check if the hand is 21.
      else if(player.hand.score() === 21) {
        // if it is update the status and break the while loop.
        player.status = 'Black Jack!'
        break;
      }

      // For complexity's sake the games AI is pretty low level. Each player 
      // will contiue to pull a card until the reach black jack or bust.

      // Use the object's method to deal a player an additional card at random.
      newGame.randomizedPullAndDeal(player);
    }
  })

  // Iterate over the players and print out their stats.
  newGame.players.forEach(function(player) {
    console.log(player.name, player.status, player)
  })
}
// Initalize participants/ players to pass into runner function.
var participants = [player.create('Aadi'), player.create('Jason'),
                    player.create('Michael'), player.create('Matthew')]
// Initalize the number of decks to pass into the runner as well.
var numberOfDecks = 1

// Run the game! Good Luck!
runner(numberOfDecks, participants)
