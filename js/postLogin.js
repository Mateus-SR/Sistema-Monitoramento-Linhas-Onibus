document.addEventListener('DOMContentLoaded', () => {
    const botoesConta = document?.getElementById('botoesConta');
    const botaoAcessaConta = document?.getElementById('botaoAcessaConta')
    const tokenLogin = localStorage?.getItem('tokenLogin');

    function gerenciaBotoesConta(tokenLogin) {
        if (tokenLogin) {
            botoesConta.classList.toggle('invisible');
            botaoAcessaConta.classList.toggle('invisible');
        } else {
            botoesConta.classList.remove('invisible');
            botaoAcessaConta.classList.add('invisible');
        }
    }
});