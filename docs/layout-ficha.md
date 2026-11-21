# Layout e Engenharia Visual da Ficha — Mitos do Caos RPG

> **Documento de Engenharia Reversa da Ficha de Personagem**  
> **Fonte Original:** `modelo-ficha.pdf`  
> **Dimensões do Documento:** Formato A4 Vertical ($595.5 \times 842.25$ pontos / proporção $1:\sqrt{2}$)  
> **Total de Campos Interativos no PDF:** 64 campos de anotação (54 campos de texto `/Tx` e 10 botões de seleção `/Btn`)

---

## 1. Identidade Visual e Arquitetura Geral

A ficha de *Mitos do Caos RPG* apresenta uma estética moderna de **horror cósmico e ocultismo místico**, combinando:
- **Plano de Fundo:** Cinza neutro intermediário (`#7B7B7B`), servindo como base de contraste suave.
- **Campos de Entrada (Pílulas e Caixas):** Formas arredondadas e sólidas em preto profundo (`#000000`) para a maioria dos campos do jogador, com textos contrastantes em branco. Os três campos de **Elementos** destacam-se em branco puro (`#FFFFFF`) com textos pretos.
- **Tipografia Temática:** Tipografia estilizada no estilo Art Déco / Grimório Ocultista, caracterizada por traços geométricos alongados e círculos pontilhados no interior de letras circulares como 'O', 'D' e 'Q'.
- **Elementos Iconográficos Centrais:**
  - O **Octograma do Caos** (estrela de 8 pontas com flechas direcionais) no canto superior esquerdo conectado à barra do nome.
  - As **Mãos do Caos** no centro da página: a Mão Esquerda Negra (**Terminus** - polaridade kármica/negativa) e a Mão Direita Branca (**Gênesis** - polaridade mântrica/positiva), cujos dedos contêm seletores circulares marcados de $I$ a $V$.

---

## 2. Mapa Estrutural dos Blocos Visuais

```
+-----------------------------------------------------------------------------------+
| [Octograma + Text77] -> [======== NOME (Text7) ========]  [ATUAÇÃO] [CAMINHO]    |
|                                                          [KARMA]   [NÍVEL PESSOAL]|
+-----------------------------------------------------------------------------------+
|  [FORÇA]    [INTELIGÊNCIA]    [AGILIDADE]    [VITALIDADE]    [APARÊNCIA] [INSTINTO]|
|  (Text12)      (Text13)         (Text14)       (Text15)        (Text16)   (Text17)|
+-----------------------------------------------------------------------------------+
|  [ESFORÇO]     [MENTE]        [DESTREZA]    [RESISTÊNCIA]     [SOCIAL]   [SENTIDOS]|
|  (Text78)      (Text22)         (Text21)       (Text20)        (Text19)   (Text18)|
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  [VIDA]             (MÃO ESQUERDA)             (MÃO DIREITA)        [ELEMENTO 1]  |
|  (Text29)              TERMINUS                   GÊNESIS             (Text23)    |
|                      (Mão Negra -)             (Mão Branca +)                     |
|  [SANIDADE]        Dedos I, II, III, IV, V    Dedos I, II, III, IV, V [ELEMENTO 2]  |
|  (Text28)          (Btn68,69,70,71,74)        (Btn65,64,63,62,61)     (Text24)    |
|                                                                                   |
|  [AKASHA]                                                           [ELEMENTO 3]  |
|  (Text27)                                                             (Text26)    |
+-----------------------------------------------------------------------------------+
|    HABILIDADES DE ATUAÇÃO (3 linhas)      |    HABILIDADES DO CAMINHO (3 linhas)  |
|    [NOME]     [DESCRIÇÃO]     [CUSTO]     |    [NOME]     [DESCRIÇÃO]     [CUSTO] |
|    (Text30)    (Text31)       (Text32)    |    (Text40)    (Text43)       (Text46)|
|    (Text33)    (Text35)       (Text36)    |    (Text41)    (Text44)       (Text47)|
|    (Text37)    (Text38)       (Text39)    |    (Text42)    (Text45)       (Text48)|
+-----------------------------------------------------------------------------------+
|                            TABELA DE INVENTÁRIO (3 linhas)                        |
|       [NOME]              [DESCRIÇÃO]              [DANO/CURA]         [PESO]     |
|      (Text60)              (Text57)                  (Text54)         (Text49)    |
|      (Text59)              (Text56)                  (Text53)         (Text50)    |
|      (Text58)              (Text55)                  (Text52)         (Text51)    |
+-----------------------------------------------------------------------------------+
```

