# Sistema-Monitoramento-Linhas-Onibus (Busca Bus)
## [FatecDSM-2025/2]
### Repositório para desenvolvimento da aplicação para solucionar problemas do transporte urbano na Fatec-ZL
Originalmente projetado para uso interno na Fatec Zona Leste, o projeto cresceu, agora com a capacidade de atender qualquer instituição do município de São Paulo, em toda localidade onde os ônibus da SPTrans atuam.

## Instruções de uso
1. Acesse o [site hospedado no Github Pages](https://mateus-sr.github.io/Sistema-Monitoramento-Linhas-Onibus/public/views/index.html)
2. Caso possua o código para uma exibição, insira-o no campo presente na tela inicial e acesse a exibição
   - Caso não o possua, crie uma nova exibição ou entre com o responsável por gerenciar as exibições na sua instituição
     - Para criar uma exibição, é necessário ter o(s) código(s) da(s) parada(s). Verifique presencialmente no ponto desejado se [o informativo do ponto](https://www.sptrans.com.br/media/3714/comunicacao2019.jpg) encontra-se presente.
         - O código da parada pode ser localizado no canto superior esquerdo
     - Se mesmo assim não for possível ter acesso ao código de parada, por favor, entre em contato com a SPTrans solicitando-o.
     - Observação, apesar do [tutorial do Olho Vivo](https://olhovivo.sptrans.com.br/files/TutorialNovoOlhoVivo.pdf) indicar ser possível encontrar o código pelo site, essa funcionalidade não está mais disponível conforme indica o tutorial. Para ter acesso ao código de forma online, siga o seguinte:
       1. Acesse `https://www.sptrans.com.br/itinerarios/linha/?numero=<letreiro>`. Substitua `<letreiro>` com o letreiro completo de algum ônibus que passa pelo ponto (Ex: 273D-10)
       2. No mapa, localize manualmente o ponto desejado e clique sobre ele. (Os pontos aparecem como circulos azuis)
       3. Clique em "Ver no Olho Vivo".
       4. Copie o código numérico presente na URL após `Parada&PID=`

## Instruções de instalação (local)
1. Clone ou baixe o repositório
  - Caso possua o git instalado, rode `git clone https://github.com/Mateus-SR/Sistema-Monitoramento-Linhas-Onibus.git`
2. Instale as dependências do Node.js com `npm install`
3. [Instale e rode o Jekyll](https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/testing-your-github-pages-site-locally-with-jekyll)
4. Na raíz do projeto, rode `node app.js`
