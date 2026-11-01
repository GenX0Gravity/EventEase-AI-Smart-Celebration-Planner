/**
 * EventEase AI – Multi-Step Event Creation Wizard
 * Step 1: Basic Details (Name, Type, Date, Times, Venue, Indoor/Outdoor)
 * Step 2: Guest Details (Guests, Adults/Kids, VIPs, Special needs)
 * Step 3: Budget (Budget, Currency, Flexibility)
 * Step 4: Style & Preferences (Theme, Palette, Formal/Casual, Food, Entertainment)
 * Step 5: Additional Requirements (Cultural, Accessibility, Special Notes)
 */

const Wizard = {
  currentStep: 1,
  totalSteps: 5,
  editingEventId: null,

  init() {
    this.setupListeners();
    this.goToStep(1);
  },

  setupListeners() {
    const btnNext = document.getElementById('wizardBtnNext');
    const btnPrev = document.getElementById('wizardBtnPrev');
    const form = document.getElementById('eventWizardForm');

    if (btnNext) {
      btnNext.addEventListener('click', () => {
        if (this.currentStep < this.totalSteps) {
          if (this.validateCurrentStep()) {
            this.goToStep(this.currentStep + 1);
          }
        } else {
          if (this.validateCurrentStep()) {
            this.submitWizard();
          }
        }
      });
    }

    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        if (this.currentStep > 1) {
          this.goToStep(this.currentStep - 1);
        }
      });
    }

    // Step pill clicks
    document.querySelectorAll('.wizard-step-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const stepNum = parseInt(pill.dataset.step, 10);
        if (stepNum < this.currentStep || this.validateCurrentStep()) {
          this.goToStep(stepNum);
        }
      });
    });
  },

  goToStep(step) {
    this.currentStep = step;

    // Toggle step panes
    for (let i = 1; i <= this.totalSteps; i++) {
      const pane = document.getElementById(`wizardStep${i}`);
      const pill = document.querySelector(`.wizard-step-pill[data-step="${i}"]`);
      if (pane) {
        pane.style.display = i === step ? 'block' : 'none';
      }
      if (pill) {
        pill.classList.toggle('active', i === step);
        pill.classList.toggle('completed', i < step);
      }
    }

    // Update progress bar
    const progressFill = document.getElementById('wizardProgressFill');
    if (progressFill) {
      const pct = ((step - 1) / (this.totalSteps - 1)) * 100;
      progressFill.style.width = `${pct}%`;
    }

    // Buttons
    const btnPrev = document.getElementById('wizardBtnPrev');
    const btnNext = document.getElementById('wizardBtnNext');
    if (btnPrev) {
      btnPrev.style.visibility = step === 1 ? 'hidden' : 'visible';
    }
    if (btnNext) {
      if (step === this.totalSteps) {
        btnNext.innerHTML = `<i data-lucide="sparkles"></i> <span>Generate & Save Celebration</span>`;
      } else {
        btnNext.innerHTML = `<span>Next Step</span> <i data-lucide="arrow-right"></i>`;
      }
      lucide.createIcons();
    }
  },

  validateCurrentStep() {
    if (this.currentStep === 1) {
      const name = document.getElementById('wEventName')?.value.trim();
      const type = document.getElementById('wEventType')?.value;
      const date = document.getElementById('wEventDate')?.value;
      const location = document.getElementById('wEventLocation')?.value.trim();

      if (!name) { showToast('Please enter an event name', 'error'); return false; }
      if (!type) { showToast('Please select an event type', 'error'); return false; }
      if (!date) { showToast('Please select the event date', 'error'); return false; }
      if (!location) { showToast('Please enter the venue or city', 'error'); return false; }
      return true;
    }

    if (this.currentStep === 2) {
      const guests = parseInt(document.getElementById('wEventGuests')?.value, 10);
      if (isNaN(guests) || guests < 1) {
        showToast('Please enter expected number of guests', 'error');
        return false;
      }
      return true;
    }

    if (this.currentStep === 3) {
      const budget = parseFloat(document.getElementById('wEventBudget')?.value);
      if (isNaN(budget) || budget <= 0) {
        showToast('Please enter a valid planned budget', 'error');
        return false;
      }
      return true;
    }

    return true;
  },

  startNewEvent() {
    this.editingEventId = null;
    const form = document.getElementById('eventWizardForm');
    if (form) form.reset();
    document.getElementById('wizardTitle').textContent = 'Create New Event';
    this.goToStep(1);
  },

  startEditEvent(eventId) {
    const ev = Storage.getEvent(eventId);
    if (!ev) return;
    this.editingEventId = eventId;
    document.getElementById('wizardTitle').textContent = `Edit Event: ${ev.name}`;

    // Fill fields
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val !== undefined ? val : '';
    };

    setVal('wEventName', ev.name);
    setVal('wEventType', ev.type);
    setVal('wEventDate', ev.date);
    setVal('wStartTime', ev.startTime || '10:00');
    setVal('wEndTime', ev.endTime || '22:00');
    setVal('wEventLocation', ev.location);
    setVal('wVenueType', ev.venueType || 'Indoor');

    setVal('wEventGuests', ev.guests);
    setVal('wAdultsCount', ev.adultsCount || '');
    setVal('wChildrenCount', ev.childrenCount || '');
    setVal('wVipCount', ev.vipCount || '');
    setVal('wGuestRequirements', ev.guestRequirements || '');

    setVal('wEventBudget', ev.budget);
    setVal('wCurrency', ev.currency || 'INR');
    setVal('wFlexibility', ev.flexibility || 'Flexible');

    setVal('wTheme', ev.theme || '');
    setVal('wColorPalette', ev.colorPalette || '');
    setVal('wStyle', ev.style || 'Formal');
    setVal('wFoodPreference', ev.foodPreference || '');
    setVal('wEntertainment', ev.entertainment || '');

    setVal('wCulturalPreferences', ev.culturalPreferences || '');
    setVal('wAccessibility', ev.accessibility || '');
    setVal('wSpecialInstructions', ev.specialRequirements || ev.additionalReqs || '');

    this.goToStep(1);
  },

  submitWizard() {
    const getVal = (id) => document.getElementById(id)?.value.trim() || '';

    const eventData = {
      name: getVal('wEventName'),
      type: getVal('wEventType'),
      date: getVal('wEventDate'),
      startTime: getVal('wStartTime') || '10:00',
      endTime: getVal('wEndTime') || '22:00',
      location: getVal('wEventLocation'),
      venueType: getVal('wVenueType') || 'Indoor',

      guests: getVal('wEventGuests'),
      adultsCount: getVal('wAdultsCount'),
      childrenCount: getVal('wChildrenCount'),
      vipCount: getVal('wVipCount'),
      guestRequirements: getVal('wGuestRequirements'),

      budget: getVal('wEventBudget'),
      currency: getVal('wCurrency') || 'INR',
      flexibility: getVal('wFlexibility') || 'Flexible',

      theme: getVal('wTheme') || 'Modern Elegance',
      colorPalette: getVal('wColorPalette') || 'Purple & Soft Gold',
      style: getVal('wStyle') || 'Formal',
      foodPreference: getVal('wFoodPreference'),
      entertainment: getVal('wEntertainment'),

      culturalPreferences: getVal('wCulturalPreferences'),
      accessibility: getVal('wAccessibility'),
      specialRequirements: getVal('wSpecialInstructions'),
      additionalReqs: getVal('wSpecialInstructions'),
    };

    if (this.editingEventId) {
      eventData.id = this.editingEventId;
    }

    const saved = Storage.saveEvent(eventData);
    Storage.setActiveEventId(saved.id);

    // Generate initial plan, budget & timeline via SmartPlanner if not present
    if (!Storage.getPlan(saved.id)) {
      const plan = SmartPlanner.generatePlan(saved);
      Storage.savePlan(saved.id, plan);
    }
    if (!Storage.getBudget(saved.id)) {
      const budget = SmartPlanner.generateBudgetBreakdown(saved);
      Storage.saveBudget(saved.id, budget);
    }
    if (!Storage.getTimeline(saved.id)) {
      const timeline = SmartPlanner.generateTimeline(saved);
      Storage.saveTimeline(saved.id, timeline);
    }
    if (!Storage.getChecklist(saved.id)) {
      const checklist = SmartPlanner.generateChecklist(saved);
      Storage.saveChecklist(saved.id, checklist);
    }

    // Refresh UI selectors
    if (typeof updateEventSelector === 'function') updateEventSelector();

    showToast(`🎉 "${saved.name}" celebration plan created!`, 'success');
    navigateTo('ai-planner');
  }
};

