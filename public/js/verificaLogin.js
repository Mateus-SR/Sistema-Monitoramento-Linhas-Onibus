import { iniciaAnim, fechaAnim, setTexto, setSubTexto, erroAnim } from './loadingAnim.js';

const vercel = 'https://sistema-monitoramento-linhas-onibus.vercel.app';

document.addEventListener('DOMContentLoaded', async () => {

    const usuarioLogado = localStorage.getItem('tokenLogin') || sessionStorage.getItem('tokenLogin');
    iniciaAnim();

    // Se não existe token, logo não existe usuario
    if (!usuarioLogado) {
        bloquearAcesso("Para acessar essa página, por favor, faça login.");
        return;
    }

    try{
        const resposta = await fetch(`${vercel}/get-usuario-perfil`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Access-Token': `Bearer ${usuarioLogado}`
            }
        });

        if (!resposta.ok) {
            throw new Error("Token expirado ou inválido.");
        }

        console.log("Token validado com êxito.");
        fechaAnim();
    } catch (error) {
        console.error("Erro na validação:", error)
        localStorage.removeItem('tokenLogin');
        bloquearAcesso("Sua sessão expirou. Por favor, faça login novamente.");
    }

    function bloquearAcesso(subTexto){
        setTexto("Entrada proibida!");
        setSubTexto(`${subTexto}\nVocê será redirecionado em breve.`)
    
        setTimeout(() => {
            fechaAnim();
            window.location.href = 'login.html';
        }, 3000);
    }
})