---

## 3. Decomposição Detalhada dos Campos

### Bloco 1: Cabeçalho de Identidade e Metadados (Topo)

Disposto horizontalmente na parte superior da página, das coordenadas verticais $Y = 762$ a $Y = 833$.

| Identificador PDF | Rótulo Visual | Tipo de Campo | Natureza do Dado | Comportamento e Regras |
| :--- | :--- | :---: | :---: | :--- |
| `Text77` | *Ícone Central do Caos* | Texto (`/Tx`) | **Preenchido pelo Jogador** | Caixa de $27 \times 27$ pt no coração do octograma do caos. Usado para avatar, sigilo pessoal, inicial ou símbolo do personagem. |
| `Text7` | **NOME** | Texto (`/Tx`) | **Preenchido pelo Jogador** | Linha principal de identificação do personagem. |
| `Text8` | **ATUAÇÃO** | Texto (`/Tx`) | **Preenchido pelo Jogador** *(Menu Seleção)* | Escolha de uma das 5 Atuações (*Célere, Idealizador, Pilar, Apostador, Versado*). **Gatilho de automação:** altera as fórmulas de cálculo de Vida e Sanidade. |
| `Text9` | **CAMINHO** | Texto (`/Tx`) | **Preenchido pelo Jogador** *(Menu Seleção)* | Escolha do Caminho divino patrono (ex.: *Loki, Thor, Freya, Seth, Rá, Ares, Apolo, Athena, Susanoo, Tsukuyomi, Kannon*). **Gatilho de automação:** preenche os Elementos 1, 2 e 3 e sugere as habilidades de caminho. |
| `Text10` | **KARMA ATUAL** | Texto (`/Tx`) | **Preenchido pelo Jogador** *(Seletor)* | Estado de Karma da cena: `Positivo (+)` / `Neutro (0)` / `Negativo (-)`. Inicia em `Neutro`. Altera dinamicamente as rolagens dos Dados do Caos (D8). |
| `Text11` | **NÍVEL PESSOAL** | Texto (`/Tx`) | **Preenchido pelo Jogador** *(Numérico)* | Nível do personagem ($1$ a $8$). **Gatilho de automação:** recalcula Vida Máxima, Sanidade Máxima e Akasha Máximo. |

---

### Bloco 2: Atributos Primários (Fileira 1)

Fileira de 6 pílulas pretas idênticas ($Y \approx 668$ a $691$ pt), cada uma com o nome do atributo impresso logo acima em tipografia característica.

| Identificador PDF | Atributo | Tipo | Natureza do Dado | Comportamento e Regras |
| :--- | :--- | :---: | :---: | :--- |
| `Text12` | **FORÇA** | Texto (`/Tx`) | **Preenchido pelo Jogador** | Seleção do dado ($D4, D6, D10, D12$). |
| `Text13` | **INTELIGÊNCIA** | Texto (`/Tx`) | **Preenchido pelo Jogador** | Seleção do dado ($D4, D6, D10, D12$). **Gera a variável de Sanidade** ($\text{INT}_{\text{Max}}$ e $\text{INT}_{\text{Half}}$). |
| `Text14` | **AGILIDADE** | Texto (`/Tx`) | **Preenchido pelo Jogador** | Seleção do dado ($D4, D6, D10, D12$). |
| `Text15` | **VITALIDADE** | Texto (`/Tx`) | **Preenchido pelo Jogador** | Seleção do dado ($D4, D6, D10, D12$). **Gera a variável de Vida** ($\text{VIT}_{\text{Max}}$ e $\text{VIT}_{\text{Half}}$). |
| `Text16` | **APARÊNCIA** | Texto (`/Tx`) | **Preenchido pelo Jogador** | Seleção do dado ($D4, D6, D10, D12$). |
| `Text17` | **INSTINTO** | Texto (`/Tx`) | **Preenchido pelo Jogador** | Seleção do dado ($D4, D6, D10, D12$). |

