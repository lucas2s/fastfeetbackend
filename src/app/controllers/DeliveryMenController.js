import * as Yup from 'yup';
import DeliveryMen from '../models/DeliveryMen';

class DeliveryMenController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Falha na validação dos campos' });
    }

    const deliveryMan = await DeliveryMen.create(req.body);

    return res.json({
      deliveryMan,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Falha na validação dos campos' });
    }

    const { id } = req.params;

    const deliveryMan = await DeliveryMen.findByPk(id);

    if (!deliveryMan) {
      return res.status(400).json({ error: 'Entregador enviado Inválido' });
    }

    const deliveryManRes = await deliveryMan.update(req.body);

    return res.json({
      deliveryManRes,
    });
  }

  async delete(req, res) {
    const { id } = req.params;

    const deliveryMan = await DeliveryMen.findByPk(id);

    if (!deliveryMan) {
      return res.status(400).json({ error: 'Entregador enviado Inválido' });
    }

    await deliveryMan.destroy();

    return res.json({
      message: 'Entregador deletado com sucesso',
    });
  }

  async index(req, res) {
    const { page = 1 } = req.query;

    const deliveryMen = await DeliveryMen.findAll({
      limit: 10,
      offset: (page - 1) * 10,
    });

    if (!deliveryMen) {
      return res
        .status(400)
        .json({ error: 'Não foi encontrado nenhum entregador' });
    }

    return res.json({
      deliveryMen,
    });
  }
}

export default new DeliveryMenController();
