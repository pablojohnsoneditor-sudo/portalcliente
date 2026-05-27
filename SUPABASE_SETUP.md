# Configuração do Supabase

## 1. Criar o projeto
1. Acesse https://supabase.com → crie uma conta gratuita
2. Clique em **New project**
3. Nome: `portal-cliente` · defina uma senha forte · escolha região mais próxima (South America - São Paulo)
4. Aguarde ~2 min

## 2. Criar a tabela (SQL Editor)
1. No painel, vá em **SQL Editor** → **New query**
2. Cole e execute:

```sql
CREATE TABLE demands (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  type          TEXT        NOT NULL,
  client_name   TEXT        NOT NULL,
  subtype       TEXT,
  details       JSONB       DEFAULT '{}',
  status        TEXT        DEFAULT 'pendente',
  scheduled_date DATE,
  scheduled_time TIME,
  assigned_to   TEXT,
  internal_notes TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Desativar RLS (app privado, acesso por link)
ALTER TABLE demands DISABLE ROW LEVEL SECURITY;

-- Ativar tempo real
ALTER PUBLICATION supabase_realtime ADD TABLE demands;
```

## 3. Copiar as credenciais
1. **Settings** → **API**
2. Copie:
   - **Project URL** → `https://xxxx.supabase.co`
   - **anon public** → `eyJhbGci...`

## 4. Configurar o projeto
Abra `F:\portal-cliente\.env.local` e substitua:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

## 5. Reiniciar o servidor
```
npm run dev -- --port 5177
```

---
Pronto! O calendário fica sincronizado em tempo real para todos os usuários.
