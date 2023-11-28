async function converter(event) {
  event.preventDefault();

  //Varriáveis do form
  const moedaOrigem = document.getElementById("origem").value;
  const moedaDestino = document.getElementById("destino").value;
  const valor = parseFloat(document.getElementById("valor").value);
  const resultado = document.getElementById("resultado");

  //Obtem a data de hoje
  const hoje = todayDate()
  //Obtem a data de anteontem, assim o range de datas da api sempre irá cobrir os finais de semana
  const anteontem = dayBeforeYesterdayDate();

  //URLs das APIs
  const apiUrlOrigem = `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoMoedaPeriodo(moeda=@moeda,dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)?@moeda='${moedaOrigem}%27&@dataInicial='${anteontem}%27&@dataFinalCotacao='${hoje}%27&$top=100&$skip=0&$format=json&$select=cotacaoCompra,cotacaoVenda,dataHoraCotacao,tipoBoletim`;
  const apiUrlDestino = `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoMoedaPeriodo(moeda=@moeda,dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)?@moeda='${moedaDestino}%27&@dataInicial='${anteontem}%27&@dataFinalCotacao='${hoje}%27&$top=100&$skip=0&$format=json&$select=cotacaoCompra,cotacaoVenda,dataHoraCotacao,tipoBoletim`;

  try {
    // Respostas das APIs
    const responseOrigem = await fetch(apiUrlOrigem);
    const dataOrigem = await responseOrigem.json();
    const responseDestino = await fetch(apiUrlDestino);
    const dataDestino = await responseDestino.json();

    // Obtendo os valores do último objeto da API
    const ultimoDadoOrigem = dataOrigem.value[dataOrigem.value.length - 1];
    const ultimoDadoDestino = dataDestino.value[dataDestino.value.length - 1];

    let infoMoedaOrigem = null;
    let infoMoedaDestino = null;

    //Verificação se as moedas de origem e destino são iguais
    if(moedaDestino === moedaOrigem){
      return resultado.textContent = `Valor convertido: ${valor} ${moedaDestino}`;
    }
    //Verificação dos últimos valores da moeda de origem da API e se ela é diferente de BRL
    if(moedaOrigem !== "BRL"){
      if (
        (ultimoDadoOrigem.tipoBoletim === "Fechamento" || ultimoDadoOrigem.tipoBoletim === "Intermediário" || ultimoDadoOrigem.tipoBoletim === "Abertura") &&
        ultimoDadoOrigem.cotacaoCompra !== null && ultimoDadoOrigem.cotacaoVenda !== null
      ) {
        infoMoedaOrigem = ultimoDadoOrigem;
      }
    }
    //Verificação dos últimos valores da moeda de destino da API e se ela é diferente de BRL
    if(moedaDestino !== "BRL"){
      if (
        (ultimoDadoDestino.tipoBoletim === "Fechamento" || ultimoDadoDestino.tipoBoletim === "Intermediário" || ultimoDadoDestino.tipoBoletim === "Abertura") &&
        ultimoDadoDestino.cotacaoVenda !== null && ultimoDadoDestino.cotacaoCompra !== null
      ) {
        infoMoedaDestino = ultimoDadoDestino;
      }
    }

    //Resultado para caso a moeda de origem seja BRL
    if(moedaOrigem === "BRL"){

      const valorVendaDestino = infoMoedaDestino.cotacaoVenda;
      const valorConvertido = valor / valorVendaDestino;
      resultado.textContent = `Valor convertido: ${valorConvertido.toFixed(2)} ${moedaDestino}`;
      
    // Resultado para caso a moeda de destino seja BRL  
    }else if (moedaDestino === "BRL"){

      const valorVendaOrigem = infoMoedaOrigem.cotacaoCompra;
      const valorConvertido = valor * valorVendaOrigem;
      resultado.textContent = `Valor convertido: ${valorConvertido.toFixed(2)} ${moedaDestino}`;

      // Obtém os valores de compra e venda para as moedas de origem e destino diferentes de BRL
    }else if (infoMoedaOrigem && infoMoedaDestino) {
      const valorCompraOrigem = infoMoedaOrigem.cotacaoCompra;

      const valorVendaDestino = infoMoedaDestino.cotacaoVenda;

      // Realizar o cálculo da conversão
      const valorConvertidoCompra = valor * valorCompraOrigem;
      const valorConvertidoVenda = valorConvertidoCompra / valorVendaDestino;

      // Exibição do resultado de conversão de moedas
      resultado.textContent = `Valor convertido: ${valorConvertidoVenda.toFixed(2)} ${moedaDestino}`;
    } 
  } catch (error) {
    resultado.textContent = "Ocorreu um erro ao converter o valor.";
    console.error("Erro:", error);
  }
}
// Função para formatar a data no padrão passado para a API
function formattedDate(data) {
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = data.getFullYear();
  return `${mes}-${dia}-${ano}`;
}
//Função para obter a data do dia 
function todayDate() {
  const today = new Date();
  return formattedDate(today);
}
//Função para obter a data de 2 dias anteriores a data do dia
function dayBeforeYesterdayDate() {
  const dayBeforeYesterday = new Date();
  dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);
  return formattedDate(dayBeforeYesterday);
}

const form = document.getElementById("formCambio");
form.addEventListener("submit", converter);