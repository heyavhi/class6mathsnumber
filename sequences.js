// Audio System using Web Speech API
function speakText(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Stop anything currently playing
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9; // Slightly slower for learning
        utterance.pitch = 1.1; // Friendly tone
        window.speechSynthesis.speak(utterance);
    } else {
        alert("Sorry, your browser doesn't support text-to-speech!");
    }
}

function playAudio(elementId) {
    const text = document.getElementById(elementId).innerText;
    speakText(text);
}

// Navigation between steps
function nextStep(currentId, nextId) {
    window.speechSynthesis.cancel();
    document.getElementById(currentId).classList.remove('active');
    document.getElementById(currentId).classList.add('hidden');
    
    setTimeout(() => {
        document.getElementById(nextId).classList.remove('hidden');
        document.getElementById(nextId).classList.add('active');
    }, 100);
}

// Flashcard audio integration
function flipCard(cardElement, ruleText) {
    speakText(ruleText);
}

// Practice Phase Data
const practiceQuestions = [
    {
        scenario: "You are arranging desks in pairs in a classroom. You put 2 desks in the first row, 4 in the second row, 6 in the third row...",
        sequence: "2, 4, 6, __",
        options: [7, 8, 10],
        correct: 8,
        audioText: "You are arranging desks in pairs in a classroom. You put 2 desks in the first row, 4 in the second row, 6 in the third row. What is the next number?",
        explanation: "Correct! This is the Even Numbers sequence. You just add 2 to the previous row (6 + 2 = 8)."
    },
    {
        scenario: "A magical flower is blooming. It has 1 petal on Monday, 3 petals on Tuesday, 5 petals on Wednesday...",
        sequence: "1, 3, 5, __",
        options: [6, 7, 8],
        correct: 7,
        audioText: "A magical flower is blooming. It has 1 petal on Monday, 3 petals on Tuesday, 5 petals on Wednesday. What is the next number?",
        explanation: "Awesome! This is the Odd Numbers sequence. You add 2 each time (5 + 2 = 7)."
    },
    {
        scenario: "You are counting the apples you put into a basket, one by one. 1, 2, 3...",
        sequence: "1, 2, 3, 4, __",
        options: [5, 6, 10],
        correct: 5,
        audioText: "You are counting the apples you put into a basket, one by one. 1, 2, 3, 4. What is the next number?",
        explanation: "Great job! This is the Counting Numbers sequence. Just add 1."
    },
    {
        scenario: "A broken clock ticks but the time never changes. It just ticks 1 second per second.",
        sequence: "1, 1, 1, 1, __",
        options: [0, 1, 2],
        correct: 1,
        audioText: "A broken clock ticks but the time never changes. It just ticks 1 second per second. What is the next number?",
        explanation: "Perfect! This is the All Ones sequence. The value never changes."
    }
];

let currentQuestionIndex = 0;

function startPractice() {
    nextStep('step-learn', 'step-practice');
    loadQuestion(0);
}

function loadQuestion(index) {
    const q = practiceQuestions[index];
    document.getElementById('practice-title').innerText = `Real World Challenge ${index + 1}/${practiceQuestions.length}`;
    document.getElementById('scenario-text').innerText = q.scenario;
    document.getElementById('scenario-sequence').innerText = q.sequence;
    
    const optionsContainer = document.getElementById('practice-options');
    optionsContainer.innerHTML = '';
    
    document.getElementById('practice-feedback').classList.add('hidden');
    document.getElementById('next-question-btn').classList.add('hidden');
    document.getElementById('finish-btn').classList.add('hidden');
    
    q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'p-opt-btn';
        btn.innerText = opt;
        btn.onclick = () => checkAnswer(btn, opt, q);
        optionsContainer.appendChild(btn);
    });
}

function playQuestionAudio() {
    speakText(practiceQuestions[currentQuestionIndex].audioText);
}

function checkAnswer(btn, selected, qData) {
    // Disable all options
    document.querySelectorAll('.p-opt-btn').forEach(b => b.style.pointerEvents = 'none');
    
    const feedbackBox = document.getElementById('practice-feedback');
    feedbackBox.classList.remove('hidden', 'success', 'error');
    
    if (selected === qData.correct) {
        btn.classList.add('correct');
        feedbackBox.classList.add('success');
        feedbackBox.innerText = qData.explanation;
        speakText(qData.explanation);
        
        if (currentQuestionIndex < practiceQuestions.length - 1) {
            document.getElementById('next-question-btn').classList.remove('hidden');
        } else {
            document.getElementById('finish-btn').classList.remove('hidden');
        }
    } else {
        btn.classList.add('wrong');
        feedbackBox.classList.add('error');
        feedbackBox.innerText = "Not quite! Listen to the rule again and think about what comes next.";
        speakText("Not quite! Listen to the rule again and think about what comes next.");
        
        // Re-enable options after a short delay so they can try again
        setTimeout(() => {
            btn.classList.remove('wrong');
            document.querySelectorAll('.p-opt-btn').forEach(b => b.style.pointerEvents = 'auto');
        }, 2000);
    }
}

function nextQuestion() {
    currentQuestionIndex++;
    loadQuestion(currentQuestionIndex);
}

function finishPractice() {
    speakText("Amazing Job! You have mastered the fundamental sequences by applying them to the real world!");
    nextStep('step-practice', 'step-finish');
}
