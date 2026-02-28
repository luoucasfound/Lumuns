const output = document.getElementById('output');
const styleDB = document.getElementById('styleDB');

const getState = () => ({
  theme: document.getElementById('theme').value,
  type: document.getElementById('episodeType').value,
  duration: document.getElementById('duration').value,
  palette: document.getElementById('palette').value,
  voice: document.getElementById('voice').value,
  music: document.getElementById('music').value,
});

const db = [];

function renderDB() {
  styleDB.innerHTML = db
    .map(
      (item, i) =>
        `<li><strong>Preset ${i + 1}</strong>: ${item.palette}, ${item.voice}, trilha ${item.music}/10 (${item.type})</li>`,
    )
    .join('');
}

document.getElementById('saveStyle').addEventListener('click', () => {
  const state = getState();
  db.push({
    palette: state.palette,
    voice: state.voice,
    music: state.music,
    type: state.type,
  });
  renderDB();
  output.textContent = `Preset salvo com sucesso.\nTotal de presets: ${db.length}.\nEste dado simula o banco de consistência editorial.`;
});

document.getElementById('generateScript').addEventListener('click', () => {
  const s = getState();
  output.textContent = `ROTEIRO IA — ${s.theme}\n\n[Hook 0:00-0:30]\nUma pergunta provocativa para abrir o episódio.\n\n[Ato 1]\nContexto histórico, personagens-chave e linha do tempo.\n\n[Ato 2]\nConflito central e evidências documentais.\n\n[Clímax]\nPonto de virada com maior tensão narrativa.\n\n[Fechamento]\nSíntese e reflexão final.\n\nFormato: ${s.type} • Duração alvo: ${s.duration}`;
});

document.getElementById('generateNarration').addEventListener('click', () => {
  const s = getState();
  output.textContent = `NARRAÇÃO IA\n\nVoz selecionada: ${s.voice}\nPacing: pausado com ênfases dramáticas\nPronúncia guiada: nomes históricos e locais\n\nExemplo:\n"No auge de seu poder, Roma parecia invencível... mas toda grande estrutura carrega em si as sementes da própria queda."`;
});

document.getElementById('autoCut').addEventListener('click', () => {
  const s = getState();
  output.textContent = `ROUGH CUT AUTOMÁTICO\n\n✓ timeline base criada\n✓ marcadores por bloco narrativo\n✓ pan/zoom inteligente em imagens estáticas\n✓ trilha documental com intensidade ${s.music}/10\n✓ transições suaves e legendas iniciais\n\nPróximo passo: revisão manual fina na timeline.`;
});