> [!IMPORTANT]
> **Validação de Criação de Personagem:** A aplicação deve garantir que os valores iniciais alocados entre esses 6 campos sejam exatamente:
> $$\{ 1 \times D10,\ 2 \times D6,\ 3 \times D4 \}$$

---

### Bloco 3: Perícias Gerais (Fileira 2)

Fileira de 6 pílulas pretas idênticas ($Y \approx 593$ a $617$ pt), alinhadas perfeitamente abaixo dos atributos correspondentes.

| Identificador PDF | Perícia | Tipo | Natureza do Dado | Comportamento e Regras |
| :--- | :--- | :---: | :---: | :--- |
| `Text78` | **ESFORÇO** | Texto (`/Tx`) | **Preenchido pelo Jogador** | Seleção do dado ($D4, D6, D10, D12$). Usado para ataques de impacto/força. |
| `Text22` | **MENTE** | Texto (`/Tx`) | **Preenchido pelo Jogador** | Seleção do dado ($D4, D6, D10, D12$). Usado para investigação e raciocínio. |
| `Text21` | **DESTREZA** | Texto (`/Tx`) | **Preenchido pelo Jogador** | Seleção do dado ($D4, D6, D10, D12$). Usado para ataques ágeis e esquiva. |
| `Text20` | **RESISTÊNCIA** | Texto (`/Tx`) | **Preenchido pelo Jogador** | Seleção do dado ($D4, D6, D10, D12$). Usado para esquiva/fortitude física. |
| `Text19` | **SOCIAL** | Texto (`/Tx`) | **Preenchido pelo Jogador** | Seleção do dado ($D4, D6, D10, D12$). Usado para persuasão e manipulação. |
| `Text18` | **SENTIDOS** | Texto (`/Tx`) | **Preenchido pelo Jogador** | Seleção do dado ($D4, D6, D10, D12$). Usado para percepção e intuição. |

> [!IMPORTANT]
> **Validação de Criação de Personagem:** A aplicação deve garantir que os valores iniciais alocados entre essas 6 perícias sejam exatamente:
> $$\{ 4 \times D6,\ 2 \times D4 \}$$

---

### Bloco 4: Núcleo Central de Status, Nível de Mão e Elementos

Localizado na faixa intermediária da página ($Y \approx 409$ a $557$ pt), este bloco organiza o coração mecânico do personagem em três seções:

#### Subseção 4A: Status Vitais (Esquerda)

Três pílulas pretas empilhadas verticalmente no lado esquerdo da página:

| Identificador PDF | Status | Tipo | Natureza do Dado | Comportamento e Fórmulas de Cálculo Automático |
| :--- | :--- | :---: | :---: | :--- |
| `Text29` | **VIDA** | Texto (`/Tx`) | **Calculado Automaticamente** *(com controle de Atual/Máximo)* | **Vida Máxima** calculada pela fórmula da Atuação + Nível Pessoal + Vitalidade:<br>$\bullet$ *Célere:* $(12 + \text{VIT}_{\text{Max}}) + (N - 1)(4 + \text{VIT}_{\text{Half}})$<br>$\bullet$ *Idealizador:* $(8 + \text{VIT}_{\text{Max}}) + (N - 1)(2 + \text{VIT}_{\text{Half}})$<br>$\bullet$ *Pilar / Versado:* $(10 + \text{VIT}_{\text{Max}}) + (N - 1)(3 + \text{VIT}_{\text{Half}})$<br>$\bullet$ *Apostador:* $(8 + \text{VIT}_{\text{Max}}) + (N - 1)(2 + \text{VIT}_{\text{Half}})$<br>*(Soma bônus da runa Heiwaz $+10$ se equipada).*<br>O jogador manipula a **Vida Atual** durante as sessões. |
| `Text28` | **SANIDADE** | Texto (`/Tx`) | **Calculado Automaticamente** *(com controle de Atual/Máximo)* | **Sanidade Máxima** (Equilíbrio) calculada pela fórmula da Atuação + Nível Pessoal + Inteligência:<br>$\bullet$ *Célere / Apostador:* $(8 + \text{INT}_{\text{Max}}) + (N - 1)(2 + \text{INT}_{\text{Half}})$<br>$\bullet$ *Idealizador:* $(12 + \text{INT}_{\text{Max}}) + (N - 1)(4 + \text{INT}_{\text{Half}})$<br>$\bullet$ *Pilar / Versado:* $(10 + \text{INT}_{\text{Max}}) + (N - 1)(3 + \text{INT}_{\text{Half}})$<br>*(Soma bônus da runa Algiz $+10$ se equipada).*<br>O jogador manipula a **Sanidade Atual** durante as sessões. |
| `Text27` | **AKASHA** | Texto (`/Tx`) | **Calculado Automaticamente** *(com controle de Atual/Máximo)* | **Akasha Máximo** calculado a partir do Nível Pessoal:<br>$\bullet$ Nível 1: $2$ pontos.<br>$\bullet$ Ganho: $+1$ ponto a cada nível ímpar (ou nível par conforme tabela).<br>*(Soma bônus da runa Thaan $+2$ se equipada).*<br>O jogador gasta e recupera pontos de **Akasha Atual**. |

