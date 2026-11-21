# Regras Mecânicas — Mitos do Caos RPG

> **Documento de Engenharia Reversa do Sistema**  
> **Fonte Original:** `livro-regras.pdf` (Mitos do Caos RPG — Playtest Fast)  
> **Versão das Regras:** Playtest Fast (Progressão Nível Pessoal 1 a 8; Máximo previsto: 20)

---

## 1. Visão Geral e Filosofia do Sistema

O **Mitos do Caos RPG** é um sistema focado em narrativa, investigação e horror cósmico-mitológico. Suas mecânicas principais substituem os modificadores numéricos fixos tradicionais (+1, +2, +5) por uma **escala de dados de desenvolvimento** ($D4$ a $D12$), dados do Caos ($D8$) que ativam eventos cósmicos de sorte ou desgraça (Mantra e Karma), e uma conexão direta com divindades de diferentes panteões através dos **Caminhos**.

---

## 2. Grau de Desenvolvimento e Conhecimento

No sistema, **não existem pontos numéricos de atributos ou perícias**. Em vez disso, cada atributo e cada perícia possui um **dado associado** que reflete o nível de desenvolvimento pessoal ou conhecimento do personagem.

| Dado | Grau | Descrição Conceitual |
| :---: | :--- | :--- |
| **D4** | **Leigo** | Sem desenvolvimento ou conhecimento prévio. Representa a média humana comum ou inexperiente. |
| **D6** | **Iniciado** | Conhece ou se desenvolveu minimamente; já ouviu falar ou tem treino básico. |
| **D10** | **Competente / Estudado** | Sabe do assunto a fundo, estudou formalmente ou treinou intensamente. |
| **D12** | **Especialista / Ápice** | Especialista consagrado, graduado de elite ou o ápice físico/mental do ser humano. |
| **D8** | **Dado Especial do Caos** | *Não faz parte da distribuição padrão de atributos/perícias*. Reservado para os **Dados do Caos** (Mantra e Karma), apostas com Entidades e rolagens de dano/efeitos específicos. |

> [!NOTE]
> **Conceito de Passo (Step):** Várias habilidades e itens aumentam ou diminuem um atributo ou perícia em **1 passo**. A progressão padrão da escala é:
> $$\text{D4} \longleftrightarrow \text{D6} \longleftrightarrow \text{D10} \longleftrightarrow \text{D12}$$
> *(Algumas criaturas ou bônus específicos utilizam D8 intermediário, mas a trilha humana padrão salta de D6 para D10).*

---

## 3. Atributos Primários

O sistema possui **6 atributos fundamentais**:

1. **Força (FOR):** Define a potência e capacidade física bruta do personagem ($D4$ = compleição frágil; $D12$ = força sobre-humana).
2. **Inteligência (INT):** Genialidade, capacidade analítica e raciocínio lógico ($D4$ = intelecto simplório; $D12$ = intelecto genial). Base para o cálculo de **Sanidade / Equilíbrio**.
3. **Agilidade (AGI):** Reflexos, coordenação motora fina, velocidade de reação e mobilidade ($D4$ = lento/desajeitado; $D12$ = reflexos instantâneos).
4. **Vitalidade (VIT):** Fôlego, saúde imunológica e resistência biológica ($D4$ = vulnerável; $D12$ = vigor inabalável). Base para o cálculo de **Pontos de Vida**.
5. **Aparência (APA):** Magnetismo pessoal, beleza, presença e o quanto atrai a atenção ($D4$ = aspecto perturbador/despercebido; $D12$ = presença irresistível).
6. **Instinto (INS):** Sexto sentido, percepção espacial, física e sensibilidade ao Caos ($D4$ = desatento; $D12$ = percepção extrassensorial).

### Criação de Personagem — Atributos Iniciais
Cada jogador recebe exatamente a seguinte reserva de dados para alocar livremente entre os 6 atributos:
- **$1 \times D10$**
- **$2 \times D6$**
- **$3 \times D4$**

---

## 4. Perícias

O sistema conta com **6 perícias gerais**, projetadas para evitar tabelas poluídas e permitir combinações dinâmicas com qualquer atributo condizente com a narrativa:

1. **Esforço:** Ações de esforço físico ativo (ex.: arrastar, empurrar, saltar, luta corporal). *Serve como perícia de ataque corpo a corpo.*
2. **Mente:** Raciocínio, estudo e dedução (ex.: investigação, tática militar, tecnologia, ocultismo).
3. **Destreza:** Precisão manual e velocidade prática (ex.: dirigir, acrobacia, furtividade, pontaria). *Serve como perícia de ataque à distância/ágil e de esquiva.*
4. **Resistência:** Tolerância corporal e esforço passivo (ex.: prender o fôlego, tolerar dor, fortitude). *Serve como perícia de esquiva / absorção de dano.*
5. **Social:** Interações humanas e persuasão (ex.: enganação, intimidação, diplomacia, acalmar, negociar).
6. **Sentidos:** Percepção sensorial e intuição (ex.: notar pistas, ouvir passos, ler intenções, visão apurada).

### Criação de Personagem — Perícias Iniciais
Cada jogador recebe exatamente a seguinte reserva de dados para alocar livremente entre as 6 perícias:
- **$4 \times D6$**
- **$2 \times D4$**

