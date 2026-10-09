/**
 * Portfolio Interactive Scripts
 * Lucas Vinhal Ferreira - Engenharia de Computação
 * 
 * Features:
 * - Theme switching (dark/light) with localStorage persistence
 * - Project filtering by category
 * - Interactive terminal emulator
 * - C Calculator simulator
 * - Python Number Guessing Game simulator
 * - CO2 Sensor live simulator
 * - Contact form with validation
 * - Mobile navigation toggle
 * - Accessibility enhancements
 */

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Safely escape HTML to prevent XSS
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Debounce function to limit rate of execution
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in ms
 * @returns {Function} Debounced function
 */
function debounce(fn, delay) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
}

/**
 * Get current year for footer
 * @returns {number} Current year
 */
function getCurrentYear() {
    return new Date().getFullYear();
}

// ============================================================================
// THEME MANAGEMENT
// ============================================================================

function initTheme() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const htmlElement = document.documentElement;

    if (!themeToggleBtn || !themeIcon) return;

    // Check saved theme or system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    setTheme(initialTheme);

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    });

    function setTheme(theme) {
        htmlElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        themeIcon.className = theme === 'light' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
        
        // Update meta theme-color for mobile browsers
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', theme === 'dark' ? '#0d1117' : '#f6f8fa');
        }
    }
}

// ============================================================================
// MOBILE NAVIGATION
// ============================================================================

function initMobileNav() {
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.getElementById('nav-links');
    
    if (!navToggle || !navLinks) return;

    navToggle.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', isOpen);
        navToggle.querySelector('i').classList.toggle('fa-bars', !isOpen);
        navToggle.querySelector('i').classList.toggle('fa-xmark', isOpen);
        
        // Trap focus when menu is open
        if (isOpen) {
            trapFocus(navLinks);
        }
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.querySelector('i').classList.add('fa-bars');
            navToggle.querySelector('i').classList.remove('fa-xmark');
        });
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('open')) {
            navLinks.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.focus();
        }
    });
}

/**
 * Simple focus trap for modal/menu
 * @param {HTMLElement} element - Element to trap focus in
 */
function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
        'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    function handleTab(e) {
        if (e.key !== 'Tab') return;
        
        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }

    element.addEventListener('keydown', handleTab);
    element._focusTrapHandler = handleTab;
}

// ============================================================================
// PROJECT FILTERING
// ============================================================================

function initProjectFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    if (!filterButtons.length || !projectCards.length) return;

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filterValue = button.getAttribute('data-filter');
            
            // Update active state
            filterButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-pressed', 'false');
            });
            button.classList.add('active');
            button.setAttribute('aria-pressed', 'true');

            // Filter cards with animation
            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');
                const shouldShow = filterValue === 'all' || filterValue === category;
                
                if (shouldShow) {
                    card.style.display = 'flex';
                    // Force reflow for animation
                    card.offsetHeight;
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(10px)';
                    setTimeout(() => {
                        if (card.style.opacity === '0') {
                            card.style.display = 'none';
                        }
                    }, 200);
                }
            });
        });
    });
}

// ============================================================================
// DEMO TABS
// ============================================================================

function initDemoTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const demoBoxes = document.querySelectorAll('.demo-box');

    if (!tabButtons.length || !demoBoxes.length) return;

    // Use data attributes instead of onclick parsing
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            if (!tabName) return;
            
            switchDemoTab(tabName);
        });
    });

    // Initialize first tab as active
    const firstActiveTab = document.querySelector('.tab-btn[aria-selected="true"]');
    if (firstActiveTab) {
        const tabName = firstActiveTab.getAttribute('data-tab');
        if (tabName) switchDemoTab(tabName);
    }
}

function switchDemoTab(tabName) {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const demoBoxes = document.querySelectorAll('.demo-box');

    tabButtons.forEach(tab => {
        const isActive = tab.getAttribute('data-tab') === tabName;
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', isActive);
    });

    demoBoxes.forEach(box => {
        const isActive = box.id === `demo-${tabName}`;
        box.classList.toggle('active', isActive);
        box.hidden = !isActive;
    });

    // Update demo title
    const titleMap = {
        calc: 'Calculadora C',
        guess: 'Jogo Adivinhar',
        co2: 'Simulador CO2'
    };
    const titleEl = document.getElementById('demo-title');
    if (titleEl && titleMap[tabName]) {
        titleEl.innerHTML = `<i class="fa-solid fa-play" aria-hidden="true"></i> ${titleMap[tabName]}`;
    }
}