---

#### Subseção 4B: Nível de Mão — As Mãos do Caos (Centro)

Composta visualmente por duas grandes mãos humanas voltadas para a frente:
- **Mão Esquerda (Preta):** Contém um sinal de subtração ($-$) na palma e o nome `TERMINUS` logo abaixo. Representa a inclinação para o Karma e o Caos destrutivo.
- **Mão Direita (Branca):** Contém um sinal de adição ($+$) na palma e o nome `GÊNESIS` logo abaixo. Representa a inclinação para o Mantra e a Ordem regenerativa.
- Na ponta de cada dedo, existe um botão de seleção circular (`/Btn`) encimado por um algarismo romano correspondente ao nível de evolução ($I$ a $V$):

| Identificador PDF | Mão / Polaridade | Dedo / Posição | Nível | Tipo | Regra de Automação e Validação |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `Button68` | **Terminus (-)** | Polegar | **I** | Botão (`/Btn`) | **Preenchido pelo Jogador.** Ao ser ativado, **bloqueia automaticamente Gênesis V** (`Button61`). Concede $+1$ passo em atributo/perícia e $-1$ no resultado das rolagens de Karma. |
| `Button69` | **Terminus (-)** | Indicador | **II** | Botão (`/Btn`) | **Preenchido pelo Jogador.** Ao ser ativado, **bloqueia automaticamente Gênesis IV** (`Button62`). Inverte efeito negativo 1x por cena (número 8 do Mantra vira negativo). |
| `Button70` | **Terminus (-)** | Médio | **III** | Botão (`/Btn`) | **Preenchido pelo Jogador.** Nível avançado (expansão futura). |
| `Button71` | **Terminus (-)** | Anelar | **IV** | Botão (`/Btn`) | **Preenchido pelo Jogador.** Bloqueado se Gênesis II estiver marcado. |
| `Button74` | **Terminus (-)** | Mínimo | **V** | Botão (`/Btn`) | **Preenchido pelo Jogador.** Bloqueado se Gênesis I estiver marcado. |
| `Button65` | **Gênesis (+)** | Polegar | **I** | Botão (`/Btn`) | **Preenchido pelo Jogador.** Ao ser ativado, **bloqueia automaticamente Terminus V** (`Button74`). Concede $+1$ passo em atributo/perícia e $+1$ no resultado das rolagens de Mantra. |
| `Button64` | **Gênesis (+)** | Indicador | **II** | Botão (`/Btn`) | **Preenchido pelo Jogador.** Ao ser ativado, **bloqueia automaticamente Terminus IV** (`Button71`). Permite rerrolar dado de Mantra 1x por cena (número 8 do Karma tem efeito dobrado). |
| `Button63` | **Gênesis (+)** | Médio | **III** | Botão (`/Btn`) | **Preenchido pelo Jogador.** Nível avançado (expansão futura). |
| `Button62` | **Gênesis (+)** | Anelar | **IV** | Botão (`/Btn`) | **Preenchido pelo Jogador.** Bloqueado se Terminus II estiver marcado. |
| `Button61` | **Gênesis (+)** | Mínimo | **V** | Botão (`/Btn`) | **Preenchido pelo Jogador.** Bloqueado se Terminus I estiver marcado. |

