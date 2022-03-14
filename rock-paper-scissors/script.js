const handOption = {
   "rock": "img/rock.png",
   "paper": "img/paper.png",
   "scissors": "img/scissors.png"
}

let SCORE = 0;

const pickUserHand = (hand) => {
   console.log(hand)
   // hide the current page
   let hands = document.querySelector('.hands');
   hands.style.display = "none";

   // show the next page with the hand we picked
   let contest = document.querySelector('.contest');
   contest.style.display = "flex";

   // set the user pick
   document.getElementById('userPickImg').src = handOption[hand];
   // document.getElementById("userPickImage").src = handOptions[hand];
   
   let computerHand = pickComputerHand();
   referee(hand,computerHand);
}

const pickComputerHand = () => {
   let hands = ['rock', 'paper', 'scissors'];
   let computerHand = hands[Math.floor(Math.random() * 3)]
   document.getElementById('computerPickImg').src = handOption[computerHand];
   return computerHand;
}

const referee = (userHand, computerHand) => {
   if (userHand == "paper" && computerHand == "scissors") {
      setDecision("YOU LOSE!");
   }
   if (userHand == "paper" && computerHand == "rock") {
      setDecision("YOU WIN!");
      setScore(SCORE+ 1);
   }
   if (userHand == "paper" && computerHand == "paper") {
      setDecision("It's a tie!");
   }
   if (userHand == "rock" && computerHand == "scissors") {
      setDecision("YOU WIN!");
      setScore(SCORE+ 1);
   }
   if (userHand == "rock" && computerHand == "paper") {
      setDecision("YOU LOSE!");
   }
   if (userHand == "rock" && computerHand == "rock") {
      setDecision("It's a tie!");
   }
   if (userHand == "scissors" && computerHand == "scissors") {
      setDecision("It's a tie!");
   }
   if (userHand == "scissors" && computerHand == "rock") {
      setDecision("YOU LOSE!");
   }
   if (userHand == "scissors" && computerHand == "paper") {
      setDecision("YOU WIN!");
      setScore(SCORE+ 1);
   }
}

const setDecision = (decision) => {
   document.querySelector(".decision h1").innerText = decision;
}

const setScore = (score) => {
   SCORE = score;
   document.querySelector(".score h1").innerText = score;
}

const restartGame = () => {
   // hide the current page
   let hands = document.querySelector('.hands');
   hands.style.display = "flex";

   // show the next page with the hand we picked
   let contest = document.querySelector('.contest');
   contest.style.display = "none";
}