### Flexibilidade Atributo + Perícia
O mestre define qual combinação de Atributo e Perícia deve ser rolada:
- Intimidar pela força física: $\text{Social} + \text{Força}$
- Intimidar pela perspicácia mental: $\text{Social} + \text{Inteligência}$
- Notar perigo iminente: $\text{Sentidos} + \text{Instinto}$
- Resistir ao horror de um Limiar: $\text{Mente} + \text{Vitalidade}$ ou $\text{Resistência} + \text{Inteligência}$

---

## 5. Sistema de Rolagem de Dados e Testes

### 5.1 A Fórmula Básica do Teste
Em qualquer teste solicitado pelo mestre, o jogador rola o dado de sua perícia, o dado de seu atributo e quaisquer dados de bônus concedidos por habilidades, itens ou runas:

$$\mathbf{\text{Resultado}} = \text{Dado de Perícia} + \text{Dado de Atributo} + \text{Dados de Bônus}$$

- **Critério de Sucesso:** Se $\text{Resultado} \ge \text{DT}$ (Dificuldade do Teste), a ação foi bem-sucedida. Se $\text{Resultado} < \text{DT}$, ocorre falha.
- **Limite Máximo de Dados:** Em qualquer rolagem simultânea, o jogador pode rolar no máximo **5 dados**.

### 5.2 Ocorrência dos Dados do Caos (D8)
O dado $D8$ é exclusivo dos **Dados do Caos** e só entra em jogo em situações especiais que ativam o **Mantra** (positivo) ou o **Karma** (negativo):

1. **Sucesso Crítico:** Dados com faces **iguais** cujo valor de cada face seja **$6$ ou mais** (ex.: dois 6, dois 7, dois 10) $\longrightarrow$ Rola **$1D8$ na Tabela de Mantra**.
2. **Falha Crítica:** Dados com faces **iguais** cujo valor de cada face seja **$5$ ou menos** (ex.: dois 1, dois 3, dois 4) $\longrightarrow$ Rola **$1D8$ na Tabela de Karma**.
3. **Evento Caótico Mântrico:** Quando a **soma total de todos os dados for exatamente igual a $8$**, e o resultado **superar a DT** (passar no teste) $\longrightarrow$ Rola **$1D8$ na Tabela de Mantra**.
4. **Evento Caótico Kármico:** Quando a **soma total de todos os dados for exatamente igual a $8$**, mas o resultado **for inferior à DT** (falhar no teste) $\longrightarrow$ Rola **$1D8$ na Tabela de Karma**.

### 5.3 Influência do Karma Atual
O estado geral do personagem no continuum do Caos é registrado na ficha como **Karma Atual**:
- **Neutro (Padrão):** Os gatilhos de Mantra e Karma seguem as regras normais acima.
- **Positivo (+):** Toda vez que um Dado do Caos for ativado na cena, ele se converte automaticamente em **Mantra**, ignorando desastres.
- **Negativo (-):** Toda vez que um Dado do Caos for ativado na cena, ele se converte automaticamente em **Karma**, forçando efeitos adversos.

---

## 6. Tabelas dos Dados do Caos (D8)

No início de cada sessão, o mestre rola $1D4$ para sortear qual das tabelas de Mantra e Karma estará ativa naquela sessão (o Playtest Fast contém 2 tabelas para cada):

### Tabelas de Mantra (Efeitos Benéficos)

| Face D8 | Tabela 1 de Mantra | Tabela 2 de Mantra |
| :---: | :--- | :--- |
| **1** | Todos os aliados recebem $+2$ pontos de Akasha. | Aumenta uma perícia à escolha em $1$ passo durante uma cena. |
| **2** | O personagem recebe uma ação adicional imediata. | Aumenta um atributo à escolha em $1$ passo durante uma cena. |
| **3** | Recupera $1D8$ de Pontos de Vida. | Remove imediatamente o efeito negativo de um Limiar ativo. |
| **4** | O próximo ataque elemental causa o dobro de dano. | Pode utilizar um ponto de Akasha sem gastar o recurso. |
| **5** | A próxima Habilidade de Caminho (HC) não tem custo. | Recupera $1D8$ de Sanidade (Equilíbrio). |
| **6** | Abre um atalho no espaço-tempo para um local conhecido. | Recebe uma **Moeda da Sorte** (sucesso automático no próximo teste fora de combate). |
| **7** | Os próximos $3$ testes do personagem rodam com $+1$ passo acima. | Invoca um Servo auxiliar que ajuda o grupo durante a cena. |
| **8** | O mestre realiza uma intervenção narrativa benigna e condizente. | Ganha $+1$ **Ponto de Caos** permanente para sua reserva. |

### Tabelas de Karma (Efeitos Maléficos)

| Face D8 | Tabela 1 de Karma | Tabela 2 de Karma |
| :---: | :--- | :--- |
| **1** | Todos os aliados perdem $-2$ pontos de Akasha. | Diminui uma perícia em $1$ passo até o fim da cena. |
| **2** | O personagem fica atordoado e não pode agir nesta rodada. | Diminui um atributo em $1$ passo até o fim da cena. |
| **3** | Perde $1D8$ de Pontos de Vida. | Fica incapacitado de ser curado do efeito negativo de limiar. |
| **4** | O próximo ataque elemental ricocheteia e atinge o usuário. | O próximo custo de Akasha é dobrado. |
| **5** | A próxima Habilidade de Caminho tem seu custo dobrado. | Perde $1D8$ de Sanidade (Equilíbrio). |
| **6** | Cai em um vórtice dimensional e fica $1$ rodada desaparecido. | Recebe uma **Moeda do Azar** (falha automática no próximo teste fora de combate). |
| **7** | Os próximos $3$ testes rodam com $-1$ passo abaixo. | Um monstro *Demonomicron* se manifesta imediatamente na cena. |
| **8** | O próximo crítico obtido por qualquer jogador torna-se um desastre. | Perde imediatamente $1$ Ponto de Caos de sua reserva. |

