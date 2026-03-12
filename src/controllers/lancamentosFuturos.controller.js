import * as service from '../services/lancamentosFuturos.service.js'

export async function listar(req,res){

  const data = await service.listarLancamentos(req.query.periodo)

  res.json(data)

}

export async function criar(req,res){

  const data = await service.criarLancamento(req.body)

  res.json(data)

}

export async function realizar(req,res){

  await service.realizarLancamento(req.params.id)

  res.json({ok:true})

}