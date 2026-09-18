# Formulário da aula EscalaMed

Landing page para solicitar a aula gratuita Sucesso do Cliente na Clínica. O visitante informa nome, e-mail, WhatsApp e Instagram; em seguida, vê a confirmação do pedido enquanto o cadastro é enviado ao funil `funil_ganchos` do Metrics em segundo plano. A equipe comercial entra em contato pelo WhatsApp informado para encaminhar o acesso à aula.

## Desenvolvimento

```bash
npm install
cp .env.example .env.local
npm run dev
```

Preencha `METRICS_API_KEY` em `.env.local`. Em produção, configure a mesma variável nas configurações do projeto Vercel. `METRICS_FUNNEL_ID` evita uma consulta por nome, mas a integração também funciona sem ele.

## Verificação

```bash
npm run lint
npm run typecheck
npm run build
```

A chave do Metrics fica somente no servidor. Se o cadastro falhar, a tela informa o erro e permite tentar novamente.
