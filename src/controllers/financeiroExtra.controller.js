import * as service from '../services/financeiroExtra.service.js'
import pool from '../config/db.js'

export async function listarCategorias(req, res) {

  const data = await service.listarCategorias()
  res.json(data)

}

export async function criarCategoria(req, res) {

  const data = await service.criarCategoria(req.body)
  res.json(data)

}

export async function atualizarCategoria(req, res) {

  const data = await service.atualizarCategoria(
    req.params.id,
    req.body
  )

  res.json(data)

}

export async function removerCategoria(req, res) {

  await service.removerCategoria(req.params.id)
  res.json({ ok: true })

}

export async function listarMovimentacoes(req, res) {

  const data = await service.listarMovimentacoes(req.query)
  res.json(data)

}

/**
 * ============================
 * CRIAR MOVIMENTAÇÃO (DESPESA)
 * ============================
 */
export async function criarMovimentacao(req, res) {

  try {

    const data = await service.criarMovimentacao(req.body)

    const { valor, descricao } = req.body

    if (valor) {

      await pool.query(`
        INSERT INTO financeiro_movimentos
        (ordem_id, tipo, valor, descricao, usuario_id)
        VALUES (NULL, 'despesa', $1, $2, NULL)
      `, [
        valor,
        `DESPESA_ID:${data.id} ${descricao || ''}`
      ])

    }

    res.json(data)

  } catch (err) {

    console.error('Erro ao criar movimentação financeira:', err)
    res.status(500).json({ message: 'Erro ao registrar despesa' })

  }

}

/**
 * ============================
 * ATUALIZAR MOVIMENTAÇÃO
 * ============================
 */
export async function atualizarMovimentacao(req, res) {

  try {

    const id = req.params.id

    const data = await service.atualizarMovimentacao(
      id,
      req.body
    )

    const { valor, descricao } = req.body

    if (valor || descricao) {

      await pool.query(`
        UPDATE financeiro_movimentos
        SET
          valor = COALESCE($1, valor),
          descricao = COALESCE($2, descricao)
        WHERE descricao LIKE $3
      `, [
        valor,
        `DESPESA_ID:${id} ${descricao || ''}`,
        `DESPESA_ID:${id}%`
      ])

    }

    res.json(data)

  } catch (err) {

    console.error('Erro ao atualizar despesa:', err)
    res.status(500).json({ message: 'Erro ao atualizar despesa' })

  }

}

/**
 * ============================
 * REMOVER MOVIMENTAÇÃO
 * ============================
 */
export async function removerMovimentacao(req, res) {

  try {

    const id = req.params.id

    await pool.query(`
      DELETE FROM financeiro_movimentos
      WHERE descricao LIKE $1
    `, [`DESPESA_ID:${id}%`])

    await service.removerMovimentacao(id)

    res.json({ ok: true })

  } catch (err) {

    console.error('Erro ao remover despesa:', err)
    res.status(500).json({ message: 'Erro ao remover despesa' })

  }

}