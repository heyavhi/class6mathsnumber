document.addEventListener('DOMContentLoaded', () => {

    // Elements
    const screens = {
        hero: document.getElementById('hero-screen'),
        dashboard: document.getElementById('dashboard-screen'),
        module: document.getElementById('module-screen'),
        compare: document.getElementById('compare-screen'),
        builder: document.getElementById('builder-screen'),
        final: document.getElementById('final-challenge-screen'),
        mastery: document.getElementById('mastery-screen')
    };

    // State
    const state = {
        completedModules: new Set(),
        currentModule: null,
        builderLevel: 0,
        fcLevel: 0,
        fcAnswers: { next: null, rule: null }
    };

    // Practice Module Data (Student Perspective)
    const modulesData = {
        ones: {
            title: "Let's watch a clock tick. 1 second, 1 second, 1 second...",
            sequence: [1, 1, 1, 1],
            question: "What happens to the number each time?",
            options: ["It goes up", "It goes down", "It stays exactly the same"],
            correctIndex: 2,
            ruleText: "Rule: The value stays completely unchanged.",
            ruleVis: "1 + 0 = 1",
            subChallenge: null
        },
        counting: {
            title: "Let's count apples in a basket...",
            sequence: [1, 2, 3, 4],
            question: "What number comes next?",
            options: [5, 6, 7],
            correctIndex: 0,
            ruleText: "Rule: Add 1 to the previous number.",
            ruleVis: "1+1=2 &nbsp;|&nbsp; 2+1=3 &nbsp;|&nbsp; 3+1=4",
            subChallenge: null
        },
        odd: {
            title: "Let's look at house numbers on the left side of a street...",
            sequence: [1, 3, 5, 7, 9],
            question: "What house number comes next?",
            options: [10, 11, 12],
            correctIndex: 1,
            ruleText: "Rule: Add 2 each time.",
            ruleVis: "9 + 2 = 11",
            subChallenge: {
                text: "Let's practice! Tap all the ODD numbers (Numbers that are NOT exactly divisible by 2).",
                numbers: [7, 8, 13, 20],
                correct: [7, 13],
                explanation: "Great job! Odd numbers are not exactly divisible by 2."
            }
        },
        even: {
            title: "Let's count shoes. They always come in pairs!",
            sequence: [2, 4, 6, 8, 10],
            question: "If we add one more pair, how many shoes total?",
            options: [11, 12, 13],
            correctIndex: 1,
            ruleText: "Rule: Add 2 each time.",
            ruleVis: "10 + 2 = 12",
            subChallenge: {
                text: "Let's practice! Tap all the EVEN numbers (Numbers that can be divided evenly by 2).",
                numbers: [3, 6, 9, 12, 15, 18],
                correct: [6, 12, 18],
                explanation: "Perfect! Even numbers are exactly divisible by 2."
            }
        }
    };

    // Navigation Utils
    function switchScreen(from, to) {
        if(screens[from]) screens[from].classList.add('hidden');
        if(screens[from]) screens[from].classList.remove('active');
        setTimeout(() => {
            if(screens[to]) screens[to].classList.remove('hidden');
            if(screens[to]) screens[to].classList.add('active');
        }, 300);
    }

    document.getElementById('start-lab-btn').onclick = () => switchScreen('hero', 'dashboard');
    document.querySelectorAll('.back-btn').forEach(btn => btn.onclick = returnToDashboard);
    document.getElementById('complete-module-btn').onclick = () => {
        state.completedModules.add(state.currentModule);
        document.querySelector(`.machine-card[data-module="${state.currentModule}"]`).classList.add('completed');
        updateDashboardProgress();
        returnToDashboard();
    };

    function returnToDashboard() {
        ['module', 'compare', 'builder', 'final'].forEach(s => {
            screens[s].classList.add('hidden');
            screens[s].classList.remove('active');
        });
        setTimeout(() => {
            screens.dashboard.classList.remove('hidden');
            screens.dashboard.classList.add('active');
        }, 300);
    }

    function updateDashboardProgress() {
        const p = (state.completedModules.size / 4) * 100;
        document.getElementById('dashboard-progress').style.width = p + '%';

        if(state.completedModules.has('odd') && state.completedModules.has('even')) {
            document.getElementById('unlock-compare-btn').classList.remove('hidden');
        }
        if(state.completedModules.size === 4 && document.getElementById('compare-complete-btn').classList.contains('hidden') === false) {
             document.getElementById('unlock-builder-btn').classList.remove('hidden');
        }
    }

    // 2. Dashboard Clicks
    document.querySelectorAll('.machine-card').forEach(card => {
        card.onclick = () => {
            const mod = card.getAttribute('data-module');
            openModule(mod);
        };
    });

    // 3. Learning Module Logic
    function openModule(moduleId) {
        state.currentModule = moduleId;
        const data = modulesData[moduleId];
        
        document.getElementById('module-title').innerText = data.title;
        document.getElementById('module-stage-1').classList.remove('hidden');
        document.getElementById('module-stage-2').classList.add('hidden');
        document.getElementById('sub-challenge').classList.add('hidden');
        
        // Render sequence
        const seqDisp = document.getElementById('sequence-display');
        seqDisp.innerHTML = '';
        data.sequence.forEach((num, idx) => {
            const span = document.createElement('span');
            span.className = 'sequence-item hidden';
            span.innerText = num + (idx < data.sequence.length - 1 ? ' → ' : ' → ?');
            seqDisp.appendChild(span);
            setTimeout(() => span.classList.remove('hidden'), idx * 500);
        });

        // Render Options
        document.getElementById('module-question').innerText = data.question;
        const optsContainer = document.getElementById('module-options');
        optsContainer.innerHTML = '';
        
        setTimeout(() => {
            data.options.forEach((opt, idx) => {
                const btn = document.createElement('button');
                btn.className = 'opt-btn';
                btn.innerText = opt;
                btn.onclick = () => checkModuleAnswer(btn, idx, data);
                optsContainer.appendChild(btn);
            });
        }, data.sequence.length * 500);
        
        switchScreen('dashboard', 'module');
    }

    function checkModuleAnswer(btn, idx, data) {
        document.querySelectorAll('#module-options .opt-btn').forEach(b => b.style.pointerEvents = 'none');
        if(idx === data.correctIndex) {
            btn.classList.add('correct');
            const lastSpan = document.querySelector('.sequence-item:last-child');
            lastSpan.innerText = lastSpan.innerText.replace('?', data.options[data.correctIndex]);
            
            setTimeout(() => showRuleStage(data), 1000);
        } else {
            btn.classList.add('wrong');
            setTimeout(() => {
                btn.classList.remove('wrong');
                document.querySelectorAll('#module-options .opt-btn').forEach(b => b.style.pointerEvents = 'auto');
            }, 800);
        }
    }

    function showRuleStage(data) {
        document.getElementById('module-stage-1').classList.add('hidden');
        document.getElementById('module-stage-2').classList.remove('hidden');
        
        document.getElementById('rule-text').innerHTML = data.ruleText;
        document.getElementById('rule-visualization').innerHTML = data.ruleVis;
        
        const completeBtn = document.getElementById('complete-module-btn');
        completeBtn.classList.add('hidden');

        if(data.subChallenge) {
            const sc = document.getElementById('sub-challenge');
            sc.classList.remove('hidden');
            document.getElementById('sub-challenge-text').innerText = data.subChallenge.text;
            
            const grid = document.getElementById('sub-challenge-grid');
            grid.innerHTML = '';
            
            let selectedCorrect = 0;
            data.subChallenge.numbers.forEach(num => {
                const nBtn = document.createElement('div');
                nBtn.className = 'num-tap';
                nBtn.innerText = num;
                nBtn.onclick = () => {
                    if(data.subChallenge.correct.includes(num)) {
                        if(!nBtn.classList.contains('selected')) {
                            nBtn.classList.add('selected');
                            selectedCorrect++;
                            if(selectedCorrect === data.subChallenge.correct.length) {
                                document.getElementById('sub-challenge-text').innerHTML = `<span style="color:var(--success)">✅ ${data.subChallenge.explanation}</span>`;
                                completeBtn.classList.remove('hidden');
                            }
                        }
                    } else {
                        nBtn.classList.add('wrong');
                        setTimeout(() => nBtn.classList.remove('wrong'), 500);
                    }
                };
                grid.appendChild(nBtn);
            });
        } else {
            completeBtn.classList.remove('hidden');
        }
    }

    // 7. Compare Screen
    document.getElementById('unlock-compare-btn').onclick = () => switchScreen('dashboard', 'compare');
    
    window.checkCompare = function(btn, isCorrect) {
        if(isCorrect) {
            btn.classList.add('correct');
            document.getElementById('compare-complete-btn').classList.remove('hidden');
            updateDashboardProgress();
        } else {
            btn.classList.add('wrong');
            setTimeout(() => btn.classList.remove('wrong'), 800);
        }
    };

    // 8. Sequence Builder (Practice Based)
    document.getElementById('unlock-builder-btn').onclick = () => {
        state.builderLevel = 0;
        loadBuilderLevel();
        switchScreen('dashboard', 'builder');
    };

    const builderLevels = [
        { scenario: "Help me arrange these house numbers on the street!", seq: [1, 3, null, 7, null, 11], bank: [5, 9, 2, 4], correct: [5, 9] },
        { scenario: "Let's count the wheels on these bicycles. (2 wheels per bike)", seq: [2, 4, null, 8, null], bank: [6, 10, 5, 7], correct: [6, 10] },
        { scenario: "Just counting blocks in a tower. Add one block each time.", seq: [1, 2, 3, null, 5], bank: [4, 6, 8], correct: [4] }
    ];

    let selectedBankNum = null;

    function loadBuilderLevel() {
        const lvl = builderLevels[state.builderLevel];
        document.getElementById('builder-scenario').innerText = lvl.scenario;
        
        const ws = document.getElementById('builder-workspace');
        const bank = document.getElementById('builder-bank');
        ws.innerHTML = ''; bank.innerHTML = '';
        selectedBankNum = null;
        document.getElementById('builder-feedback').classList.add('hidden');
        document.getElementById('next-builder-level-btn').classList.add('hidden');
        document.getElementById('finish-builder-btn').classList.add('hidden');

        let emptyIndex = 0;
        lvl.seq.forEach((val) => {
            if(val !== null) {
                const el = document.createElement('div');
                el.innerText = val;
                ws.appendChild(el);
            } else {
                const slot = document.createElement('div');
                slot.className = 'slot';
                slot.dataset.correct = lvl.correct[emptyIndex];
                slot.dataset.filled = "false";
                slot.onclick = () => fillSlot(slot);
                ws.appendChild(slot);
                emptyIndex++;
            }
        });

        lvl.bank.forEach(val => {
            const b = document.createElement('div');
            b.className = 'bank-num';
            b.innerText = val;
            b.onclick = () => {
                document.querySelectorAll('.bank-num').forEach(el => el.classList.remove('selected'));
                b.classList.add('selected');
                selectedBankNum = val;
                document.querySelectorAll('.slot:not(.filled)').forEach(s => s.classList.add('active'));
            };
            bank.appendChild(b);
        });
    }

    function fillSlot(slot) {
        if(!selectedBankNum || slot.dataset.filled === "true") return;
        
        if(selectedBankNum == slot.dataset.correct) {
            slot.innerText = selectedBankNum;
            slot.classList.add('filled');
            slot.classList.remove('active');
            slot.dataset.filled = "true";
            
            document.querySelectorAll('.bank-num').forEach(el => el.classList.remove('selected'));
            document.querySelectorAll('.slot').forEach(s => s.classList.remove('active'));
            selectedBankNum = null;

            checkBuilderComplete();
        } else {
            slot.classList.add('wrong');
            setTimeout(() => slot.classList.remove('wrong'), 500);
        }
    }

    function checkBuilderComplete() {
        const allFilled = Array.from(document.querySelectorAll('.slot')).every(s => s.dataset.filled === "true");
        if(allFilled) {
            const fb = document.getElementById('builder-feedback');
            fb.innerText = "Perfect! You solved the practice scenario. ✅";
            fb.className = "feedback success";
            
            if(state.builderLevel < builderLevels.length - 1) {
                const nBtn = document.getElementById('next-builder-level-btn');
                nBtn.classList.remove('hidden');
                nBtn.onclick = () => {
                    state.builderLevel++;
                    loadBuilderLevel();
                };
            } else {
                document.getElementById('finish-builder-btn').classList.remove('hidden');
                document.getElementById('unlock-final-btn').classList.remove('hidden'); 
            }
        }
    }

    // 9. Final Practice Challenge
    document.getElementById('unlock-final-btn').onclick = () => {
        state.fcLevel = 0;
        loadFCLevel();
        switchScreen('dashboard', 'final');
    };

    const fcLevels = [
        { scenario: "A flower blooms 5 petals on Monday, 7 on Tuesday, 9 on Wednesday, 11 on Thursday...", seq: "5, 7, 9, 11, ?", nextOpts: [12, 13, 15], ruleOpts: ["Add 1", "Add 2", "Multiply by 2"], correctNext: 13, correctRule: 1 },
        { scenario: "You are arranging desks in pairs. 4 desks in row 1, 6 in row 2, 8 in row 3, 10 in row 4...", seq: "4, 6, 8, 10, ?", nextOpts: [11, 12, 14], ruleOpts: ["Add 2", "Subtract 2", "Stays same"], correctNext: 12, correctRule: 0 }
    ];

    function loadFCLevel() {
        const lvl = fcLevels[state.fcLevel];
        document.getElementById('fc-progress').innerText = `Question ${state.fcLevel + 1} of ${fcLevels.length}: Can you figure out both the next number AND the rule?`;
        document.getElementById('fc-scenario').innerText = lvl.scenario;
        document.getElementById('fc-sequence').innerText = lvl.seq;
        
        state.fcAnswers = { next: null, rule: null };
        document.getElementById('fc-feedback').classList.add('hidden');
        
        const nOpts = document.getElementById('fc-next-options');
        const rOpts = document.getElementById('fc-rule-options');
        nOpts.innerHTML = ''; rOpts.innerHTML = '';

        lvl.nextOpts.forEach(val => {
            const b = document.createElement('button');
            b.className = 'opt-btn'; b.innerText = val;
            b.onclick = () => {
                nOpts.querySelectorAll('.opt-btn').forEach(el => el.classList.remove('selected'));
                b.classList.add('selected');
                state.fcAnswers.next = val;
            };
            nOpts.appendChild(b);
        });

        lvl.ruleOpts.forEach((val, idx) => {
            const b = document.createElement('button');
            b.className = 'opt-btn'; b.innerText = val;
            b.onclick = () => {
                rOpts.querySelectorAll('.opt-btn').forEach(el => el.classList.remove('selected'));
                b.classList.add('selected');
                state.fcAnswers.rule = idx;
            };
            rOpts.appendChild(b);
        });

        document.getElementById('fc-submit-btn').onclick = () => checkFCAnswer(lvl);
    }

    function checkFCAnswer(lvl) {
        if(state.fcAnswers.next === null || state.fcAnswers.rule === null) return;

        const fb = document.getElementById('fc-feedback');
        if(state.fcAnswers.next === lvl.correctNext && state.fcAnswers.rule === lvl.correctRule) {
            fb.innerText = "Correct! You cracked the rule. ✅";
            fb.className = "feedback success mt-2";
            
            setTimeout(() => {
                if(state.fcLevel < fcLevels.length - 1) {
                    state.fcLevel++;
                    loadFCLevel();
                } else {
                    triggerMastery();
                }
            }, 1500);
        } else {
            fb.innerText = "Oops! Look closely at the pattern again and try a different answer.";
            fb.className = "feedback error mt-2";
            setTimeout(() => fb.classList.add('hidden'), 2000);
        }
    }

    function triggerMastery() {
        switchScreen('final', 'mastery');
        setTimeout(() => {
            document.querySelector('.xp-bar-fill').style.width = '100%';
        }, 500);
    }
});