> [!IMPORTANT]
> **Validação de Nível de Mão:** O somatório de todos os níveis marcados em ambas as mãos não pode exceder o total permitido pelo Nível Pessoal ($1$ nível de mão no Nv 4, $2$ níveis de mão no Nv 8; teto absoluto de $5$ níveis).

---

#### Subseção 4C: Tríade Elemental (Direita)

Três pílulas brancas (`#FFFFFF`) com bordas suaves e rótulo preto impresso acima:

| Identificador PDF | Rótulo Visual | Tipo | Natureza do Dado | Comportamento e Regras |
| :--- | :--- | :---: | :---: | :--- |
| `Text23` | **ELEMENTO 1** | Texto (`/Tx`) | **Calculado Automaticamente** *(com override manual)* | Primeiro elemento base do personagem. Preenchido automaticamente a partir da escolha do **Caminho** (ex.: *Thor $\rightarrow$ Fogo*). |
| `Text24` | **ELEMENTO 2** | Texto (`/Tx`) | **Calculado Automaticamente** *(com override manual)* | Segundo elemento base do personagem. Preenchido automaticamente a partir da escolha do **Caminho** (ex.: *Thor $\rightarrow$ Ar*). |
| `Text26` | **ELEMENTO 3** | Texto (`/Tx`) | **Calculado Automaticamente** *(com override manual)* | Elemento divino de fusão. Preenchido automaticamente a partir da fusão canônica do Deus patrono (ex.: *Fogo + Ar = Raio*). |

---

### Bloco 5: Tabelas de Habilidades (Lado a Lado)

Duas tabelas com 3 colunas e 3 linhas cada, dispostas paralelamente ($Y \approx 188$ a $333$ pt):

#### Tabela 5A: HABILIDADES DE ATUAÇÃO (Esquerda)
- **Cabeçalhos:** `NOME` | `DESCRIÇÃO` | `CUSTO`
- **Comportamento no Sistema:**
  - *Linha 1:* Preenchida automaticamente com a habilidade inata de nível 1 da Atuação escolhida (*Intervir, Vínculo, Estoque, Roleta ou Companhia*).
  - *Linha 2 e Linha 3:* Preenchidas ou sugeridas nos níveis 3 e 6 conforme o jogador evolui, permitindo edição livre de texto.

| Linha | Campo: NOME | Campo: DESCRIÇÃO | Campo: CUSTO | Natureza |
| :---: | :--- | :--- | :--- | :--- |
| **1** | `Text30` | `Text31` | `Text32` | **Calculado / Preenchido Automaticamente** *(editável)* |
| **2** | `Text33` | `Text35` | `Text36` | **Preenchido pelo Jogador / Automático no Nv 3** |
| **3** | `Text37` | `Text38` | `Text39` | **Preenchido pelo Jogador / Automático no Nv 6** |

#### Tabela 5B: HABILIDADES DO CAMINHO (Direita)
- **Cabeçalhos:** `NOME` | `DESCRIÇÃO` | `CUSTO`
- **Comportamento no Sistema:**
  - *Linha 1:* Preenchida automaticamente no nível 2 com a habilidade de Nv 2 do Caminho escolhido (ex.: *Trollei, Restaurar, Reposicionar, Barragem, Flashbang, etc.*).
  - *Linha 2:* Preenchida automaticamente no nível 5 com a habilidade de Nv 5 do Caminho escolhido.
  - *Linha 3:* Preenchida automaticamente no nível 8 com uma das habilidades de Nv 8 do Caminho escolhido.

| Linha | Campo: NOME | Campo: DESCRIÇÃO | Campo: CUSTO | Natureza |
| :---: | :--- | :--- | :--- | :--- |
| **1** | `Text40` | `Text43` | `Text46` | **Calculado / Preenchido Automaticamente** *(editável)* |
| **2** | `Text41` | `Text44` | `Text47` | **Calculado / Preenchido Automaticamente** *(editável)* |
| **3** | `Text42` | `Text45` | `Text48` | **Calculado / Preenchido Automaticamente** *(editável)* |

---

### Bloco 6: Tabela de Inventário (Rodapé)

Tabela ampla com 4 colunas e 3 linhas, localizada na base da folha ($Y \approx 34$ a $170$ pt):
- **Cabeçalhos:** `NOME` | `DESCRIÇÃO` | `DANO/CURA` | `PESO`