function openDemo(demoName) {
    switchDemoTab(demoName);
    const interactiveSection = document.getElementById('interactive');
    if (interactiveSection) {
        interactiveSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Expose globally for HTML onclick handlers (transition period)
window.openDemo = openDemo;

// ============================================================================
// TERMINAL EMULATOR
// ============================================================================

function initTerminal() {
    const terminalInput = document.getElementById('terminal-input');
    const terminalBody = document.getElementById('terminal-body');

    if (!terminalInput || !terminalBody) return;

    const COMMANDS = {
        help: {
            description: 'Listar comandos disponíveis',
            handler: () => [
                'Comandos disponíveis:',
                '  <span class="cmd-highlight">about</span>     - Informações sobre Lucas Vinhal Ferreira',
                '  <span class="cmd-highlight">skills</span>    - Lista de habilidades técnicas',
                '  <span class="cmd-highlight">projects</span>  - Projetos desenvolvidos',
                '  <span class="cmd-highlight">calc</span>      - Executar calculadora C no sandbox',
                '  <span class="cmd-highlight">guess</span>     - Iniciar jogo Adivinhe o Número',
                '  <span class="cmd-highlight">co2</span>       - Ver leitura do sensor de CO2',
                '  <span class="cmd-highlight">contact</span>   - Informações de contato',
                '  <span class="cmd-highlight">clear</span>     - Limpar o terminal',
                '  <span class="cmd-highlight">help</span>      - Mostrar esta ajuda'
            ].join('<br>')
        },
        about: {
            description: 'Informações sobre o autor',
            handler: () => `<strong>Lucas Vinhal Ferreira</strong> — Estudante de Engenharia de Computação na UniCEUB.<br>Foco em Sistemas Embarcados, Linguagem C/C++, Linux Server e Segurança.`
        },
        skills: {
            description: 'Lista de habilidades técnicas',
            handler: () => `<strong>Habilidades Técnicas:</strong><br>
                • Linguagens: C, C++, Python, Java, Rust, HTML/CSS<br>
                • Hardware: ESP32, Arduino, Microcontroladores, Sensores<br>
                • Infra: Linux (Ubuntu Server), SSH, Redes, UFW Firewall, Git`
        },
        projects: {
            description: 'Projetos desenvolvidos',
            handler: () => `<strong>Projetos:</strong><br>
                1. Monitoramento de CO2 com ESP32 (SCD30)<br>
                2. Calculadora Interativa em C (projetos/calculadora.c)<br>
                3. Jogo Adivinhe o Número Python (projetos/adivinhe o numero.py)<br>
                4. Ubuntu Server — Infraestrutura & Segurança`
        },
        calc: {
            description: 'Abrir calculadora no sandbox',
            handler: () => {
                openDemo('calc');
                return 'Abertura do módulo Calculadora no sandbox...';
            }
        },
        guess: {
            description: 'Abrir jogo no sandbox',
            handler: () => {
                openDemo('guess');
                return 'Abertura do módulo Adivinhe o Número no sandbox...';
            }
        },
        co2: {
            description: 'Abrir telemetria CO2 no sandbox',
            handler: () => {
                openDemo('co2');
                return 'Abertura da telemetria de CO2 no sandbox...';
            }
        },
        contact: {
            description: 'Informações de contato',
            handler: () => `<strong>Contato:</strong><br>
                • Email: lucasvinhal3001@gmail.com<br>
                • GitHub: github.com/romunac<br>
                • LinkedIn: linkedin.com/in/lucas-vinhal-24334a2b3`
        },
        clear: {
            description: 'Limpar o terminal',
            handler: () => {
                terminalBody.innerHTML = '';
                return ''; // No output
            }
        }
    };

    terminalInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const command = terminalInput.value.trim().toLowerCase();
            processCommand(command);
            terminalInput.value = '';
        }
    });

    function printLine(html, isCommand = false) {
        const line = document.createElement('p');
        line.className = 'terminal-line';
        if (isCommand) {
            line.innerHTML = `<span class="prompt">lucas@portfolio:~$</span> ${html}`;
        } else {
            line.innerHTML = html;
        }
        terminalBody.appendChild(line);
        terminalBody.scrollTop = terminalBody.scrollHeight;
    }

    function processCommand(cmd) {
        if (!cmd) return;
        printLine(escapeHtml(cmd), true);

        const command = COMMANDS[cmd];
        if (command) {
            const output = command.handler();
            if (output) printLine(output);
        } else {
            printLine(`Comando não reconhecido: '${escapeHtml(cmd)}'. Digite <span class="cmd-highlight">'help'</span> para comandos.`);
        }
    }
}

// ============================================================================
// CALCULATOR DEMO
// ============================================================================