---

## 7. Apostas com o Caos (Pontos de Caos)

- Todo personagem inicia sua jornada com exatamente **$1$ Ponto de Caos**.
- **A Runa da Alma Dakani** é a única forma conhecida no playtest de obter um segundo ponto permanente.
- **O Desejo Primordial:** O jogador pode consumir seu Ponto de Caos para desafiar *O Apostador / Entidade Primordial*:
  - O jogador rola **$8D8$** contra **$8D8$ do Mestre**.
  - **Vitória do Jogador:** Seu desejo narrativo ou efeito pretendido se realiza plenamente.
  - **Vitória do Mestre:** O personagem perde **$8$ pontos de Sanidade (Equilíbrio)** e rola imediatamente $1D8$ na Tabela de Karma.
  - Pontos de Caos gastos só são restabelecidos ao término completo de uma missão.

---

## 8. Fórmulas Matemáticas dos Status Vitais

### 8.1 Variáveis Base dos Atributos
Para o cálculo dos status, utilize o valor numérico da face máxima e da metade da face do dado alocado em Vitalidade e Inteligência:

| Dado de Atributo | Face Máxima ($\text{Max}$) | Metade do Dado ($\text{Half} = \frac{\text{Max}}{2}$) |
| :---: | :---: | :---: |
| **D4** | 4 | 2 |
| **D6** | 6 | 3 |
| **D10** | 10 | 5 |
| **D12** | 12 | 6 |

---

### 8.2 Pontos de Vida (Vida Máxima)

A Vida Máxima depende da **Atuação**, do **Nível Pessoal ($N$)** e do dado de **Vitalidade (VIT)**:

$$\mathbf{\text{Vida Máxima}} = \text{Vida Inicial} + (N - 1) \times \text{Vida por Nível}$$

| Atuação | Vida Inicial (Nv 1) | Vida Adicional por Nível ($N \ge 2$) | Fórmula Completa no Nível $N$ |
| :--- | :---: | :---: | :--- |
| **Célere** | $12 + \text{VIT}_{\text{Max}}$ | $4 + \text{VIT}_{\text{Half}}$ | $(12 + \text{VIT}_{\text{Max}}) + (N - 1)(4 + \text{VIT}_{\text{Half}})$ |
| **Idealizador** | $8 + \text{VIT}_{\text{Max}}$ | $2 + \text{VIT}_{\text{Half}}$ | $(8 + \text{VIT}_{\text{Max}}) + (N - 1)(2 + \text{VIT}_{\text{Half}})$ |
| **Pilar** | $10 + \text{VIT}_{\text{Max}}$ | $3 + \text{VIT}_{\text{Half}}$ | $(10 + \text{VIT}_{\text{Max}}) + (N - 1)(3 + \text{VIT}_{\text{Half}})$ |
| **Apostador** | $8 + \text{VIT}_{\text{Max}}$ | $2 + \text{VIT}_{\text{Half}}$ | $(8 + \text{VIT}_{\text{Max}}) + (N - 1)(2 + \text{VIT}_{\text{Half}})$ |
| **Versado** | $10 + \text{VIT}_{\text{Max}}$ | $3 + \text{VIT}_{\text{Half}}$ | $(10 + \text{VIT}_{\text{Max}}) + (N - 1)(3 + \text{VIT}_{\text{Half}})$ |

*Bônus Adicionais:* A Runa *Heiwaz* (Corpo/Terra) concede $+10$ de Vida Máxima. Itens de Suporte defensivos concedem $+5$ de Vida.

---

### 8.3 Pontos de Equilíbrio / Sanidade (Sanidade Máxima)

A Sanidade (rotulada na ficha como **SANIDADE** e no livro como **EQUILÍBRIO**) reflete a estabilidade mental e psíquica. Ela depende da **Atuação**, do **Nível Pessoal ($N$)** e do dado de **Inteligência (INT)**:

$$\mathbf{\text{Sanidade Máxima}} = \text{Sanidade Inicial} + (N - 1) \times \text{Sanidade por Nível}$$

| Atuação | Sanidade Inicial (Nv 1) | Sanidade Adicional por Nível ($N \ge 2$) | Fórmula Completa no Nível $N$ |
| :--- | :---: | :---: | :--- |
| **Célere** | $8 + \text{INT}_{\text{Max}}$ | $2 + \text{INT}_{\text{Half}}$ | $(8 + \text{INT}_{\text{Max}}) + (N - 1)(2 + \text{INT}_{\text{Half}})$ |
| **Idealizador** | $12 + \text{INT}_{\text{Max}}$ | $4 + \text{INT}_{\text{Half}}$ | $(12 + \text{INT}_{\text{Max}}) + (N - 1)(4 + \text{INT}_{\text{Half}})$ |
| **Pilar** | $10 + \text{INT}_{\text{Max}}$ | $3 + \text{INT}_{\text{Half}}$ | $(10 + \text{INT}_{\text{Max}}) + (N - 1)(3 + \text{INT}_{\text{Half}})$ |
| **Apostador** | $8 + \text{INT}_{\text{Max}}$ | $2 + \text{INT}_{\text{Half}}$ | $(8 + \text{INT}_{\text{Max}}) + (N - 1)(2 + \text{INT}_{\text{Half}})$ |
| **Versado** | $10 + \text{INT}_{\text{Max}}$ | $3 + \text{INT}_{\text{Half}}$ | $(10 + \text{INT}_{\text{Max}}) + (N - 1)(3 + \text{INT}_{\text{Half}})$ |