| Linha | Campo: NOME | Campo: DESCRIÇÃO | Campo: DANO/CURA | Campo: PESO | Natureza dos Campos |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **1** | `Text60` | `Text57` | `Text54` | `Text49` | **Preenchido pelo Jogador** |
| **2** | `Text59` | `Text56` | `Text53` | `Text50` | **Preenchido pelo Jogador** |
| **3** | `Text58` | `Text55` | `Text52` | `Text51` | **Preenchido pelo Jogador** |

#### Automações Adicionais no Aplicativo Web:
1. **Soma Automática de Carga:** Um indicador numérico dinâmico somará os valores dos campos de peso (`Text49 + Text50 + Text51`).
2. **Integração de Bônus de Itens:**
   - Se o jogador equipar uma **Arma**, o sistema aplica automaticamente $+1$ passo no ataque e $+1$ no dano.
   - Se equipar um **Item Suporte** de Vida ($+5$), Sanidade ($+5$) ou Dano ($+1D4$), os status vitais recalculam o bônus em tempo real.

---

## 4. Tabela de Mapeamento Técnico Completo dos 64 Campos do PDF

A tabela abaixo lista todas as 64 anotações interativas inspecionadas internamente em `modelo-ficha.pdf`, ordenadas por posição vertical (de cima para baixo na folha):