function initCalculator() {
    const num1Input = document.getElementById('calc-num1');
    const num2Input = document.getElementById('calc-num2');
    const opSelect = document.getElementById('calc-op');
    const runBtn = document.getElementById('calc-run');
    const output = document.getElementById('calc-result');

    if (!num1Input || !num2Input || !opSelect || !runBtn || !output) return;

    function runCalculator() {
        const num1 = parseFloat(num1Input.value);
        const num2 = parseFloat(num2Input.value);
        const op = opSelect.value;

        if (isNaN(num1) || isNaN(num2)) {
            showError('Erro: Digite números válidos para a expressão!');
            return;
        }

        let result = 0;
        let err = false;

        switch (op) {
            case '+': result = num1 + num2; break;
            case '-': result = num1 - num2; break;
            case '*': result = num1 * num2; break;
            case '/':
                if (num2 !== 0) {
                    result = num1 / num2;
                } else {
                    err = true;
                }
                break;
        }

        if (err) {
            showError(`[C Code Executed]\nDigite uma expressao: ${num1} / ${num2}\nErro: divisao por zero!`);
        } else {
            showSuccess(`[C Code Executed]\nDigite uma expressao: ${num1} ${op} ${num2}\nResultado: ${result.toFixed(2)}`);
        }
    }

    function showError(msg) {
        output.textContent = msg;
        output.style.color = 'var(--error-color)';
    }

    function showSuccess(msg) {
        output.textContent = msg;
        output.style.color = 'var(--primary-color)';
    }

    runBtn.addEventListener('click', runCalculator);

    // Allow Enter key in inputs to trigger calculation
    [num1Input, num2Input].forEach(input => {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') runCalculator();
        });
    });
}

// ============================================================================
// GUESS GAME DEMO
// ============================================================================

function initGuessGame() {
    const input = document.getElementById('guess-input');
    const submitBtn = document.getElementById('guess-submit');
    const resetBtn = document.getElementById('guess-reset');
    const output = document.getElementById('guess-result');

    if (!input || !submitBtn || !resetBtn || !output) return;

    let secretNum = 0;
    let attempts = 0;

    function reset() {
        secretNum = Math.floor(Math.random() * 100) + 1;
        attempts = 0;
        output.textContent = '=== Adivinhe o Número ===\nEstou pensando em um número de 1 a 100... Digite seu palpite!';
        output.style.color = 'var(--accent-color)';
        input.value = '';
        input.focus();
    }

    function makeGuess() {
        const guess = parseInt(input.value, 10);

        if (isNaN(guess) || guess < 1 || guess > 100) {
            output.textContent = 'Por favor, insira um número inteiro válido entre 1 e 100.';
            output.style.color = 'var(--error-color)';
            return;
        }

        attempts++;

        if (guess < secretNum) {
            output.textContent = `Palpite: ${guess}\nMuito baixo! Tente um número maior. (Tentativa ${attempts})`;
            output.style.color = 'var(--warning-color)';
        } else if (guess > secretNum) {
            output.textContent = `Palpite: ${guess}\nMuito alto! Tente um número menor. (Tentativa ${attempts})`;
            output.style.color = 'var(--warning-color)';
        } else {
            output.textContent = `🎉 Parabéns! Você acertou o número ${secretNum}!\nVocê precisou de ${attempts} tentativa(s). Clique em Reiniciar para jogar de novo.`;
            output.style.color = 'var(--success-color)';
        }
    }

    submitBtn.addEventListener('click', makeGuess);
    resetBtn.addEventListener('click', reset);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') makeGuess();
    });

    // Initialize
    reset();
}

// ============================================================================
// CO2 SENSOR DEMO
// ============================================================================