*Bônus Adicionais:* A Runa *Algiz* (Mente/Terra) concede $+10$ de Sanidade Máxima. Itens de Suporte mentais concedem $+5$ de Sanidade.

---

### 8.4 Pontos de Akasha
- **Conceito:** Recurso cósmico de compartilhamento. Permite gastar $1$ ponto para utilizar o Grau de Desenvolvimento (atributo) ou Conhecimento (perícia) de um aliado presente na cena.
- **Reserva Inicial:** $2$ pontos no Nível 1.
- **Evolução por Nível:**
  - *Regra Geral do Texto:* Ganha $+1$ ponto a cada nível ímpar:
    $$\text{Akasha Base} = 2 + \left\lfloor \frac{N - 1}{2} \right\rfloor$$
    *(Nv 1 = 2; Nv 3 = 3; Nv 5 = 4; Nv 7 = 5).*
  - *Tabela de Níveis (Playtest):* Concede pontos nos níveis pares (2, 4, 6, 8). Ambas convergem para $+1$ ponto a cada 2 níveis.
- **Modificadores de Runa:** A Runa *Thaan* (Alma/Terra) adiciona $+2$ pontos de Akasha à reserva máxima.

---

### 8.5 Defesa e Esquiva

O sistema possui duas frentes de defesa:
1. **Esquiva Ativa (Jogadores):** Em resposta a ataques, o personagem realiza um teste de **Destreza** ou **Resistência** somado à **Agilidade** ou **Vitalidade**. Se o resultado superar o ataque do oponente, o dano é evitado.
   - A Runa *Isa* (Corpo/Água) concede bônus fixo de **$+1D4$ na Esquiva**.
2. **Defesa Passiva (Criaturas / Dificuldade de Acerto):** Criaturas caóticas possuem um atributo fixo de **Defesa** que determina a DT para que ataques dos jogadores acertem:
   - *Demonomicron:* Defesa $7$ (ND 10).
   - *Loira do Banheiro:* Defesa $10$ (ND 20).
   - *A Sombra:* Defesa $13$ (ND 40).

---

## 9. Classes (Atuações)

As **Atuações** substituem as classes clássicas de fantasia e definem o papel táctico e os poderes inatos do personagem:

### 1. Célere
- **Perfil:** Prontidão máxima, combatente ágil e intervencionista.
- **Habilidade Inata — *Intervir*:** Uma vez por cena, ganha um turno adicional logo no início da iniciativa do combate. Nesse turno extra, seus ataques recebem **$+1D6$ de dano**.

### 2. Pilar
- **Perfil:** Suporte protetor, canalizador de energia para os aliados.
- **Habilidade Inata — *Vínculo*:** Se um aliado gastar $1$ ponto de Akasha para usar o atributo ou perícia do Pilar, o dado compartilhado **aumenta em $1$ passo**. Limitado a 1 aliado por cena.

### 3. Idealizador
- **Perfil:** Estrategista, analista e focado em aprender com os erros.
- **Habilidade Inata — *Estoque*:** A cada teste em que falhar, pode acumular **$1D6$** de reserva de dados. Pode acumular no máximo até **$4D6$** e gastá-los em rolagens futuras.

### 4. Apostador
- **Perfil:** Caótico, oportunista e manipulador de probabilidades.
- **Habilidade Inata — *Roleta*:** Uma vez por cena, pode converter $1$ Dado do Caos rolado de Karma para Mantra, ou de Mantra para Karma, preservando o número que caiu na face do $D8$.

### 5. Versado
- **Perfil:** Pesquisador acadêmico do Caos, mestre em invocações e servos.
- **Habilidade Inata — *Companhia*:** Começa o jogo com um **Servo Estável** já criado, podendo convocá-lo para a cena como ação livre.

---

## 10. Mitologias, Caminhos e Habilidades

O universo possui 8 mitologias divinas: Nórdica, Egípcia, Grega, Japonesa, Mesopotâmica, Tupi, Hindu e Asteca. No Playtest Fast, estão detalhadas 4 mitologias com seus respectivos Caminhos e habilidades de nível 2, 5 e 8:

### 10.1 Mitologia Nórdica

#### Caminho de Loki (Trapaça)
- **Elementos:** $\text{Ar} + \text{Éter} = \textbf{Ilusão}$
- **Nv 2 — *Trollei*:** Ao receber um ataque, gasta uma reação para substituir seu corpo por uma réplica e teleportar-se para qualquer espaço livre a até $6$ metros.
- **Nv 5 — *Transformar*:** Assume a aparência e aspectos biológicos exatos de qualquer ser vivo já visto. Enquanto transformado, seu dado de **Social aumenta em $1$ passo**.
- **Nv 8 — *Manipular*:** Implanta falsas memórias em um alvo. O alvo deve passar em um teste de Mente contra o Social do personagem para não aceitar a mentira como verdade absoluta.
- **Nv 8 — *Ilusão*:** Projeta ilusões intangíveis complexas. Aumenta em **$1$ passo** o dado da perícia para a qual a ilusão foi projetada.

