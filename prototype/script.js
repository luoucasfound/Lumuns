const output = document.getElementById('output');

const getState = () => ({
  channelName: document.getElementById('channelName').value.trim(),
  niche: document.getElementById('niche').value,
  tone: document.getElementById('tone').value,
  productsRaw: document.getElementById('products').value,
});

function parseProducts(raw) {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, oldPrice, newPrice, link] = line.split('|').map((part) => part.trim());
      return { name, oldPrice, newPrice, link };
    })
    .filter((p) => p.name && p.oldPrice && p.newPrice && p.link);
}

function calcDiscount(oldPrice, newPrice) {
  const oldVal = Number(oldPrice.replace(',', '.'));
  const newVal = Number(newPrice.replace(',', '.'));

  if (Number.isNaN(oldVal) || Number.isNaN(newVal) || oldVal <= 0) {
    return null;
  }

  return Math.round(((oldVal - newVal) / oldVal) * 100);
}

function captionTemplate(product, state) {
  const discount = calcDiscount(product.oldPrice, product.newPrice);
  const discountText = discount !== null ? `${discount}% OFF` : 'SUPER OFERTA';

  return `🔥 ${product.name}\n` +
    `De R$${product.oldPrice} por R$${product.newPrice} (${discountText})\n` +
    `💸 Achado para ${state.niche.toLowerCase()}\n` +
    `🔗 Link com desconto no perfil: ${product.link}\n\n` +
    `#Shopee #Achadinhos #Ofertas #Promoção #${state.channelName.replace('@', '')} #publi`;
}

document.getElementById('generatePosts').addEventListener('click', () => {
  const state = getState();
  const products = parseProducts(state.productsRaw).slice(0, 3);

  if (!products.length) {
    output.textContent = 'Nenhum produto válido encontrado. Use o formato Nome | preço_antigo | preço_novo | link_afiliado.';
    return;
  }

  const posts = products
    .map((product, i) => `POST ${i + 1}\n${captionTemplate(product, state)}`)
    .join('\n\n----------------------\n\n');

  output.textContent = `COPYS PRONTAS (${state.tone})\nPerfil: ${state.channelName}\n\n${posts}`;
});

document.getElementById('generateStories').addEventListener('click', () => {
  const state = getState();
  const products = parseProducts(state.productsRaw).slice(0, 3);

  if (!products.length) {
    output.textContent = 'Adicione produtos para gerar Stories.';
    return;
  }

  const stories = products
    .map((p, i) => {
      const discount = calcDiscount(p.oldPrice, p.newPrice);
      const sticker = discount ? `${discount}% OFF` : 'OFERTA RELÂMPAGO';
      return `Story ${i + 1}: ${p.name}\nTexto: "${sticker} hoje! De R$${p.oldPrice} por R$${p.newPrice}. Arrasta no link da bio!"`;
    })
    .join('\n\n');

  output.textContent = `SEQUÊNCIA DE STORIES\n\n` +
    `Story 0 (abertura): "🚨 Caíram as ofertas da Shopee de hoje!"\n\n` +
    `${stories}\n\n` +
    `Story final: "Quer mais promoções? Me segue e ativa as notificações 🔔"`;
});

document.getElementById('buildSchedule').addEventListener('click', () => {
  const state = getState();

  output.textContent = `CRONOGRAMA SEMANAL — ${state.channelName}\n` +
    `Nicho: ${state.niche}\n` +
    `Tom: ${state.tone}\n\n` +
    `Segunda 12h: Reel "Top 3 ofertas do dia"\n` +
    `Terça 19h: Carrossel "Antes e depois do preço"\n` +
    `Quarta 12h: Stories com enquete "Qual achado vale mais?"\n` +
    `Quinta 19h: Reel de produto campeão de cliques\n` +
    `Sexta 12h: Post "Esquenta de fim de semana"\n` +
    `Sábado 10h: Stories de ofertas relâmpago\n` +
    `Domingo 18h: Resumo + CTA para link da bio\n\n` +
    `Dica: reserve 30 minutos por dia para revisar links e evitar produto fora de estoque.`;
});
