class Game1 {
    constructor() {
        this.currentQuestionIndex = 0;
        // ...other initializations...
        this.addNavigationButtons();
        this.loadQuestion();
    }

    addNavigationButtons() {
        // Add Previous button if not present
        let prevBtn = document.getElementById('prevBtn');
        if (!prevBtn) {
            prevBtn = document.createElement('button');
            prevBtn.id = 'prevBtn';
            prevBtn.className = 'btn secondary';
            prevBtn.innerHTML = '<i class="fas fa-arrow-left"></i> Previous';
            prevBtn.style.display = 'none';
            prevBtn.style.marginRight = '12px';
            const controls = document.querySelector('.quiz-controls');
            controls.insertBefore(prevBtn, controls.firstChild);
        }
        prevBtn.onclick = () => {
            if (this.currentQuestionIndex > 0) {
                this.currentQuestionIndex--;
                this.loadQuestion();
            }
        };
        // Next button event
        let nextBtn = document.getElementById('nextBtn');
        if (!nextBtn) {
            nextBtn = document.createElement('button');
            nextBtn.id = 'nextBtn';
            nextBtn.className = 'btn';
            nextBtn.innerHTML = '<i class="fas fa-arrow-right"></i> Next';
            nextBtn.style.display = 'none';
            const controls = document.querySelector('.quiz-controls');
            controls.appendChild(nextBtn);
        }
        nextBtn.onclick = () => {
            if (this.currentQuestionIndex < this.questions.length - 1) {
                this.currentQuestionIndex++;
                this.loadQuestion();
            }
        };
    }

    loadQuestion() {
        if (this.currentQuestionIndex >= this.questions.length) {
            this.showCompletion();
            return;
        }

        const question = this.questions[this.currentQuestionIndex];

        document.getElementById('questionNumber').textContent = `Question ${this.currentQuestionIndex + 1}`;
        document.getElementById('questionText').textContent = question.question;

        if (this.isEditMode) {
            const correctAnswer = question.options[question.correctAnswer];
            document.getElementById('correctHint').textContent = `Correct Answer: ${correctAnswer}`;
        }

        // Create draggable items
        this.createDraggableItems(question.options);

        // Setup drag and drop after creating items
        this.setupDragAndDrop();

        // Reset drop zone and state
        this.resetDropZone();
        this.isAnswered = false;

        // Update progress
        this.updateProgress();

        // Reset feedback and buttons
        document.getElementById('feedback').classList.remove('show');

        // Hide Next button until answered
        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn) nextBtn.style.display = 'none';

        // Show/hide Previous button
        const prevBtn = document.getElementById('prevBtn');
        if (prevBtn) prevBtn.style.display = (this.currentQuestionIndex > 0) ? 'inline-flex' : 'none';
    }

    handleDrop(value) {
        console.log('Handling drop:', value);
        const dropZone = document.getElementById('dropZone');

        // Hide the dragged item
        const draggables = document.querySelectorAll('.draggable');
        draggables.forEach(draggable => {
            if (draggable.dataset.value === value) {
                draggable.style.display = 'none';
            }
        });

        // Update drop zone
        dropZone.textContent = value;
        dropZone.classList.add('filled');
        dropZone.dataset.value = value;

        this.selectedAnswer = value;
        this.isAnswered = true;

        // Show Next button if not last question
        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn) {
            nextBtn.style.display = (this.currentQuestionIndex < this.questions.length - 1) ? 'inline-flex' : 'none';
        }
    }

    // ...rest of your class...
}

// Usage:
window.addEventListener('load', () => {
    detectEmbedded();
    window.quiz = new Game1();
});