#### Caminho de Freya (Natureza)
- **Elementos:** $\text{Terra} + \text{Água} = \textbf{Natureza}$
- **Nv 2 — *Restaurar*:** Manifesta borboletas douradas que curam aliados com base no Dado Alto da rolagem. Pode curar até $2$ aliados por rodada.
- **Nv 5 — *Ai Meu Pé*:** Brota vinhas espinhosas no solo: reduzem o deslocamento dos inimigos em $2$ metros, diminuem a **Destreza do alvo em $1$ passo** e causam **$1D6$ de dano** toda vez que o alvo se move.
- **Nv 8 — *Berço de Flores*:** Cria um jardim místico de $3$ metros de raio; aliados na área regeneram vida com base no Dado Alto a cada rodada.
- **Nv 8 — *Semente da Vontade*:** Implanta uma semente parasita em um inimigo. A cada rodada, drena vida com base no Dado Alto de Mente. Ao acumular 15/25/35 de vida drenada (broto, botão e flor), o dano do usuário recebe **$+1D4$**.

#### Caminho de Thor (Proteção)
- **Elementos:** $\text{Fogo} + \text{Ar} = \textbf{Raio}$
- **Nv 2 — *Reposicionar*:** Transforma-se em um relâmpago veloz e intercepta um ataque direcionado a um aliado, assumindo a defesa.
- **Nv 5 — *Corpo Estático*:** Envolve o corpo em eletricidade; sua perícia **Resistência aumenta em $1$ passo** durante toda a cena.
- **Nv 8 — *Querida, eu trouxe proteção*:** Permite que todos os aliados adjacentes aumentem sua Destreza ou sua Resistência em **$1$ passo**.
- **Nv 8 — *Arma Vinculada*:** Magnetiza uma arma pessoal. Somente o usuário pode empunhá-la (outros devem passar em Resistência contra o triplo da Resistência do usuário). Pode ser arremessada e chamada de volta, aplicando um segundo ataque na volta. Dura uma cena.

#### Caminho de Hela (Submundo / Morte)
- **Elementos:** $\text{Fogo} + \text{Terra} = \textbf{Alma}$
- **Nv 2 — *Absorver*:** Ao acertar um ataque, recupera em Pontos de Vida metade de todo o dano causado.
- **Nv 5 — *Intimidação Espectral*:** Ao intimidar alguém, seu dado de Social aumenta em **$1$ passo**.
- **Nv 8 — *Coleta de Essências*:** A cada oponente morto, coleta sua essência (máximo $3$ essências acumuladas). Cada essência concede **$+2$ de dano** em ataques futuros.
- **Nv 8 — *Quando o relógio bate a uma*:** Consome $1$ essência para erguer dos mortos um oponente derrotado. Ele luta ao lado do personagem até o encerramento da cena (máximo 1 ser revivido por vez).

---

### 10.2 Mitologia Egípcia

#### Caminho de Seth (Deserto)
- **Elementos:** $\text{Ar} + \text{Terra} = \textbf{Areia}$
- **Nv 2 — *Barragem*:** Ergue uma muralha de areia que bloqueia dano igual ao Dado Alto de Destreza; se arremessada contra um alvo, causa dano igual ao Dado Baixo de Destreza.
- **Nv 5 — *Imagina se pega na vista*:** Tempestade de areia em um raio de $3$ metros. Inimigos no interior ficam com visão turva e têm suas perícias de ataque reduzidas em **$1$ passo**.
- **Nv 8 — *Oásis*:** Área de $3$ metros onde aliados recebem **$+1$ passo em Destreza** e **$+2$ metros de deslocamento**.
- **Nv 8 — *Agulhas do Rei*:** Chuva de agulhas de areia. Causa dano igual a **$2 \times \text{Dado Alto}$** e aplica a condição *Sangrando*.

#### Caminho de Anúbis (Morte)
- **Elementos:** $\text{Éter} + \text{Terra} = \textbf{Cinzas}$
- **Nv 2 — *Sombra de Cinzas*:** Cria uma cópia sombria feita de fuligem que replica a ação do personagem, garantindo um ataque extra imediato.
- **Nv 5 — *Força Mórbida*:** Quando o personagem estiver com $4$ Pontos de Vida ou menos, suas perícias de ataque aumentam em **$1$ passo**.
- **Nv 8 — *Zona Morta*:** Campo de cinzas de $3$ metros de raio; inflige dano contínuo a todas as criaturas hostis igual a metade do Dado Alto da perícia de ataque.
- **Nv 8 — *Morri!*:** Ao atingir $0$ Pontos de Vida, revive instantaneamente com $4$ Pontos de Vida e invoca uma *Sombra de Cinzas* sem custo adicional.

#### Caminho de Rá (Sol)
- **Elementos:** $\text{Éter} + \text{Fogo} = \textbf{Sol}$
- **Nv 2 — *Filho do Sol*:** Sob a luz do sol, o personagem ganha vitalidade radiante: sua vida atual é acrescida de um valor igual ao dobro de sua Vida Máxima (apenas de dia).
- **Nv 5 — *Tá pegando fogo, bicho!*:** Incendeia punhos ou lâminas, aumentando a perícia de ataque em **$1$ passo** (apenas de dia).
- **Nv 8 — *Irradiar*:** Concede aura curativa: aliados adjacentes recebem metade da vida máxima do usuário como cura imediata (apenas de dia).
- **Nv 8 — *O Sol*:** Conjura um sol artificial que causa dano igual ao dobro do Dado Alto de ataque. Se usado durante a noite, permite que todas as demais habilidades solares funcionem livremente.