function initCO2Sensor() {
    const valElem = document.getElementById('co2-val');
    const statusElem = document.getElementById('co2-status');
    const manualBtn = document.getElementById('co2-manual');
    const autoBtn = document.getElementById('auto-co2-btn');

    if (!valElem || !statusElem || !manualBtn || !autoBtn) return;

    let co2Interval = null;
    let autoCO2Active = true;

    function updateDisplay(ppm) {
        valElem.textContent = ppm;

        if (ppm < 600) {
            statusElem.textContent = 'Qualidade do Ar: excelente (Ar Puro)';
            valElem.style.color = 'var(--success-color)';
        } else if (ppm < 1000) {
            statusElem.textContent = 'Qualidade do Ar: moderada (Ambiente Aceitável)';
            valElem.style.color = 'var(--primary-color)';
        } else {
            statusElem.textContent = 'Qualidade do Ar: atenção (Recomenda-se Ventilação)';
            valElem.style.color = 'var(--error-color)';
        }
    }

    function triggerCO2Simulation() {
        // Simulate CO2 PPM value range (400 - 1500 ppm)
        const ppm = Math.floor(Math.random() * (1200 - 400 + 1)) + 400;
        updateDisplay(ppm);
    }

    function toggleAutoCO2(forceState = null) {
        if (forceState !== null) {
            autoCO2Active = forceState;
        } else {
            autoCO2Active = !autoCO2Active;
        }

        if (autoCO2Active) {
            autoBtn.innerHTML = '<i class="fa-solid fa-pause" aria-hidden="true"></i> Auto Leitura (Ativo)';
            autoBtn.setAttribute('aria-pressed', 'true');
            if (!co2Interval) {
                co2Interval = setInterval(triggerCO2Simulation, 3000);
            }
        } else {
            autoBtn.innerHTML = '<i class="fa-solid fa-play" aria-hidden="true"></i> Auto Leitura (Pausado)';
            autoBtn.setAttribute('aria-pressed', 'false');
            if (co2Interval) {
                clearInterval(co2Interval);
                co2Interval = null;
            }
        }
    }

    manualBtn.addEventListener('click', triggerCO2Simulation);
    autoBtn.addEventListener('click', () => toggleAutoCO2());

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (co2Interval) {
            clearInterval(co2Interval);
        }
    });

    // Initialize
    toggleAutoCO2(true);
    triggerCO2Simulation();
}

// ============================================================================
// CONTACT FORM
// ============================================================================

function initContactForm() {
    const form = document.getElementById('contact-form');
    const toast = document.getElementById('form-toast');
    
    if (!form || !toast) return;

    const validators = {
        name: (value) => value.trim().length >= 2 ? null : 'Nome deve ter pelo menos 2 caracteres',
        email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : 'Email inválido',
        message: (value) => value.trim().length >= 10 ? null : 'Mensagem deve ter pelo menos 10 caracteres'
    };

    function showFieldError(input, message) {
        input.setAttribute('aria-invalid', 'true');
        const errorEl = input.parentElement.querySelector('.form-error');
        if (errorEl) errorEl.textContent = message;
    }

    function clearFieldError(input) {
        input.setAttribute('aria-invalid', 'false');
        const errorEl = input.parentElement.querySelector('.form-error');
        if (errorEl) errorEl.textContent = '';
    }

    function showToast(message, isSuccess = true) {
        toast.textContent = message;
        toast.className = `form-toast ${isSuccess ? 'success' : 'error'}`;
    }

    function hideToast() {
        toast.className = 'form-toast';
    }

    // Real-time validation
    form.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('blur', () => {
            const validator = validators[input.name];
            if (validator) {
                const error = validator(input.value);
                if (error) showFieldError(input, error);
                else clearFieldError(input);
            }
        });

        input.addEventListener('input', () => {
            if (input.getAttribute('aria-invalid') === 'true') {
                const validator = validators[input.name];
                if (validator && !validator(input.value)) {
                    clearFieldError(input);
                }
            }
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        let isValid = true;
        const formData = {};

        // Validate all fields
        form.querySelectorAll('input, textarea').forEach(input => {
            const validator = validators[input.name];
            if (validator) {
                const error = validator(input.value);
                if (error) {
                    showFieldError(input, error);
                    isValid = false;
                } else {
                    clearFieldError(input);
                }
                formData[input.name] = input.value.trim();
            }
        });

        if (!isValid) {
            showToast('Por favor, corrija os erros no formulário.', false);
            return;
        }

        // Simulate form submission
        showToast(`Obrigado pelo contato, ${formData.name}! Sua mensagem foi simulada com sucesso.`);
        form.reset();

        setTimeout(hideToast, 5000);
    });
}

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules with error boundaries
    const initializers = [
        { name: 'Theme', fn: initTheme },
        { name: 'Mobile Nav', fn: initMobileNav },
        { name: 'Project Filters', fn: initProjectFilters },
        { name: 'Demo Tabs', fn: initDemoTabs },
        { name: 'Terminal', fn: initTerminal },
        { name: 'Calculator', fn: initCalculator },
        { name: 'Guess Game', fn: initGuessGame },
        { name: 'CO2 Sensor', fn: initCO2Sensor },
        { name: 'Contact Form', fn: initContactForm },
        { name: 'Footer Year', fn: () => {
            const yearEl = document.getElementById('current-year');
            if (yearEl) yearEl.textContent = getCurrentYear();
        }}
    ];

    initializers.forEach(({ name, fn }) => {
        try {
            fn();
        } catch (error) {
            console.error(`[Portfolio] Failed to initialize ${name}:`, error);
        }
    });
});

// ============================================================================
// SERVICE WORKER REGISTRATION (Optional - for offline support)
// ============================================================================

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {
            // Silently fail - SW is optional enhancement
        });
    });
}
