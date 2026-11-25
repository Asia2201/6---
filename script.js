document.addEventListener('DOMContentLoaded', () => {
    const cells = document.querySelectorAll('#demo-spreadsheet td');
    const addressBox = document.getElementById('active-address');
    const formulaInput = document.getElementById('formula-input');

    // Обробка вибору клітинки
    cells.forEach(cell => {
        cell.addEventListener('click', () => {
            cells.forEach(c => c.classList.remove('selected-cell'));
            cell.classList.add('selected-cell');

            const addr = cell.getAttribute('data-addr');
            addressBox.textContent = addr;

            if (cell.hasAttribute('data-formula')) {
                formulaInput.value = cell.getAttribute('data-formula');
            } else {
                formulaInput.value = cell.textContent.trim();
            }
        });

        // Перерахунок середнього балу при зміні оцінок
        if (cell.classList.contains('num-cell')) {
            cell.addEventListener('input', () => {
                formulaInput.value = cell.textContent.trim();
                recalculateAverages();
            });
        }
    });

    function recalculateAverages() {
        for (let row = 2; row <= 4; row++) {
            const bCell = document.querySelector(`td[data-addr="B${row}"]`);
            const cCell = document.querySelector(`td[data-addr="C${row}"]`);
            const dCell = document.querySelector(`td[data-addr="D${row}"]`);

            const valB = parseFloat(bCell.textContent.replace(',', '.'));
            const valC = parseFloat(cCell.textContent.replace(',', '.'));

            if (!isNaN(valB) && !isNaN(valC)) {
                const avg = ((valB + valC) / 2).toFixed(1).replace(/\.0$/, '');
                dCell.textContent = avg;
            } else {
                dCell.textContent = 'Помилка!';
            }
        }
    }

    // Перевірка тесту
    const checkBtn = document.getElementById('check-quiz-btn');
    const resultBox = document.getElementById('quiz-result');

    checkBtn.addEventListener('click', () => {
        const totalQuestions = 4;
        let score = 0;
        let answered = 0;

        for (let i = 1; i <= totalQuestions; i++) {
            const selected = document.querySelector(`input[name="q${i}"]:checked`);
            if (selected) {
                answered++;
                if (selected.value === 'correct') {
                    score++;
                }
            }
        }

        resultBox.classList.remove('hidden', 'result-success', 'result-warning');

        if (answered < totalQuestions) {
            resultBox.textContent = `Будь ласка, дай відповідь на всі запитання! (Відповідей: ${answered} з ${totalQuestions})`;
            resultBox.classList.add('result-warning');
            return;
        }

        if (score === totalQuestions) {
            resultBox.textContent = `🎉 Молодець! Твій результат: ${score} з ${totalQuestions} (12 балів). Ти чудово засвоїв тему!`;
            resultBox.classList.add('result-success');
        } else if (score >= 2) {
            resultBox.textContent = `👍 Непогано! Твій результат: ${score} з ${totalQuestions}. Переглянь теорію ще раз, щоб покращити результат.`;
            resultBox.classList.add('result-warning');
        } else {
            resultBox.textContent = `📚 Твій результат: ${score} з ${totalQuestions}. Уважно прочитай розділ «Будова таблиці» та спробуй знову!`;
            resultBox.classList.add('result-warning');
        }
    });
});