---

### 10.3 Mitologia Grega

#### Caminho de Apolo (Luz)
- **Elementos:** $\text{Fogo} + \text{Éter} = \textbf{Luz}$ *(Divergência Elemental de Rá)*
- **Nv 2 — *Flashbang!*:** Clarão ofuscante que paralisa completamente um alvo por $1$ rodada inteira.
- **Nv 5 — *Estrela Cadente*:** Destreza do personagem aumenta em **$1$ passo**. Se acertar um ataque, reduz a perícia de **Sentidos do oponente em $1$ passo**.
- **Nv 8 — *Refração*:** Desvia as ondas luminosas ao redor do corpo para ficar completamente invisível por $1$ turno (detectável apenas por sentidos mágicos).
- **Nv 8 — *Super Nova*:** Canaliza poder por $1$ rodada e explode em radiação estelar, causando o **dobro do Dado de Ataque** como dano em área.

#### Caminho de Ares (Guerra)
- **Elementos:** $\text{Terra} + \text{Fogo} = \textbf{Metal}$
- **Nv 2 — *Pega na minha espada*:** Forja instantaneamente até $4$ armas à sua escolha; cada arma criada causa **$+1D6$ de dano adicional**.
- **Nv 5 — *Sentidos Aguçados*:** Em combate, pode rolar a perícia Sentidos combinada com Destreza, com bônus de **$+1$ passo**.
- **Nv 8 — *Grito Inspirador*:** Brado de guerra que purga todos os debuffs e penalidades do usuário e de aliados em um raio de $3$ metros.
- **Nv 8 — *Chama Incontrolável*:** Ao cair a $0$ de Vida, recusa-se a cair: permanece de pé em estado de fúria, com $+1$ passo no dado de ataque e dano com armas forjadas baseado no Dado Alto, perdendo $2$ pontos de Sanidade por rodada.

#### Caminho de Athena (Sabedoria / Estratégia)
- **Elementos:** $\text{Éter} + \text{Ar} = \textbf{Sabedoria}$
- **Nv 2 — *Coruja de Espionagem*:** Em investigações, envia um servo coruja etéreo até um ponto de interesse para resgatar a informação sem necessidade de rolagem.
- **Nv 5 — *Discernimento Tático*:** Pode elevar qualquer perícia à sua escolha em **$+1$ passo**.
- **Nv 8 — *Comando da Coruja*:** O servo coruja concede a um aliado a escolha entre **$+1$ passo em uma perícia** ou **$1$ ação adicional no turno**.
- **Nv 8 — *Ápice da Sabedoria*:** Conhecimento absoluto que aumenta **todas as perícias em $+1$ passo** e **dobra o dano de seus ataques**.

---

### 10.4 Mitologia Japonesa

#### Caminho de Tsukuyomi (Lua)
- **Elementos:** $\text{Terra} + \text{Ar} = \textbf{Lua}$
- **Nv 2 — *Seguidor da Lua*:** Em ambientes escuros ou na penumbra, recebe bônus de **$+1D6$** em todas as suas rolagens.
- **Nv 5 — *Brilha, brilha, estrelinha*:** Névoa estrelada que induz torpor hipnótico no oponente, diminuindo seu dado de ataque em **$1$ passo**.
- **Nv 8 — *Visão Espiritual*:** Conexão direta com o plano espiritual que revela os pontos fracos do inimigo, aplicando bônus crítico ao dado de ataque.
- **Nv 8 — *Lua Obscura*:** Invoca uma minilua sombria que absorve a iluminação local e reduz a DT de todos os testes de aliados no raio da área.

#### Caminho de Susanoo (Tempestade)
- **Elementos:** $\text{Água} + \text{Ar} = \textbf{Tempestade}$
- **Nv 2 — *Passando mais uma marcha*:** Velocidade sobre-humana que garante **$1$ ação bônus** livre em combate.
- **Nv 5 — *Precipitar das Almas*:** Chuva mística que acelera os movimentos do usuário, aumentando seu dado de **Destreza em $1$ passo**.
- **Nv 8 — *Chuva de Lâminas*:** Lâminas de raio em uma área de $6$ metros. Aplica dano e a condição *Eletrocutado* ($1D6$ de dano por turno).
- **Nv 8 — *Descarregar*:** Canaliza energia por uma ação completa para descarregar um raio monumental no próximo turno, imobilizando e eletrocutando todos os alvos.

#### Caminho de Kannon (Misericórdia)
- **Elementos:** $\text{Éter} + \text{Água} = \textbf{Misericórdia}$
- **Nv 2 — *Alívio do Sofrimento*:** Água pura que cura ferimentos de um aliado e regenera **$1$ ponto de Sanidade (Equilíbrio)**.
- **Nv 5 — *Ouvir Clamor*:** Ao presenciar um aliado ferido, cria um campo de proteção que aumenta os dados de defesa de todos no alcance.

---

## 11. Elementos e Divergência Elemental

Todo personagem domina exatamente **três elementos**:
1. **Elemento Base 1** (Fogo, Água, Ar, Terra ou Éter)
2. **Elemento Base 2** (Fogo, Água, Ar, Terra ou Éter)
3. **Elemento de Fusão (Elemento 3):** A união sinérgica concedida pelo Deus patrono.

