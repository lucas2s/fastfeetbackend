import * as Yup from 'yup';
import DeliveryMan from '../models/DeliveryMan';

class DeliveryManController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().required(),
      avatar_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Falha na validação dos campos' });
    }

    const deliveryMan = await DeliveryMan.create(req.body);

    return res.json({
      deliveryMan,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string(),
      avatar_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Falha na validação dos campos' });
    }

    const { id } = req.params;

    const deliveryMan = await DeliveryMan.findByPk(id);

    if (!deliveryMan) {
      return res
        .status(400)
        .json({ error: 'Id do entregador enviado é inválido' });
    }

    const deliveryManRes = await deliveryMan.update(req.body);

    return res.json({
      deliveryManRes,
    });
  }

  async delete(req, res) {
    const { id } = req.params;

    const deliveryMan = await DeliveryMan.findByPk(id);

    if (!deliveryMan) {
      return res
        .status(400)
        .json({ error: 'Id do entregador enviado é inválido' });
    }

    await deliveryMan.destroy();

    return res.json({
      message: 'Entregador deletado com sucesso',
    });
  }

  async index(req, res) {
    const { page = 1 } = req.query;

    const deliveryMan = await DeliveryMan.findAll({
      limit: 10,
      offset: (page - 1) * 10,
    });

    if (deliveryMan.length < 1) {
      return res
        .status(400)
        .json({ error: 'Não foi encontrado nenhum entregador' });
    }

    return res.json({
      deliveryMan,
    });
  }
}

export default new DeliveryManController();