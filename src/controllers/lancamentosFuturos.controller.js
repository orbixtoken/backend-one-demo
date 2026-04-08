import * as service from '../services/lancamentosFuturos.service.js'


/* =========================
   LISTAR
========================= */

export async function listar(req, res) {

  try {

    const data = await service.listarLancamentos(req.query.periodo)

    res.json(data)

  } catch (err) {

    console.error('Erro ao listar lançamentos:', err)

    res.status(500).json({
      message: 'Erro ao listar lançamentos'
    })

  }

}


/* =========================
   CRIAR
========================= */

export async function criar(req, res) {

  try {

    const data = await service.criarLancamento(req.body)

    res.status(201).json(data)

  } catch (err) {

    console.error('Erro ao criar lançamento:', err)

    res.status(500).json({
      message: 'Erro ao criar lançamento'
    })

  }

}


/* =========================
   REALIZAR (PAGO / RECEBIDO)
========================= */

export async function realizar(req, res) {

  try {

    await service.realizarLancamento(req.params.id)

    res.json({
      ok: true,
      message: 'Lançamento realizado com sucesso'
    })

  } catch (err) {

    console.error('Erro ao realizar lançamento:', err)

    res.status(400).json({
      message: err.message
    })

  }

}


/* =========================
   DELETAR
========================= */

export async function deletar(req, res) {

  try {

    await service.deletarLancamento(req.params.id)

    res.json({
      ok: true,
      message: 'Lançamento excluído com sucesso'
    })

  } catch (err) {

    console.error('Erro ao deletar lançamento:', err)

    res.status(400).json({
      message: err.message
    })

  }

}