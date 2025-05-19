const express = require('express');
const { Client } = require('pg');
const cors = require('cors');
const dbConfig = require('./db.config');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Rota para listar todos os clientes
app.get('/clientes', async (req, res) => {
  const client = new Client(dbConfig);
  try {
    await client.connect();
    const result = await client.query('SELECT id, nomeCompleto FROM clientes');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Erro ao listar clientes:', err);
    res.status(500).json({ error: 'Erro ao listar clientes' });
  } finally {
    await client.end();
  }
});

// Rota para cadastrar um cliente
app.post('/clientes', async (req, res) => {
  const client = new Client(dbConfig);
  try {
    await client.connect();
    const { nomeCompleto, telefone, email, observacoes } = req.body;
    const result = await client.query(
      'INSERT INTO clientes (nomeCompleto, telefone, email, observacoes) VALUES ($1, $2, $3, $4) RETURNING *',
      [nomeCompleto, telefone, email, observacoes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao cadastrar cliente:', err);
    res.status(500).json({ error: 'Erro ao cadastrar cliente' });
  } finally {
    await client.end();
  }
});

// Rota para agendar uma reserva
app.post('/reservas', async (req, res) => {
  const client = new Client(dbConfig);
  try {
    await client.connect();
    const { idCliente, dataReserva, horaReserva, servico, observacoesAgendamento } = req.body;
    const result = await client.query(
      'INSERT INTO reservas (idCliente, dataReserva, horaReserva, servico, observacoesAgendamento) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [idCliente, dataReserva, horaReserva, servico, observacoesAgendamento]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao agendar reserva:', err);
    res.status(500).json({ error: 'Erro ao agendar reserva' });
  } finally {
    await client.end();
  }
});

// Rota para listar todas as reservas
app.get('/reservas', async (req, res) => {
  const client = new Client(dbConfig);
  try {
    await client.connect();
    console.log("Tentando buscar reservas..."); // Adicionado log
    const result = await client.query('SELECT * FROM reservas');
    console.log("Reservas encontradas:", result.rows); // Adicionado log
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Erro ao listar reservas:', err);
    res.status(500).json({ error: 'Erro ao listar reservas' });
  } finally {
    await client.end();
  }
});

// Rota para confirmar uma reserva
app.patch('/reservas/:id/confirmar', async (req, res) => {
  const { id } = req.params;
  const client = new Client(dbConfig);
  try {
    await client.connect();
    const result = await client.query(
      'UPDATE reservas SET status = $1 WHERE id = $2 RETURNING *',
      ['Confirmada', id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reserva não encontrada' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao confirmar reserva:', err);
    res.status(500).json({ error: 'Erro ao confirmar reserva' });
  } finally {
    await client.end();
  }
});

// Rota para cancelar uma reserva
app.patch('/reservas/:id/cancelar', async (req, res) => {
  const { id } = req.params;
  const client = new Client(dbConfig);
  try {
    await client.connect();
    const result = await client.query(
      'UPDATE reservas SET status = $1 WHERE id = $2 RETURNING *',
      ['Cancelada', id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reserva não encontrada' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao cancelar reserva:', err);
    res.status(500).json({ error: 'Erro ao cancelar reserva' });
  } finally {
    await client.end();
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});