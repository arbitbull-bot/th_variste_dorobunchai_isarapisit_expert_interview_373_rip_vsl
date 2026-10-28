const btnPolicy = document.querySelector('.link_policy');
const policy = document.querySelector('.policy');
const btnConditions = document.querySelector('.link_conditions');
const conditions = document.querySelector('.conditions');
const closes = document.querySelectorAll('.close');

btnPolicy.addEventListener('click', () => {
    policy.classList.remove('hidden');
    if (!conditions.classList.contains('hidden_cond')) {
        conditions.classList.add('hidden_cond');
    }
});

btnConditions.addEventListener('click', () => {
    conditions.classList.remove('hidden_cond');
    if (!policy.classList.contains('hidden')) {
        policy.classList.add('hidden');
    }
});

closes.forEach(close => {
    close.addEventListener('click', () => {
        policy.classList.add('hidden');
        conditions.classList.add('hidden_cond');
    });
});
