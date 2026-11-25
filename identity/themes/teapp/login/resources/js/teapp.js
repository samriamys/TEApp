(() => {
  document.querySelectorAll('[data-toggle-password]').forEach(toggle => {
    toggle.addEventListener('change', () => toggle.dataset.togglePassword.split(',').forEach(id => {
      const input = document.getElementById(id);
      if (input) input.type = toggle.checked ? 'text' : 'password';
    }));
  });
  const form = document.getElementById('kc-register-form');
  if (!form) return;
  const steps = [...form.querySelectorAll('[data-step]')];
  const back = document.getElementById('step-back');
  const next = document.getElementById('step-next');
  const submit = document.getElementById('step-submit');
  const tutorField = document.getElementById('tutor-code-field');
  const tutorCode = document.getElementById('tutorCode');
  const confirmation = document.getElementById('password-confirm');
  confirmation.addEventListener('input', () => confirmation.setCustomValidity(''));
  const params = new URLSearchParams(location.search);
  const hint = params.get('login_hint') || form.dataset.hint;
  const roleFromServer = form.dataset.role;
  const role = roleFromServer || (hint && hint.startsWith('teapp:') ? hint.slice(6) : 'student');
  const selected = [...form.querySelectorAll('[name=teappRole]')].find(input => input.value === role);
  if (selected) selected.checked = true;
  // The app already asks for a role; keep the choice available for direct registrations.
  document.getElementById('registration-role').hidden = !!roleFromServer || !!(hint && hint.startsWith('teapp:'));
  let step = 0;
  function updateRole() {
    const isStudent = form.querySelector('[name=teappRole]:checked')?.value === 'student';
    tutorField.hidden = !isStudent;
    tutorCode.required = isStudent;
  }
  function show() {
    steps.forEach((part, index) => { part.hidden = index !== step; });
    document.getElementById('kc-page-title').textContent = ['Escribe tu nombre', 'Registra un correo', 'Crea una contraseña'][step];
    back.hidden = step === 0;
    next.hidden = step === steps.length - 1;
    submit.hidden = step !== steps.length - 1;
    updateRole();
  }
  form.querySelectorAll('[name=teappRole]').forEach(input => input.addEventListener('change', updateRole));
  back.addEventListener('click', () => { step--; show(); });
  next.addEventListener('click', () => {
    for (const input of steps[step].querySelectorAll('input')) {
      if (!input.checkValidity()) { input.reportValidity(); return; }
    }
    step++; show();
  });
  form.addEventListener('submit', event => {
    updateRole();
    const password = document.getElementById('password');
    confirmation.setCustomValidity(password.value === confirmation.value ? '' : 'Las contraseñas no coinciden.');
    if (!confirmation.checkValidity()) { event.preventDefault(); confirmation.reportValidity(); }
  });
  show();
})();
