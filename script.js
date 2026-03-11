/**
 * CLASSE MASTER: Core Engine da Aplicação
 * Responsável por cálculos termodinâmicos e estruturação de dados.
 */
class PerformanceEngine {
    constructor() {
        this.sportsLibrary = {
            bodybuilding: { name: 'Hypertrophy/Strength', met: 6.0, waterFactor: 0.8, focus: 'Mechanical Tension' },
            running: { name: 'Endurance/VO2 Max', met: 12.5, waterFactor: 1.5, focus: 'Metabolic Efficiency' },
            jiujitsu: { name: 'Combat Performance', met: 10.0, waterFactor: 1.2, focus: 'Isometric Strength' },
            crossfit: { name: 'Metabolic Conditioning', met: 13.0, waterFactor: 1.8, focus: 'Work Capacity' }
        };
        
        this.init();
    }

    init() {
        this.populateSports();
        this.attachEventListeners();
        lucide.createIcons();
    }

    populateSports() {
        const select = document.getElementById('sport');
        Object.entries(this.sportsLibrary).forEach(([id, data]) => {
            const opt = document.createElement('option');
            opt.value = id;
            opt.textContent = data.name;
            select.appendChild(opt);
        });
    }

    /**
     * Algoritmo de Mifflin-St Jeor para Taxa Metabólica Basal
     */
    calculateBMR(weight, height, age, gender) {
        let bmr = (10 * weight) + (6.25 * height) - (5 * age);
        return gender === 'male' ? bmr + 5 : bmr - 161;
    }

    calculateMacros(calories, goal) {
        const distribution = {
            lose: { p: 0.40, c: 0.35, f: 0.25 },
            maintain: { p: 0.30, c: 0.45, f: 0.25 },
            gain: { p: 0.25, c: 0.55, f: 0.20 }
        };
        
        const dist = distribution[goal];
        return {
            protein: (calories * dist.p) / 4,
            carbs: (calories * dist.c) / 4,
            fats: (calories * dist.f) / 9
        };
    }

    attachEventListeners() {
        document.getElementById('performanceForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.processSimulation();
        });
    }

    processSimulation() {
        // Captura de Dados Complexos
        const rawData = new FormData(document.getElementById('performanceForm'));
        const user = Object.fromEntries(rawData.entries());
        
        const weight = parseFloat(user.weight);
        const sport = this.sportsLibrary[user.sport];
        
        // 1. Termodinâmica
        const bmr = this.calculateBMR(weight, parseFloat(user.height), parseInt(user.age), user.gender);
        let tdee = bmr * 1.55; // Multiplicador de atividade moderada
        
        if (user.goal === 'lose') tdee -= 500;
        if (user.goal === 'gain') tdee += 400;

        // 2. Hidratação e Eletrólitos (Baseado no Peso + MET)
        const waterBase = weight * 0.035;
        const sweatRate = (sport.met * weight * sport.waterFactor) / 1000;
        const totalWater = waterBase + sweatRate;

        // 3. Macros
        const macros = this.calculateMacros(tdee, user.goal);

        this.renderDashboard(Math.round(tdee), macros, totalWater.toFixed(1), sport);
    }

    renderDashboard(calories, macros, water, sport) {
        document.getElementById('welcomeScreen').style.display = 'none';
        document.getElementById('activeMonitor').style.display = 'block';

        // Atualização Atómica do DOM
        this.animateValue("valCalories", calories);
        this.animateValue("valProtein", Math.round(macros.protein));
        this.animateValue("valCarbs", Math.round(macros.carbs));
        document.getElementById('valWater').textContent = `${water}L`;

        this.renderTrainingProtocol(sport);
        lucide.createIcons();
    }

    animateValue(id, end) {
        const obj = document.getElementById(id);
        let start = 0;
        const duration = 1000;
        const startTime = performance.now();

        const step = (now) => {
            const progress = Math.min((now - startTime) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start);
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }

    renderTrainingProtocol(sport) {
        const container = document.getElementById('trainingOutput');
        container.innerHTML = `
            <div class="exercise-card">
                <div class="flex justify-between items-start">
                    <h4 class="font-bold text-lg">${sport.focus} Phase</h4>
                    <span class="text-xs bg-blue-900 text-blue-200 px-2 py-1 rounded">MET: ${sport.met}</span>
                </div>
                <p class="text-sm text-dim mt-2">Foco no sistema energético dominante para ${sport.name}.</p>
                <div class="mt-4 space-y-2">
                    <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent-secondary">
                        <i data-lucide="check-circle-2" class="w-4 h-4"></i> Bloco A: Ativação Neuromuscular
                    </div>
                    <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent-secondary">
                        <i data-lucide="check-circle-2" class="w-4 h-4"></i> Bloco B: Volume de Trabalho Principal
                    </div>
                </div>
            </div>
        `;
    }
}

// Inicialização da Engine
const engine = new PerformanceEngine();