### Tabela de Fusões Elementais Catalogadas

| Elemento 1 | Elemento 2 | Elemento de Fusão | Divindade Patronal |
| :---: | :---: | :---: | :--- |
| **Ar** | **Éter** | **Ilusão** | Loki (Nórdica) |
| **Terra** | **Água** | **Natureza** | Freya (Nórdica) |
| **Fogo** | **Ar** | **Raio** | Thor (Nórdica) |
| **Fogo** | **Terra** | **Alma** | Hela (Nórdica) |
| **Ar** | **Terra** | **Areia** | Seth (Egípcia) |
| **Éter** | **Terra** | **Cinzas** | Anúbis (Egípcia) |
| **Éter** | **Fogo** | **Sol** | Rá (Egípcia) |
| **Fogo** | **Éter** | **Luz** | Apolo (Grega) *(Divergência de Rá)* |
| **Terra** | **Fogo** | **Metal** | Ares (Grega) |
| **Éter** | **Ar** | **Sabedoria** | Athena (Grega) |
| **Terra** | **Ar** | **Lua** | Tsukuyomi (Japonesa) |
| **Água** | **Ar** | **Tempestade** | Susanoo (Japonesa) |
| **Éter** | **Água** | **Misericórdia** | Kannon (Japonesa) |

> [!TIP]
> **Divergência Elemental:** Note que Rá e Apolo utilizam os mesmos elementos base (Fogo e Éter), mas em ordem e aspectos inversos: Rá gera o astro em si (**Sol**), enquanto Apolo emana a emanação brilhante do astro (**Luz**).

---

## 12. Nível de Mão: Gênesis vs. Terminus

Além do Nível Pessoal, o personagem desenvolve o seu **Nível de Mão**, alinhando-se com a Mão Direita (**Gênesis**, ordem mântrica) ou com a Mão Esquerda (**Terminus**, caos kármico):
- **Limite Total de Níveis:** Máximo de $5$ níveis combinados entre ambas as mãos (no Playtest Fast, disponíveis até o nível II).
- **Regra de Bloqueio Mútuo:** Progredir em uma mão bloqueia o ápice da outra:
  - Adquirir **Nível I em Terminus** bloqueia permanentemente o **Nível V de Gênesis**.
  - Adquirir **Nível I em Gênesis** bloqueia permanentemente o **Nível V de Terminus**.
  - Adquirir **Nível II em Terminus** bloqueia permanentemente o **Nível IV de Gênesis**.
  - Adquirir **Nível II em Gênesis** bloqueia permanentemente o **Nível IV de Terminus**.

### Efeitos Mecânicos dos Níveis de Mão

| Mão | Nível | Efeito Mecânico Primário | Penalidade / Efeito Colateral |
| :--- | :---: | :--- | :--- |
| **Terminus** | **I** | **Aumento de Desenvolvimento:** $+1$ passo em atributo/perícia. Quando rolar Karma, o resultado na tabela será sempre **$1$ a menos** do que o rolado no D8. | Bloqueia Nível V de Gênesis. |
| **Terminus** | **II** | Uma vez por cena, um resultado negativo tem seu efeito invertido para benéfico. | O número 8 do Mantra passa a ter efeito negativo. Bloqueia Nível IV de Gênesis. |
| **Gênesis** | **I** | **Aumento de Desenvolvimento:** $+1$ passo em atributo/perícia. Quando rolar Mantra, o resultado na tabela será sempre **$1$ a mais** do que o rolado no D8. | Bloqueia Nível V de Terminus. |
| **Gênesis** | **II** | Uma vez por cena, pode rerrolar um dado de Mantra. | O número 8 do Karma tem efeito dobrado. Bloqueia Nível IV de Terminus. |

---

## 13. Fragmentos de Runa

As runas equilibram fraquezas dos personagens. São divididas em **3 Categorias** (Corpo, Mente e Alma) e **5 Elementos**:
- **Regra de Equipamento:** Um personagem pode equipar **no máximo 1 runa de cada categoria** simultaneamente (máx. 3 runas equipadas).

| Elemento | Categoria: CORPO | Categoria: MENTE | Categoria: ALMA |
| :--- | :--- | :--- | :--- |
| **FOGO** | **Cweorth:** $+1D4$ de Dano em todos os ataques. | **Kaunan:** Aumenta a perícia Mente em $+1$ passo. | **Liwaen:** Ao rolar um dado de Karma, o oponente também é afetado pelo efeito. |
| **ÁGUA** | **Isa:** $+1D4$ na Esquiva. | **Thurisaz:** $+1D4$ em testes de Investigação. | **Kaegos:** O bônus concedido pelo gasto de Akasha dura duas cenas completas. |
| **AR** | **Ehwaz:** Concede $1$ ataque adicional por rodada. | **Eihwaz:** Permite investigar dois locais de uma só vez com um único resultado. | **Abanen:** Ao fim de uma cena, recupera $1$ ponto de Akasha até o limite. |
| **TERRA** | **Heiwaz:** $+10$ de Pontos de Vida Máxima. | **Algiz:** $+10$ de Sanidade (Equilíbrio) Máxima. | **Thaan:** $+2$ Pontos de Akasha na reserva máxima. |
| **ÉTER** | **Ac:** Pode gastar $1$ Ponto de Caos para aplicar a soma máxima dos dados de dano. | **Dagaz:** Uma vez por cena, pode aplicar o resultado obtido por um aliado em sua própria ação. | **Dakani:** Concede $+1$ **Ponto de Caos** extra permanente para a ficha. |

