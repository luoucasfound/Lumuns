const output = document.getElementById('output');
const queueList = document.getElementById('queueList');

const queue = [];

const getState = () => ({
  channelName: document.getElementById('channelName').value.trim(),
  niche: document.getElementById('niche').value,
  tone: document.getElementById('tone').value,
  platform: document.getElementById('platform').value,
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
    `💸 Oferta para ${state.niche.toLowerCase()}\n` +
    `🔗 Link afiliado: ${product.link}\n\n` +
    `#Shopee #Achadinhos #Ofertas #Promoção #${state.channelName.replace('@', '')} #publi`;
}

function getPlatformPlan(platform) {
  if (platform === 'TikTok') {
    return 'Formato: vídeo 9:16, 20-35s, cortes rápidos e CTA no final para link da bio.';
  }

  if (platform === 'Ambas') {
    return 'Formato híbrido: vídeo base 9:16 (20-35s) com versão Reel + TikTok e legenda adaptada.';
  }

  return 'Formato: Reel 9:16, 25-40s, texto na tela com benefício e preço destacado.';
}

function renderQueue() {
  if (!queue.length) {
    queueList.innerHTML = '<li>Fila vazia. Gere conteúdo e adicione itens na fila.</li>';
    return;
  }

  queueList.innerHTML = queue
    .map((item, i) => `<li><strong>${i + 1}. ${item.title}</strong> — ${item.platform} — ${item.when} — <em>${item.status}</em></li>`)
    .join('');
}

document.getElementById('generateVideoPlan').addEventListener('click', () => {
  const state = getState();
  const product = parseProducts(state.productsRaw)[0];

  if (!product) {
    output.textContent = 'Adicione ao menos 1 produto válido para gerar roteiro de vídeo.';
    return;
  }

  const discount = calcDiscount(product.oldPrice, product.newPrice);
  const badge = discount !== null ? `${discount}% OFF` : 'Oferta especial';

  output.textContent = `ROTEIRO DE VÍDEO CURTO (${state.platform})\n` +
    `Perfil: ${state.channelName}\n` +
    `${getPlatformPlan(state.platform)}\n\n` +
    `[Hook 0-3s]\n"${product.name} com ${badge}. Olha isso!"\n\n` +
    `[Cena 1 3-10s]\nMostrar produto + preço antigo riscado: R$${product.oldPrice}\n\n` +
    `[Cena 2 10-20s]\nDestacar benefício principal e preço novo: R$${product.newPrice}\n\n` +
    `[Cena 3 20-30s]\nProva rápida (print/avaliação/uso)\n\n` +
    `[CTA final]\n"Link na bio para pegar essa oferta agora"\n` +
    `Legenda sugerida:\n${captionTemplate(product, state)}`;
});

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

  output.textContent = `COPYS PRONTAS (${state.tone})\nPlataforma: ${state.platform}\n\n${posts}`;
});

document.getElementById('addQueue').addEventListener('click', () => {
  const state = getState();
  const products = parseProducts(state.productsRaw).slice(0, 3);

  if (!products.length) {
    output.textContent = 'Adicione produtos para popular a fila.';
    return;
  }

  const baseSlots = ['Segunda 12h', 'Quarta 19h', 'Sexta 12h'];

  products.forEach((p, i) => {
    queue.push({
      title: `${p.name} (${calcDiscount(p.oldPrice, p.newPrice) ?? 'Oferta'} OFF)`,
      platform: state.platform,
      when: baseSlots[i] || `Extra ${i + 1}`,
      status: 'Pronto para produção',
    });
  });

  renderQueue();
  output.textContent = `${products.length} item(ns) adicionados na fila do agente gestor.`;
});

document.getElementById('advanceQueue').addEventListener('click', () => {
  if (!queue.length) {
    output.textContent = 'Fila vazia. Nada para avançar.';
    return;
  }

  const current = queue.find((item) => item.status !== 'Publicado');

  if (!current) {
    output.textContent = 'Todos os itens da fila já foram publicados.';
    return;
  }

  if (current.status === 'Pronto para produção') {
    current.status = 'Vídeo em edição';
  } else if (current.status === 'Vídeo em edição') {
    current.status = 'Agendado';
  } else {
    current.status = 'Publicado';
  }

  renderQueue();
  output.textContent = `Item atualizado: ${current.title} -> ${current.status}`;
});

document.getElementById('buildSchedule').addEventListener('click', () => {
  const state = getState();

  output.textContent = `AGENDA GERENCIADA — ${state.channelName}\n` +
    `Plataforma: ${state.platform}\n` +
    `Nicho: ${state.niche}\n\n` +
    `Segunda 12h: Vídeo "Oferta principal do dia"\n` +
    `Terça 19h: Story/Bastidor da oferta + prova social\n` +
    `Quarta 12h: Vídeo comparativo (antes/depois do preço)\n` +
    `Quinta 19h: Story com enquete e CTA\n` +
    `Sexta 12h: Vídeo "Top 3 da semana"\n` +
    `Sábado 10h: Oferta relâmpago\n` +
    `Domingo 18h: Resumo da semana + aquecimento para segunda\n\n` +
    `Checklist diário do agente:\n` +
    `1) revisar estoque\n2) validar link afiliado\n3) gerar vídeo curto\n4) aprovar legenda\n5) agendar/publicar`;
});

renderQueue();