| ID do Campo | Tipo | Subtipo | Bounding Box PDF $[x_0, y_0, x_1, y_1]$ | Seção / Rótulo Visual | Regra de Preenchimento |
| :--- | :---: | :---: | :---: | :--- | :--- |
| `Text77` | `/Tx` | Texto | `[51.0, 762.2, 77.9, 789.1]` | Topo: Centro do Octograma do Caos | Preenchido pelo Jogador |
| `Text7` | `/Tx` | Texto | `[97.5, 771.7, 236.3, 786.0]` | Topo: NOME | Preenchido pelo Jogador |
| `Text8` | `/Tx` | Texto | `[271.4, 767.8, 312.1, 786.4]` | Topo: ATUAÇÃO | Preenchido pelo Jogador |
| `Text9` | `/Tx` | Texto | `[348.6, 767.4, 388.9, 786.9]` | Topo: CAMINHO | Preenchido pelo Jogador |
| `Text10` | `/Tx` | Texto | `[425.7, 767.8, 466.0, 786.4]` | Topo: KARMA ATUAL | Preenchido pelo Jogador |
| `Text11` | `/Tx` | Texto | `[502.9, 767.8, 543.6, 787.7]` | Topo: NÍVEL PESSOAL | Preenchido pelo Jogador |
| `Text12` | `/Tx` | Texto | `[83.7, 668.1, 110.7, 691.0]` | Atributos: FORÇA | Preenchido pelo Jogador |
| `Text13` | `/Tx` | Texto | `[157.4, 668.1, 184.3, 691.1]` | Atributos: INTELIGÊNCIA | Preenchido pelo Jogador |
| `Text14` | `/Tx` | Texto | `[241.5, 668.5, 267.9, 691.5]` | Atributos: AGILIDADE | Preenchido pelo Jogador |
| `Text15` | `/Tx` | Texto | `[320.8, 668.1, 347.7, 690.6]` | Atributos: VITALIDADE | Preenchido pelo Jogador |
| `Text16` | `/Tx` | Texto | `[401.4, 668.5, 428.8, 691.9]` | Atributos: APARÊNCIA | Preenchido pelo Jogador |
| `Text17` | `/Tx` | Texto | `[475.6, 667.2, 503.8, 691.5]` | Atributos: INSTINTO | Preenchido pelo Jogador |
| `Text78` | `/Tx` | Texto | `[82.2, 591.4, 111.5, 616.4]` | Perícias: ESFORÇO | Preenchido pelo Jogador |
| `Text22` | `/Tx` | Texto | `[156.9, 594.0, 182.9, 616.5]` | Perícias: MENTE | Preenchido pelo Jogador |
| `Text21` | `/Tx` | Texto | `[241.5, 593.1, 268.4, 617.8]` | Perícias: DESTREZA | Preenchido pelo Jogador |
| `Text20` | `/Tx` | Texto | `[320.8, 594.4, 347.7, 617.8]` | Perícias: RESISTÊNCIA | Preenchido pelo Jogador |
| `Text19` | `/Tx` | Texto | `[401.9, 594.4, 428.3, 617.8]` | Perícias: SOCIAL | Preenchido pelo Jogador |
| `Text18` | `/Tx` | Texto | `[476.4, 594.0, 503.3, 616.5]` | Perícias: SENTIDOS | Preenchido pelo Jogador |
| `Text29` | `/Tx` | Texto | `[100.6, 519.8, 140.5, 539.8]` | Status: VIDA | **Calculado Automaticamente** |
| `Button70` | `/Btn` | Botão | `[213.7, 543.9, 224.6, 552.8]` | Mão Esquerda: Terminus III | Preenchido pelo Jogador |
| `Button63` | `/Btn` | Botão | `[370.2, 543.7, 380.6, 552.8]` | Mão Direita: Gênesis III | Preenchido pelo Jogador |
| `Button69` | `/Btn` | Botão | `[235.8, 536.4, 245.8, 545.0]` | Mão Esquerda: Terminus II | Preenchido pelo Jogador |
| `Button64` | `/Btn` | Botão | `[348.6, 536.3, 359.4, 545.4]` | Mão Direita: Gênesis II | Preenchido pelo Jogador |
| `Button71` | `/Btn` | Botão | `[190.6, 527.1, 201.1, 536.9]` | Mão Esquerda: Terminus IV | Preenchido pelo Jogador |
| `Button62` | `/Btn` | Botão | `[394.1, 527.2, 404.5, 536.7]` | Mão Direita: Gênesis IV | Preenchido pelo Jogador |
| `Text23` | `/Tx` | Texto | `[448.3, 519.8, 490.3, 540.2]` | Elementos: ELEMENTO 1 | **Calculado Automaticamente** |
| `Button74` | `/Btn` | Botão | `[165.7, 500.0, 176.0, 509.0]` | Mão Esquerda: Terminus V | Preenchido pelo Jogador |
| `Button61` | `/Btn` | Botão | `[417.1, 499.0, 428.8, 509.0]` | Mão Direita: Gênesis V | Preenchido pelo Jogador |
| `Button68` | `/Btn` | Botão | `[277.5, 480.4, 287.9, 489.5]` | Mão Esquerda: Terminus I | Preenchido pelo Jogador |
| `Button65` | `/Btn` | Botão | `[306.5, 480.4, 317.3, 490.3]` | Mão Direita: Gênesis I | Preenchido pelo Jogador |
| `Text28` | `/Tx` | Texto | `[64.2, 466.1, 104.9, 485.6]` | Status: SANIDADE | **Calculado Automaticamente** |
| `Text24` | `/Tx` | Texto | `[490.3, 463.9, 531.1, 484.7]` | Elementos: ELEMENTO 2 | **Calculado Automaticamente** |
| `Text27` | `/Tx` | Texto | `[99.7, 409.7, 140.0, 429.6]` | Status: AKASHA | **Calculado Automaticamente** |
| `Text26` | `/Tx` | Texto | `[448.7, 409.7, 489.9, 429.6]` | Elementos: ELEMENTO 3 | **Calculado Automaticamente** |
| `Text30` | `/Tx` | Texto | `[28.2, 258.0, 81.1, 286.6]` | Hab. Atuação L1: NOME | **Calculado / Preenchido** |
| `Text31` | `/Tx` | Texto | `[83.7, 257.1, 219.4, 287.4]` | Hab. Atuação L1: DESCRIÇÃO | **Calculado / Preenchido** |
| `Text32` | `/Tx` | Texto | `[221.5, 257.5, 277.0, 287.9]` | Hab. Atuação L1: CUSTO | **Calculado / Preenchido** |
| `Text40` | `/Tx` | Texto | `[318.2, 256.7, 373.3, 287.9]` | Hab. Caminho L1: NOME | **Calculado / Preenchido** |
| `Text43` | `/Tx` | Texto | `[374.6, 256.7, 511.6, 287.9]` | Hab. Caminho L1: DESCRIÇÃO | **Calculado / Preenchido** |
| `Text46` | `/Tx` | Texto | `[512.9, 257.5, 568.8, 289.2]` | Hab. Caminho L1: CUSTO | **Calculado / Preenchido** |
| `Text33` | `/Tx` | Texto | `[27.8, 223.7, 81.9, 253.6]` | Hab. Atuação L2: NOME | Preenchido pelo Jogador |
| `Text35` | `/Tx` | Texto | `[84.1, 223.3, 220.2, 253.6]` | Hab. Atuação L2: DESCRIÇÃO | Preenchido pelo Jogador |
| `Text36` | `/Tx` | Texto | `[221.1, 222.8, 277.9, 253.6]` | Hab. Atuação L2: CUSTO | Preenchido pelo Jogador |
| `Text41` | `/Tx` | Texto | `[317.8, 223.3, 373.3, 254.9]` | Hab. Caminho L2: NOME | **Calculado / Preenchido** |
| `Text44` | `/Tx` | Texto | `[374.6, 223.3, 510.7, 253.6]` | Hab. Caminho L2: DESCRIÇÃO | **Calculado / Preenchido** |
| `Text47` | `/Tx` | Texto | `[511.6, 222.8, 568.8, 253.2]` | Hab. Caminho L2: CUSTO | **Calculado / Preenchido** |
| `Text37` | `/Tx` | Texto | `[26.9, 189.0, 83.2, 221.6]` | Hab. Atuação L3: NOME | Preenchido pelo Jogador |
| `Text38` | `/Tx` | Texto | `[84.5, 189.0, 220.7, 221.1]` | Hab. Atuação L3: DESCRIÇÃO | Preenchido pelo Jogador |
| `Text39` | `/Tx` | Texto | `[221.1, 189.5, 277.9, 220.7]` | Hab. Atuação L3: CUSTO | Preenchido pelo Jogador |
| `Text42` | `/Tx` | Texto | `[317.3, 189.0, 374.6, 221.6]` | Hab. Caminho L3: NOME | **Calculado / Preenchido** |
| `Text45` | `/Tx` | Texto | `[374.6, 188.6, 511.1, 221.6]` | Hab. Caminho L3: DESCRIÇÃO | **Calculado / Preenchido** |
| `Text48` | `/Tx` | Texto | `[511.6, 188.2, 569.2, 220.7]` | Hab. Caminho L3: CUSTO | **Calculado / Preenchido** |
| `Text60` | `/Tx` | Texto | `[26.4, 93.2, 125.7, 118.8]` | Inventário L1: NOME | Preenchido pelo Jogador |
| `Text57` | `/Tx` | Texto | `[126.2, 93.7, 366.8, 119.7]` | Inventário L1: DESCRIÇÃO | Preenchido pelo Jogador |
| `Text54` | `/Tx` | Texto | `[366.3, 91.9, 468.6, 118.8]` | Inventário L1: DANO/CURA | Preenchido pelo Jogador |
| `Text49` | `/Tx` | Texto | `[468.6, 92.4, 569.2, 119.7]` | Inventário L1: PESO | Preenchido pelo Jogador |
| `Text59` | `/Tx` | Texto | `[27.3, 62.4, 125.7, 89.8]` | Inventário L2: NOME | Preenchido pelo Jogador |
| `Text56` | `/Tx` | Texto | `[127.0, 64.2, 366.3, 91.1]` | Inventário L2: DESCRIÇÃO | Preenchido pelo Jogador |
| `Text53` | `/Tx` | Texto | `[367.2, 63.8, 467.8, 91.1]` | Inventário L2: DANO/CURA | Preenchido pelo Jogador |
| `Text50` | `/Tx` | Texto | `[468.6, 63.8, 569.6, 88.9]` | Inventário L2: PESO | Preenchido pelo Jogador |
| `Text58` | `/Tx` | Texto | `[26.4, 35.1, 125.3, 61.6]` | Inventário L3: NOME | Preenchido pelo Jogador |
| `Text55` | `/Tx` | Texto | `[126.2, 34.3, 366.8, 61.6]` | Inventário L3: DESCRIÇÃO | Preenchido pelo Jogador |
| `Text52` | `/Tx` | Texto | `[367.2, 35.6, 467.8, 61.1]` | Inventário L3: DANO/CURA | Preenchido pelo Jogador |
| `Text51` | `/Tx` | Texto | `[468.2, 34.7, 569.2, 62.9]` | Inventário L3: PESO | Preenchido pelo Jogador |