---

## 14. Tabela de Evolução do Nível Pessoal

A progressão do personagem no Playtest Fast abrange do **Nível 1 ao Nível 8**:

| Nível Pessoal | Ganhos e Desbloqueios Mecânicos |
| :---: | :--- |
| **1** | Escolha de Atuação; Habilidade Inata de Atuação; Reserva inicial de $2$ pontos de Akasha; $1$ Ponto de Caos inicial. |
| **2** | Escolha de Caminho patronal; Desbloqueio da Habilidade de Caminho de Nível 2; $+1$ ponto de Akasha. |
| **3** | Segunda Habilidade de Atuação (ou aprofundamento de classe). |
| **4** | $+1$ Nível de Mão (escolha entre Terminus I ou Gênesis I); $+1$ ponto de Akasha. |
| **5** | Desbloqueio da Habilidade de Caminho de Nível 5; $+1$ Grau de Conhecimento ($+1$ passo permanente em uma perícia). |
| **6** | Terceira Habilidade de Atuação; $+1$ ponto de Akasha. |
| **7** | Desbloqueio de Fragmento de Runa (capacidade de sintonizar runas avançadas). |
| **8** | $+1$ Nível de Mão (segundo nível de mão); Desbloqueio de $2$ Habilidades de Caminho de Nível 8; $+1$ ponto de Akasha. |

### Tabela de Pontos de Experiência (XP)

| Ação Realizada em Sessão | XP Adquirida |
| :--- | :---: |
| Interagir com NPC relevante | $5$ |
| Investigar local ou cena | $5$ |
| Participar de Batalha | $5$ |
| Descobrir Informação relevante | $10$ |
| Achar Pista crucial | $10$ |
| Derrotar Criatura Caótica | $10$ |
| Ajudar Aliado em perigo | $10$ |
| Destaque de Interpretação / Roleplay | $100$ |
| Concluir Missão completa | $200$ |

---

## 15. Inventário e Equipamento

O sistema categoriza itens em $4$ classes estruturadas:

| Tipo de Item | Efeito Mecânico | Peso | Custo / Valor |
| :--- | :--- | :---: | :---: |
| **Arma** | Aumenta a perícia de ataque em **$+1$ passo** e adiciona **$+1$ ao dano**. | $1$ a $4$ | Sob construção na lore |
| **Item Suporte** | Concede **$+5$ em Vida Máxima**, **$+5$ em Sanidade Máxima** ou **$+1D4$ de Dano**. | $1$ | Sob construção na lore |
| **Documentos** | Dossiês, laudos e cartas de investigação. Sem bônus numérico direto. | $0$ (Sem peso) | Não custa |
| **Besteirol** | Itens estéticos, souvenirs e itens de pura caracterização (*skins*). | $0$ (Sem peso) | Não custa |

- **Equipamento Inicial:** Todo personagem recém-criado começa com exatamente:
  - **$1$ Arma** (à escolha do conceito narrativo);
  - **$1$ Item Suporte** (à escolha entre vida, sanidade ou dano);
  - Quantos itens da categoria **Besteirol** desejar.

---

## 16. Cenas, Limiares e Horrores Caóticos

### Tipos de Cena e Ações Previstas
1. **Interlúdio:** Recuperação e gnose (Ações: Descansar, Meditar/Gnose, Ler).
2. **Combate:** Confronto físico (Ações: Atacar, Flanquear, Fintar, Bloquear, Esquivar).
3. **Investigação:** Coleta de evidências (Ações: Procurar, Investigar, Analisar pistas, Interagir).
4. **Perseguição:** Fuga e mobilidade (Ações: Atalho, Fugir, Fintar, Sacrificar).
5. **Furtividade:** Ocultamento (Ações: Distrair, Esconder, Travar respiração).
6. **Social:** Interação interpessoal (Ações: Interrogar, Acalmar, Flertar, Enganar).

### Limiares e Efeitos Mentais
Criaturas caóticas manifestam **Limiares** que quebram o espaço-tempo. Ao adentrar um limiar, todos os personagens devem realizar um teste de resistência:
- **Sucesso no Teste:** Sofre apenas metade do dano de Sanidade (Equilíbrio).
- **Falha no Teste:** Sofre o dano de Sanidade integral e contrai um **Efeito de Limiar**:
  - **Medo (Demonomicron):** Pavor paralisante, assusta-se com qualquer estímulo.
  - **Melancolia / Chorão (Loira do Banheiro):** Crise de choro incontrolável e desalento profundo.
  - **Amnésia (A Sombra):** O personagem esquece a missão, quem são seus companheiros e uma de suas habilidades de Caminho.
  - *Cura do Efeito:* Um aliado não afetado pode remover o efeito com um teste de **Social DT 12**.

### Alucinações
Dentro de limiares, os afetados podem sofrer alucinações classificadas por um teste de **$1D8$**:
- **Face 1 — Simples:** Alterações mínimas na realidade (folha com cor diferente, moeda antiga). Alívio cômico, impacto mecânico quase nulo.
- **Faces 2 a 7 — Normal:** Móveis, armas e vestimentas mudam de aspecto. Consequência: perda imediata de pontos de Sanidade.
- **Face 8 — Complexa:** Distorção sensorial grave. Aliados são vistos como monstros atacando e vice-versa. Desencadeia fogo amigo e consequências críticas.
