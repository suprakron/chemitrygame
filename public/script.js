document.addEventListener('DOMContentLoaded', () => {
    const playerNameElement = document.getElementById('playerName');
    const playerScoreElement = document.getElementById('playerScore');
    const questionsContainer = document.getElementById('questionsContainer');
    const collectPointsButton = document.getElementById('collectPoints');
    const healthBar = document.getElementById('health');
    const clockElement = document.getElementById('clock');
    let playerScore = 0;
    let currentLevel = 1; // Start at Level 1

    // Check the URL to set currentLevel
    if (window.location.pathname.includes('game_level2')) {
        currentLevel = 2;
    } else if (window.location.pathname.includes('game_level3')) {
        currentLevel = 3;
    }

    const nameForm = document.getElementById('nameForm');

    if (nameForm) {
        nameForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent default form submission
            const playerName = document.getElementById('name').value; // Get the name input
            localStorage.setItem('playerName', playerName); // Store the name
            if (playerNameElement) playerNameElement.innerText = playerName; // Display the name
            window.location.href = 'game'; // Redirect to game.html
        });
    } else {
        // Retrieve player's name from localStorage if not the form
        const storedPlayerName = localStorage.getItem('playerName');
        if (storedPlayerName && playerNameElement) {
            playerNameElement.innerText = storedPlayerName; // Display player's name
        }
    }

    // Hide popup initially
    let popup = createPopup();

    // Function to update the clock
    function updateClock() {
        if (clockElement) {
            const now = new Date();
            const formattedTime = now.toLocaleTimeString();
            clockElement.innerText = formattedTime;
        }
    }

    // Update clock every second
    setInterval(updateClock, 1000);
    updateClock(); // Initial call

    if (collectPointsButton) {
        collectPointsButton.addEventListener('click', async () => {
            const response = await fetch(`/api/questions/level${currentLevel}`);
            if (response.ok) {
                const questions = await response.json();
                displayQuestions(questions);
            } else {
                console.error('Failed to fetch questions:', response.status);
            }
        });
    }

    async function submitAnswers(answers, level) {
        const response = await fetch('/api/submit-answers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answers })
        });

        if (response.ok) {
            const result = await response.json();
            let scoreKey = `scoreLevel${level}`;
            playerScore += result.score; // Increment the playerScore
            localStorage.setItem(scoreKey, result.score); // Store the score for the current level
            localStorage.setItem('totalScore', playerScore); // Store the cumulative total score
            if (playerScoreElement) playerScoreElement.innerText = playerScore; // Display the updated score
        }
    }

    function displayQuestions(questions) {
        if (questionsContainer) {
            questionsContainer.style.display = 'block';
            const form = document.getElementById('questionsForm');
            if (form) {
                form.innerHTML = ''; // Clear the form
    
                questions.forEach((q, index) => {
                    const questionElement = document.createElement('div');
                    questionElement.classList.add('question-item');
    
                    // Add question text
                    questionElement.innerHTML = `<label>${q.question}</label>`;
    
                    // Add image if available
                    if (q.image) {
                        const imageElement = document.createElement('img');
                        imageElement.src = q.image;
                        imageElement.alt = `Question Image ${index + 1}`;
                        imageElement.style.maxWidth = '300px'; // Adjust size as needed
                        questionElement.appendChild(imageElement);
                    }
    
                    // Create a container for inputs a, b, and c
                    const inputContainer = document.createElement('div');
                    inputContainer.classList.add('input-group');
    
                    // Add input fields for a, b, and c
                    ['a', 'b', 'c'].forEach(label => {
                        const inputItem = document.createElement('div');
                        inputItem.classList.add('input-item');
    
                        inputItem.innerHTML = `
                            <label for="answer${label}${index}">${label}</label>
                            <input type="text" id="answer${label}${index}" name="answer${index}_${label}" class="styled-input" required>
                        `;
    
                        inputContainer.appendChild(inputItem);
                    });
    
                    // Create helper button
                    const helperButton = document.createElement('button');
                    helperButton.innerText = 'ตัวช่วย';
                    helperButton.classList.add('helper-button');
                    questionElement.appendChild(helperButton);
    
                    // Add event listener to helper button
                    helperButton.addEventListener('click', () => {
                        // Create dropdown
                        const dropdown = document.createElement('div');
                        dropdown.classList.add('dropdown');
                        dropdown.innerHTML = `
                            <p>ต้องการตัวช่วยไหม?</p>
                            <button class="helper-option" data-value="1">A</button>
                            <button class="helper-option" data-value="2">B</button>
                            <button class="helper-option" data-value="3">C</button>
                            <button class="close-dropdown">ปิด</button>
                        `;
                        questionElement.appendChild(dropdown);
    
                        // Add event listeners to helper options
                        dropdown.querySelectorAll('.helper-option').forEach(option => {
                            option.addEventListener('click', (e) => {
                                const value = e.target.dataset.value;
                                const inputField = document.getElementById(`answer${e.target.textContent.toLowerCase()}${index}`);
                                inputField.value = value; // Set value based on the button clicked
                                inputField.disabled = true; // Disable input field
                                dropdown.remove(); // Remove dropdown after selection
                            });
                        });
    
                        // Close dropdown button
                        dropdown.querySelector('.close-dropdown').addEventListener('click', () => {
                            dropdown.remove(); // Remove dropdown when closed
                        });
                    });
    
                    questionElement.appendChild(inputContainer); // Append input container to the question element
                    questionElement.appendChild(helperButton); // Append helper button to the question element
                    form.appendChild(questionElement);
                });
    
                // Add submit button
                const submitButton = document.createElement('button');
                submitButton.innerText = 'Submit';
                submitButton.type = 'submit';
                form.appendChild(submitButton);
    
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const formData = new FormData(form);
                    const answers = [];
    
                    questions.forEach((q, index) => {
                        answers.push(formData.get(`answer${index}_a`));
                        answers.push(formData.get(`answer${index}_b`));
                        answers.push(formData.get(`answer${index}_c`));
                    });
    
                    questionsContainer.style.display = 'none';
    
                    await submitAnswers(answers, currentLevel); // Submit answers and update score
    
                    // Navigate to the next level or home page
                    if (currentLevel < 3) { // If not at Level 3
                        currentLevel++;
                        window.location.href = `game_level${currentLevel}`; // Go to the next level
                    } else {
                        window.location.href = `/`; // Return to home page
                    }
                });
            }
        }
    }
    
    

    // Popup function
    function createPopup() {
        const popupDiv = document.createElement('div');
        popupDiv.id = 'popup';
        popupDiv.className = 'hidden';
        popupDiv.innerHTML = `
            <h2>Congratulations!</h2>
            <p>You have successfully answered the questions!</p>
            <button id="closePopup">Close</button>
        `;

        // Close button functionality
        const closePopupButton = popupDiv.querySelector('#closePopup');
        closePopupButton.addEventListener('click', () => {
            popupDiv.classList.add('hidden'); // Hide popup when closed
            popupDiv.remove(); // Remove from DOM

            // Navigate to the next level
            if (currentLevel < 3) { // If not at Level 3
                currentLevel++;
                window.location.href = `game_level${currentLevel}`; // Go to next level
            } else {
                window.location.href = `/`; // Return to home page
                displayScores()
            }
        });

        return popupDiv;
    }

    // Retrieve the total score from localStorage for display
    const totalScore = localStorage.getItem('totalScore') || 0;
    playerScore = Number(totalScore); // Convert to number
    playerScoreElement.innerText = playerScore; // Display the score
});
