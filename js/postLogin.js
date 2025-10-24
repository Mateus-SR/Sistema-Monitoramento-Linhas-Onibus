document.addEventListener('DOMContentLoaded', () => {
    const botoesConta = document?.querySelectorAll('.botoesConta');
    const botaoAcessaConta = document?.getElementById('botaoAcessaConta')
    const tokenLogin = localStorage.getItem('tokenLogin');

    gerenciaBotoesConta(tokenLogin);

    function gerenciaBotoesConta(tokenLogin) {
        if (tokenLogin) {

            botoesConta.forEach(cadaUm => {
                cadaUm.classList.toggle('invisible');
            });
            botaoAcessaConta.classList.toggle('invisible');
        }
    }
});