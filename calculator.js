/**
 * CalculatorArchive - Free Tax Calculator 2025
 * Complete tax calculation engine with federal and state taxes
 * Supports all US states and filing statuses
 */

(function() {
    'use strict';

    // ==========================================
    // 2025 Federal Tax Brackets (Indexed for Inflation)
    // ==========================================
    const FEDERAL_BRACKETS_2025 = {
        single: [
            { min: 0, max: 11925, rate: 0.10 },
            { min: 11926, max: 48475, rate: 0.12 },
            { min: 48476, max: 103350, rate: 0.22 },
            { min: 103351, max: 197300, rate: 0.24 },
            { min: 197301, max: 250525, rate: 0.32 },
            { min: 250526, max: 626350, rate: 0.35 },
            { min: 626351, max: Infinity, rate: 0.37 }
        ],
        married_joint: [
            { min: 0, max: 23850, rate: 0.10 },
            { min: 23851, max: 96950, rate: 0.12 },
            { min: 96951, max: 206700, rate: 0.22 },
            { min: 206701, max: 394600, rate: 0.24 },
            { min: 394601, max: 501050, rate: 0.32 },
            { min: 501051, max: 751600, rate: 0.35 },
            { min: 751601, max: Infinity, rate: 0.37 }
        ],
        married_separate: [
            { min: 0, max: 11925, rate: 0.10 },
            { min: 11926, max: 48475, rate: 0.12 },
            { min: 48476, max: 103350, rate: 0.22 },
            { min: 103351, max: 197300, rate: 0.24 },
            { min: 197301, max: 250525, rate: 0.32 },
            { min: 250526, max: 375800, rate: 0.35 },
            { min: 375801, max: Infinity, rate: 0.37 }
        ],
        head_household: [
            { min: 0, max: 17000, rate: 0.10 },
            { min: 17001, max: 64850, rate: 0.12 },
            { min: 64851, max: 103350, rate: 0.22 },
            { min: 103351, max: 197300, rate: 0.24 },
            { min: 197301, max: 250500, rate: 0.32 },
            { min: 250501, max: 626350, rate: 0.35 },
            { min: 626351, max: Infinity, rate: 0.37 }
        ]
    };

    // Standard Deductions for 2025
    const STANDARD_DEDUCTIONS_2025 = {
        single: 15000,
        married_joint: 30000,
        married_separate: 15000,
        head_household: 22500
    };

    // ==========================================
    // State Income Tax Data (2025)
    // ==========================================
    const STATE_TAX_DATA = {
        AL: { name: 'Alabama', type: 'progressive', brackets: { single: [[0,500,0.02],[501,3000,0.04],[3001,Infinity,0.05]], married_joint: [[0,1000,0.02],[1001,6000,0.04],[6001,Infinity,0.05]] }, defaultRate: 0.025 },
        AK: { name: 'Alaska', type: 'none' },
        AZ: { name: 'Arizona', type: 'flat', rate: 0.025 },
        AR: { name: 'Arkansas', type: 'progressive', brackets: { single: [[0,4300,0.02],[4301,8500,0.04],[8501,12500,0.05],[Infinity,Infinity,0.06]], married_joint: [[0,8600,0.02],[8601,17000,0.04],[17001,25000,0.05],[Infinity,Infinity,0.06]] } },
        CA: { name: 'California', type: 'progressive', brackets: { single: [[0,17600,0.01],[17601,41850,0.02],[41851,65750,0.04],[65751,115650,0.06],[115651,216660,0.08],[216661,432460,0.093],[Infinity,Infinity,0.103]], married_joint: [[0,35200,0.01],[35201,83700,0.02],[83701,131500,0.04],[131501,231300,0.06],[231301,433440,0.08],[433441,866920,0.093],[Infinity,Infinity,0.103]] } },
        CO: { name: 'Colorado', type: 'flat', rate: 0.044 },
        CT: { name: 'Connecticut', type: 'progressive', brackets: { single: [[0,10000,0.03],[10001,50000,0.05],[50001,100000,0.055],[100001,200000,0.06],[200001,250000,0.065],[250001,500000,0.069],[Infinity,Infinity,0.0699]], married_joint: [[0,20000,0.03],[20001,100000,0.05],[100001,200000,0.055],[200001,400000,0.06],[400001,500000,0.065],[500001,1000000,0.069],[Infinity,Infinity,0.0699]] } },
        DE: { name: 'Delaware', type: 'progressive', brackets: { single: [[0,2000,0],[2001,5000,0.022],[5001,10000,0.039],[10001,20000,0.048],[20001,25000,0.052],[25001,60000,0.0555],[Infinity,Infinity,0.066]], married_joint: [[0,2000,0],[2001,5000,0.022],[5001,10000,0.039],[10001,20000,0.048],[20001,25000,0.052],[25001,60000,0.0555],[Infinity,Infinity,0.066]] } },
        FL: { name: 'Florida', type: 'none' },
        GA: { name: 'Georgia', type: 'flat', rate: 0.054 },
        HI: { name: 'Hawaii', type: 'progressive', brackets: { single: [[0,2400,0.014],[2401,4600,0.032],[4601,9600,0.055],[9601,14400,0.064],[14401,19200,0.068],[19201,24000,0.072],[Infinity,Infinity,0.076]], married_joint: [[0,4800,0.014],[4801,9200,0.032],[9201,19200,0.055],[19201,28800,0.064],[28801,38400,0.068],[38401,48000,0.072],[Infinity,Infinity,0.076]] } },
        ID: { name: 'Idaho', type: 'flat', rate: 0.058 },
        IL: { name: 'Illinois', type: 'flat', rate: 0.0495 },
        IN: { name: 'Indiana', type: 'flat', rate: 0.0305 },
        IA: { name: 'Iowa', type: 'flat', rate: 0.038 },
        KS: { name: 'Kansas', type: 'progressive', brackets: { single: [[0,15000,0.031],[15001,30000,0.0525],[Infinity,Infinity,0.057]], married_joint: [[0,30000,0.031],[30001,60000,0.0525],[Infinity,Infinity,0.057]] } },
        KY: { name: 'Kentucky', type: 'flat', rate: 0.04 },
        LA: { name: 'Louisiana', type: 'progressive', brackets: { single: [[0,12500,0.02],[12501,50000,0.04],[Infinity,Infinity,0.06]], married_joint: [[0,25000,0.02],[25001,100000,0.04],[Infinity,Infinity,0.06]] } },
        ME: { name: 'Maine', type: 'progressive', brackets: { single: [[0,24500,0.058],[24501,58000,0.0675],[Infinity,Infinity,0.0715]], married_joint: [[0,49000,0.058],[49001,116000,0.0675],[Infinity,Infinity,0.0715]] } },
        MD: { name: 'Maryland', type: 'progressive', brackets: { single: [[0,1000,0.02],[1001,2000,0.03],[2001,3000,0.04],[3001,100000,0.0475],[100001,125000,0.05],[125001,150000,0.0525],[150001,250000,0.055],[Infinity,Infinity,0.0575]], married_joint: [[0,1000,0.02],[1001,2000,0.03],[2001,3000,0.04],[3001,150000,0.0475],[150001,175000,0.05],[175001,225000,0.0525],[225001,300000,0.055],[Infinity,Infinity,0.0575]] } },
        MA: { name: 'Massachusetts', type: 'flat', rate: 0.05 },
        MI: { name: 'Michigan', type: 'flat', rate: 0.0425 },
        MN: { name: 'Minnesota', type: 'progressive', brackets: { single: [[0,31090,0.0535],[31091,102260,0.0705],[102261,Unknown,0.0785]], married_joint: [[0,45680,0.0535],[45681,151340,0.0705],[151341,Unknown,0.0785]] } },
        MS: { name: 'Mississippi', type: 'progressive', brackets: { single: [[0,5000,0.03],[5001,10000,0.04],[10001,Infinity,0.05]], married_joint: [[0,5000,0.03],[5001,10000,0.04],[10001,Infinity,0.05]] } },
        MO: { name: 'Missouri', type: 'flat', rate: 0.04 },
        MT: { name: 'Montana', type: 'progressive', brackets: { single: [[0,12500,0.01],[12501,27000,0.02],[27001,44000,0.03],[44001,72000,0.04],[72001,100800,0.05],[100801,150400,0.06],[Infinity,Infinity,0.0675]], married_joint: [[0,25000,0.01],[25001,54000,0.02],[54001,88000,0.03],[88001,144000,0.04],[144001,201600,0.05],[201601,302800,0.06],[Infinity,Infinity,0.0675]] } },
        NE: { name: 'Nebraska', type: 'progressive', brackets: { single: [[0,3450,0.0246],[3451,20730,0.0351],[20731,36900,0.0501],[Infinity,Infinity,0.0584]], married_joint: [[0,6900,0.0246],[6901,41460,0.0351],[41401,73800,0.0501],[Infinity,Infinity,0.0584]] } },
        NV: { name: 'Nevada', type: 'none' },
        NH: { name: 'New Hampshire', type: 'none' },
        NJ: { name: 'New Jersey', type: 'progressive', brackets: { single: [[0,20000,0.014],[20001,35000,0.0175],[35001,40000,0.035],[40001,75000,0.05525],[75001,500000,0.0637],[500001,1000000,0.0897],[Infinity,Infinity,0.1075]], married_joint: [[0,20000,0.014],[20001,35000,0.0175],[35001,40000,0.035],[40001,75000,0.05525],[75001,500000,0.0637],[500001,1000000,0.0897],[Infinity,Infinity,0.1075]] } },
        NM: { name: 'New Mexico', type: 'progressive', brackets: { single: [[0,5500,0.017],[5501,11000,0.032],[11001,16000,0.047],[16001,21000,0.052],[21001,100000,0.059],[Infinity,Infinity,0.059]], married_joint: [[0,8000,0.017],[8001,16000,0.032],[16001,24000,0.047],[24001,32000,0.052],[32001,150000,0.059],[Infinity,Infinity,0.059]] } },
        NY: { name: 'New York', type: 'progressive', brackets: { single: [[0,8500,0.04],[8501,11700,0.045],[11701,13850,0.0525],[13851,21400,0.0585],[21401,80650,0.0625],[80651,215400,0.0685],[215401,1077550,0.0965],[Infinity,Infinity,0.109]], married_joint: [[0,17150,0.04],[17151,23600,0.045],[23601,27900,0.0525],[27901,43000,0.0585],[43001,161300,0.0625],[161301,323200,0.0685],[323201,2155100,0.0965],[Infinity,Infinity,0.109]] } },
        NC: { name: 'North Carolina', type: 'flat', rate: 0.045 },
        ND: { name: 'North Dakota', type: 'progressive', brackets: { single: [[0,4650,0.011],[4651,13650,0.02],[13651,23400,0.0225],[23401,44550,0.026],[44551,111950,0.029],[Infinity,Infinity,0.029]], married_joint: [[0,7750,0.011],[7751,22750,0.02],[22751,39000,0.0225],[39001,74250,0.026],[74251,186580,0.029],[Infinity,Infinity,0.029]] } },
        OH: { name: 'Ohio', type: 'progressive', brackets: { single: [[0,26050,0],[26051,100000,0.02765],[Infinity,Infinity,0.0399]], married_joint: [[0,26050,0],[26051,100000,0.02765],[Infinity,Infinity,0.0399]] } },
        OK: { name: 'Oklahoma', type: 'progressive', brackets: { single: [[0,1000,0.005],[1001,2500,0.01],[2501,3750,0.02],[3751,4900,0.03],[4901,7200,0.04],[Infinity,Infinity,0.05]], married_joint: [[0,2000,0.005],[2001,5000,0.01],[5001,7500,0.02],[7501,9800,0.03],[9801,14400,0.04],[Infinity,Infinity,0.05]] } },
        OR: { name: 'Oregon', type: 'progressive', brackets: { single: [[0,3950,0.0475],[3951,10150,0.0675],[10151,125000,0.0875],[Infinity,Infinity,0.099]], married_joint: [[0,7900,0.0475],[7901,20300,0.0675],[20301,250000,0.0875],[Infinity,Infinity,0.099]] } },
        PA: { name: 'Pennsylvania', type: 'flat', rate: 0.0307 },
        RI: { name: 'Rhode Island', type: 'progressive', brackets: { single: [[0,7350,0.0375],[7351,18500,0.0475],[18501,41850,0.0599],[41851,80500,0.0799],[Infinity,Infinity,0.0999]], married_joint: [[0,14700,0.0375],[14701,37000,0.0475],[37001,83700,0.0599],[83701,161000,0.0799],[Infinity,Infinity,0.0999]] } },
        SC: { name: 'South Carolina', type: 'progressive', brackets: { single: [[0,3710,0],[3711,7420,0.03],[7421,11000,0.045],[11001,15000,0.05],[15001,20000,0.055],[Infinity,Infinity,0.0675]], married_joint: [[0,7420,0],[7421,14840,0.03],[14801,22000,0.045],[22001,30000,0.05],[30001,40000,0.055],[Infinity,Infinity,0.0675]] } },
        SD: { name: 'South Dakota', type: 'none' },
        TN: { name: 'Tennessee', type: 'none' },
        TX: { name: 'Texas', type: 'none' },
        UT: { name: 'Utah', type: 'flat', rate: 0.0495 },
        VT: { name: 'Vermont', type: 'progressive', brackets: { single: [[0,4800,0.0335],[4801,11600,0.066],[11601,43900,0.076],[43901,101300,0.0875],[Infinity,Infinity,0.0895]], married_joint: [[0,9600,0.0335],[9601,23200,0.066],[23201,87800,0.076],[87801,202600,0.0875],[Infinity,Infinity,0.0895]] } },
        VA: { name: 'Virginia', type: 'progressive', brackets: { single: [[0,3000,0.02],[3001,5000,0.03],[5001,17000,0.05],[Infinity,Infinity,0.0575]], married_joint: [[0,3000,0.02],[3001,5000,0.03],[5001,17000,0.05],[Infinity,Infinity,0.0575]] } },
        WA: { name: 'Washington', type: 'none' },
        WV: { name: 'West Virginia', type: 'progressive', brackets: { single: [[0,10000,0.03],[10001,25000,0.04],[25001,40000,0.045],[40001,60000,0.06],[Infinity,Infinity,0.065]], married_joint: [[0,10000,0.03],[10001,25000,0.04],[25001,40000,0.045],[40001,60000,0.06],[Infinity,Infinity,0.065]] } },
        WI: { name: 'Wisconsin', type: 'progressive', brackets: { single: [[0,13910,0.04],[13911,27690,0.058],[27691,Unknown,0.0627]], married_joint: [[0,18610,0.04],[18611,37220,0.058],[37221,Unknown,0.0627]] } },
        WY: { name: 'Wyoming', type: 'none' },
        DC: { name: 'District of Columbia', type: 'progressive', brackets: { single: [[0,1000,0.04],[1001,4000,0.06],[4001,10000,0.065],[10001,Infinity,0.085]], married_joint: [[0,1000,0.04],[1001,4000,0.06],[4001,10000,0.065],[10001,Infinity,0.085]] } }
    };

    // ==========================================
    // 2025 Tax Constants
    // ==========================================
    const SOCIAL_SECURITY_WAGE_BASE = 176100;
    const SOCIAL_SECURITY_RATE = 0.062;
    const MEDICARE_RATE = 0.0145;
    const ADDITIONAL_MEDICARE_RATE = 0.009;
    const ADDITIONAL_MEDICARE_THRESHOLD_SINGLE = 200000;
    const ADDITIONAL_MEDICARE_THRESHOLD_MARRIED = 250000;

    // ==========================================
    // Utility Functions
    // ==========================================

    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    function formatCurrencyDetailed(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    function formatPercent(rate) {
        return (rate * 100).toFixed(2) + '%';
    }

    // ==========================================
    // Federal Tax Calculation
    // ==========================================
    function calculateFederalTax(taxableIncome, filingStatus) {
        const brackets = FEDERAL_BRACKETS_2025[filingStatus] || FEDERAL_BRACKETS_2025.single;
        let tax = 0;
        let marginalRate = 0;

        for (const bracket of brackets) {
            if (taxableIncome > bracket.min) {
                const incomeInBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
                tax += incomeInBracket * bracket.rate;
                marginalRate = bracket.rate;
            }
        }

        return {
            tax: Math.max(0, tax),
            marginalRate: marginalRate
        };
    }

    // ==========================================
    // State Tax Calculation
    // ==========================================
    function calculateStateTax(taxableIncome, stateCode, filingStatus) {
        const stateData = STATE_TAX_DATA[stateCode];
        if (!stateData || stateData.type === 'none') {
            return { tax: 0, rate: 0, stateName: stateData ? stateData.name : stateCode };
        }

        const stateName = stateData.name;
        let tax = 0;
        let effectiveRate = 0;

        if (stateData.type === 'flat') {
            tax = taxableIncome * stateData.rate;
            effectiveRate = stateData.rate;
        } else if (stateData.type === 'progressive') {
            const statusKey = filingStatus.replace('_', '').replace('marriedjoint', 'married_joint').replace('marriedseparate', 'married_separate').replace('headhousehold', 'head_household');
            const brackets = stateData.brackets?.[filingStatus] || stateData.brackets?.single || stateData.brackets?.married_joint || [];

            for (const bracket of brackets) {
                if (taxableIncome > bracket[0]) {
                    const incomeInBracket = Math.min(taxableIncome, bracket[1]) - bracket[0];
                    tax += incomeInBracket * bracket[2];
                }
            }
            effectiveRate = taxableIncome > 0 ? tax / taxableIncome : 0;
        }

        return {
            tax: Math.max(0, tax),
            rate: effectiveRate,
            stateName: stateName
        };
    }

    // ==========================================
    // FICA Tax Calculation
    // ==========================================
    function calculateFICATax(taxableIncome, filingStatus) {
        // Social Security (6.2% up to wage base)
        const socialSecurityTax = Math.min(taxableIncome, SOCIAL_SECURITY_WAGE_BASE) * SOCIAL_SECURITY_RATE;

        // Medicare (1.45% on all wages)
        const medicareTax = taxableIncome * MEDICARE_RATE;

        // Additional Medicare Tax (0.9% above thresholds)
        const additionalMedicareThreshold = filingStatus === 'married_joint'
            ? ADDITIONAL_MEDICARE_THRESHOLD_MARRIED
            : ADDITIONAL_MEDICARE_THRESHOLD_SINGLE;

        let additionalMedicareTax = 0;
        if (taxableIncome > additionalMedicareThreshold) {
            additionalMedicareTax = (taxableIncome - additionalMedicareThreshold) * ADDITIONAL_MEDICARE_RATE;
        }

        return {
            socialSecurity: socialSecurityTax,
            medicare: medicareTax,
            additionalMedicare: additionalMedicareTax,
            total: socialSecurityTax + medicareTax + additionalMedicareTax
        };
    }

    // ==========================================
    // Main Tax Calculation Engine
    // ==========================================
    function calculateTax(options) {
        const {
            grossIncome = 0,
            filingStatus = 'single',
            payFrequency = 'annually',
            stateCode = 'CA',
            retirement401k = 0,
            otherDeductions = 0
        } = options;

        // Convert to annual if needed
        let annualGrossIncome = grossIncome;
        if (payFrequency === 'monthly') {
            annualGrossIncome = grossIncome * 12;
        } else if (payFrequency === 'biweekly') {
            annualGrossIncome = grossIncome * 26;
        } else if (payFrequency === 'weekly') {
            annualGrossIncome = grossIncome * 52;
        }

        // Pre-tax deductions
        const max401kPercentage = 0.25;
        const effective401kRate = Math.min(retirement401k / 100, max401kPercentage);
        const retirementDeduction = annualGrossIncome * effective401kRate;
        const totalPreTaxDeductions = retirementDeduction + otherDeductions;

        // Taxable income after standard deduction
        const standardDeduction = STANDARD_DEDUCTIONS_2025[filingStatus] || STANDARD_DEDUCTIONS_2025.single;
        const taxableIncome = Math.max(0, annualGrossIncome - totalPreTaxDeductions - standardDeduction);

        // Federal tax
        const federalResult = calculateFederalTax(taxableIncome, filingStatus);

        // State tax
        const stateResult = calculateStateTax(taxableIncome, stateCode, filingStatus);

        // FICA tax
        const ficaResult = calculateFICATax(annualGrossIncome - retirementDeduction, filingStatus);

        // Totals
        const totalFederalTax = federalResult.tax;
        const totalStateTax = stateResult.tax;
        const totalFICATax = ficaResult.total;
        const totalTax = totalFederalTax + totalStateTax + totalFICATax;

        // Take-home pay
        const annualTakeHome = annualGrossIncome - totalPreTaxDeductions - totalTax;

        // Effective tax rate (percentage of gross income)
        const effectiveTaxRate = annualGrossIncome > 0 ? totalTax / annualGrossIncome : 0;

        // Pay period conversions
        const periodMultipliers = {
            annually: 1,
            monthly: 12,
            biweekly: 26,
            weekly: 52
        };

        const multiplier = periodMultipliers[payFrequency] || 1;

        return {
            grossIncome: annualGrossIncome,
            standardDeduction: standardDeduction,
            preTaxDeductions: totalPreTaxDeductions,
            taxableIncome: taxableIncome,
            federalTax: totalFederalTax,
            federalMarginalRate: federalResult.marginalRate,
            stateTax: totalStateTax,
            stateName: stateResult.stateName,
            stateRate: stateResult.rate,
            ficaSocialSecurity: ficaResult.socialSecurity,
            ficaMedicare: ficaResult.medicare,
            ficaAdditionalMedicare: ficaResult.additionalMedicare,
            totalFica: totalFICATax,
            totalTax: totalTax,
            annualTakeHome: annualTakeHome,
            effectiveTaxRate: effectiveTaxRate,
            payFrequency: payFrequency,
            multiplier: multiplier
        };
    }

    // ==========================================
    // UI Update Functions
    // ==========================================
    function updateResultsUI(results) {
        const federalTaxEl = document.getElementById('federalTax');
        const stateTaxEl = document.getElementById('stateTax');
        const ficaTaxEl = document.getElementById('ficaTax');
        const totalTaxEl = document.getElementById('totalTax');
        const annualTakeHomeEl = document.getElementById('annualTakeHome');
        const effectiveRateEl = document.getElementById('effectiveRate');
        const detailGrossIncomeEl = document.getElementById('detailGrossIncome');
        const detailPreTaxDeductionsEl = document.getElementById('detailPreTaxDeductions');
        const detailTaxableIncomeEl = document.getElementById('detailTaxableIncome');
        const detailMarginalRateEl = document.getElementById('detailMarginalRate');
        const detailFicaEl = document.getElementById('detailFica');
        const resultsCard = document.getElementById('resultsCard');

        if (!resultsCard) return;

        // Show results
        resultsCard.style.display = 'block';

        // Update main results
        if (federalTaxEl) federalTaxEl.textContent = formatCurrency(results.federalTax);
        if (stateTaxEl) stateTaxEl.textContent = formatCurrency(results.stateTax);
        if (ficaTaxEl) ficaTaxEl.textContent = formatCurrency(results.totalFica);
        if (totalTaxEl) totalTaxEl.textContent = formatCurrency(results.totalTax);
        if (annualTakeHomeEl) annualTakeHomeEl.textContent = formatCurrency(results.annualTakeHome);
        if (effectiveRateEl) effectiveRateEl.textContent = formatPercent(results.effectiveTaxRate);

        // Update detailed breakdown
        if (detailGrossIncomeEl) detailGrossIncomeEl.textContent = formatCurrency(results.grossIncome);
        if (detailPreTaxDeductionsEl) detailPreTaxDeductionsEl.textContent = formatCurrency(results.preTaxDeductions);
        if (detailTaxableIncomeEl) detailTaxableIncomeEl.textContent = formatCurrency(results.taxableIncome);
        if (detailMarginalRateEl) detailMarginalRateEl.textContent = formatPercent(results.federalMarginalRate);
        if (detailFicaEl) detailFicaEl.textContent = formatCurrency(results.totalFica);

        // Add animation class
        resultsCard.classList.add('results-visible');

        // Scroll to results on mobile
        if (window.innerWidth < 1024) {
            resultsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    function showError(message) {
        const resultsCard = document.getElementById('resultsCard');
        if (!resultsCard) return;

        resultsCard.style.display = 'block';
        resultsCard.innerHTML = `
            <div class="error-state">
                <div class="error-icon">⚠️</div>
                <h3 class="error-title">Calculation Error</h3>
                <p class="error-message">${message}</p>
                <button class="retry-btn" onclick="document.getElementById('taxForm').reset(); location.reload();">Try Again</button>
            </div>
        `;
    }

    // ==========================================
    // Event Handlers
    // ==========================================
    function handleFormSubmit(event) {
        event.preventDefault();

        const grossIncome = parseFloat(document.getElementById('grossIncome')?.value) || 0;
        const filingStatus = document.getElementById('filingStatus')?.value || 'single';
        const payFrequency = document.getElementById('payFrequency')?.value || 'annually';
        const stateCode = document.getElementById('state')?.value || 'CA';
        const retirement401k = parseFloat(document.getElementById('retirement401k')?.value) || 0;
        const otherDeductions = parseFloat(document.getElementById('otherDeductions')?.value) || 0;

        // Validation
        if (!grossIncome || grossIncome <= 0) {
            showError('Please enter a valid gross annual income greater than zero.');
            return;
        }

        if (!filingStatus) {
            showError('Please select your filing status.');
            return;
        }

        if (!stateCode) {
            showError('Please select your state of residence.');
            return;
        }

        try {
            const results = calculateTax({
                grossIncome,
                filingStatus,
                payFrequency,
                stateCode,
                retirement401k,
                otherDeductions
            });

            updateResultsUI(results);
        } catch (error) {
            console.error('Tax calculation error:', error);
            showError('An error occurred during calculation. Please try again.');
        }
    }

    // ==========================================
    // Real-time Calculation on Input Change
    // ==========================================
    function setupRealTimeCalculation() {
        const form = document.getElementById('taxForm');
        if (!form) return;

        const inputs = form.querySelectorAll('input, select');
        let debounceTimer;

        inputs.forEach(input => {
            input.addEventListener('input', () => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    const event = new Event('submit', { cancelable: true });
                    form.dispatchEvent(event);
                }, 800);
            });

            input.addEventListener('change', () => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    const event = new Event('submit', { cancelable: true });
                    form.dispatchEvent(event);
                }, 300);
            });
        });
    }

    // ==========================================
    // FAQ Accordion Enhancement
    // ==========================================
    function setupFAQAccordion() {
        const faqItems = document.querySelectorAll('.faq-item');

        faqItems.forEach(item => {
            item.addEventListener('toggle', () => {
                // Close other items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.open) {
                        otherItem.removeAttribute('open');
                    }
                });
            });
        });
    }

    // ==========================================
    // Smooth Scroll for Anchor Links
    // ==========================================
    function setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;

                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // ==========================================
    // Input Formatting (Auto-format numbers)
    // ==========================================
    function setupInputFormatting() {
        const grossIncomeInput = document.getElementById('grossIncome');
        const otherDeductionsInput = document.getElementById('otherDeductions');

        [grossIncomeInput, otherDeductionsInput].forEach(input => {
            if (!input) return;

            input.addEventListener('blur', function() {
                const value = parseFloat(this.value);
                if (!isNaN(value) && value > 0) {
                    this.value = value.toLocaleString('en-US');
                }
            });

            input.addEventListener('focus', function() {
                const value = parseFloat(this.value.replace(/,/g, ''));
                if (!isNaN(value)) {
                    this.value = value;
                }
            });
        });
    }

    // ==========================================
    // Accessibility: Announce Results
    // ==========================================
    function announceResults(results) {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.className = 'sr-only';
        announcement.textContent = `Tax calculation complete. Your estimated federal tax is ${formatCurrency(results.federalTax)}, state tax is ${formatCurrency(results.stateTax)}, and your annual take-home pay is ${formatCurrency(results.annualTakeHome)} with an effective tax rate of ${formatPercent(results.effectiveTaxRate)}.`;
        document.body.appendChild(announcement);

        setTimeout(() => {
            announcement.remove();
        }, 1000);
    }

    // ==========================================
    // Initialize
    // ==========================================
    document.addEventListener('DOMContentLoaded', function() {
        const form = document.getElementById('taxForm');
        if (form) {
            form.addEventListener('submit', handleFormSubmit);
        }

        setupRealTimeCalculation();
        setupFAQAccordion();
        setupSmoothScroll();
        setupInputFormatting();

        // Auto-calculate with default values for demo
        if (form) {
            const event = new Event('submit', { cancelable: true });
            form.dispatchEvent(event);
        }

        // Log initialization
        console.log('CalculatorArchive Tax Calculator 2025 initialized successfully.');
    });

    // Export for testing
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            calculateTax,
            calculateFederalTax,
            calculateStateTax,
            calculateFICATax,
            formatCurrency,
            formatPercent
        };
    }

})();
